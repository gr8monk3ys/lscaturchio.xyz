import { NextRequest, NextResponse } from 'next/server';
import { searchEmbeddings } from '@/lib/embeddings';
import { withRateLimit } from '@/lib/with-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import type { EmbeddingResult, RelatedPost } from '@/types/embeddings';
import { getAllBlogs } from '@/lib/getAllBlogs';

/**
 * Enhanced related posts algorithm:
 * 1. Prioritize posts from the same series
 * 2. Find posts with matching tags
 * 3. Fallback to embedding similarity search
 * 4. Combine and rank by relevance
 */
const handleGet = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const title = searchParams.get('title');
    const currentUrl = searchParams.get('url');
    const limit = parseInt(searchParams.get('limit') || '3');

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Post title is required' },
        { status: 400 }
      );
    }

    const allBlogs = await getAllBlogs();
    const currentSlug = currentUrl?.split('/').pop() || '';
    const currentPost = allBlogs.find((blog) => blog.slug === currentSlug);

    const relatedPostsMap = new Map<string, RelatedPost & { score: number }>();

    // Strategy 1: Same series (highest priority)
    if (currentPost?.series) {
      const seriesPosts = allBlogs.filter(
        (blog) => blog.series === currentPost.series && blog.slug !== currentSlug
      );

      seriesPosts.forEach((post) => {
        relatedPostsMap.set(post.slug, {
          title: post.title,
          url: `/blog/${post.slug}`,
          description: post.description,
          date: post.date,
          image: post.image,
          similarity: 1.0,
          score: 100, // Highest score for same series
        });
      });
    }

    // Strategy 2: Matching tags (high priority)
    if (currentPost?.tags && currentPost.tags.length > 0) {
      allBlogs.forEach((blog) => {
        if (blog.slug === currentSlug || relatedPostsMap.has(blog.slug)) {
          return;
        }

        const matchingTags = blog.tags.filter((tag) =>
          currentPost.tags.includes(tag)
        );

        if (matchingTags.length > 0) {
          const tagScore = (matchingTags.length / currentPost.tags.length) * 50;
          relatedPostsMap.set(blog.slug, {
            title: blog.title,
            url: `/blog/${blog.slug}`,
            description: blog.description,
            date: blog.date,
            image: blog.image,
            similarity: tagScore / 50,
            score: tagScore,
          });
        }
      });
    }

    // Strategy 3: Embedding similarity (fallback)
    const embeddingResults = await searchEmbeddings(title, limit + 10);

    (embeddingResults as EmbeddingResult[]).forEach((result) => {
      const url = result.metadata?.url;
      if (!url || url === currentUrl) return;

      const slug = url.split('/').pop() || '';
      if (relatedPostsMap.has(slug)) {
        // Boost score with embedding similarity
        const existing = relatedPostsMap.get(slug)!;
        existing.score += (result.similarity || 0) * 30;
      } else {
        relatedPostsMap.set(slug, {
          title: result.metadata?.title || 'Untitled',
          url: result.metadata?.url || '',
          description: result.metadata?.description || '',
          date: result.metadata?.date || '',
          image: result.metadata?.image || '/images/blog/default.webp',
          similarity: result.similarity,
          score: (result.similarity || 0) * 30,
        });
      }
    });

    // Sort by score and return top N
    const relatedPosts = Array.from(relatedPostsMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ score, ...post }) => post); // Remove score from response

    return NextResponse.json({
      related: relatedPosts,
      count: relatedPosts.length,
    });
  } catch (error) {
    console.error('Related posts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related posts' },
      { status: 500 }
    );
  }
};

// Export with rate limiting (5 requests per minute)
export const GET = withRateLimit(handleGet, RATE_LIMITS.AI_HEAVY);
