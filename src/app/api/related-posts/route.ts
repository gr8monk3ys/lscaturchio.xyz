import { NextRequest } from 'next/server';
import { searchEmbeddings } from '@/lib/embeddings';
import { withRateLimit } from '@/lib/with-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { logError } from '@/lib/logger';
import type { EmbeddingResult, RelatedPost } from '@/types/embeddings';
import { getAllBlogs } from '@/lib/getAllBlogs';
import { apiSuccess, ApiErrors } from '@/lib/api-response';

/**
 * Related posts, semantic-first. The point of a garden is non-obvious
 * connections, so embedding similarity is the primary signal — not shared
 * tags. Order of influence:
 * 1. Same series (kept together by design)
 * 2. Semantic similarity over the post's title + description (primary)
 * 3. Shared tags — only a small tiebreak, and a fallback when embeddings are
 *    unavailable (no DB), so the section still works everywhere.
 */
const handleGet = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const title = searchParams.get('title');
    const currentUrl = searchParams.get('url');
    const parsedLimit = Number.parseInt(searchParams.get('limit') || '3', 10);
    const limit = Number.isNaN(parsedLimit)
      ? 3
      : Math.min(Math.max(parsedLimit, 1), 6);

    if (!title || typeof title !== 'string') {
      return ApiErrors.badRequest('Post title is required');
    }

    const allBlogs = await getAllBlogs();
    const currentSlug = currentUrl?.split('/').pop() || '';
    const currentPost = allBlogs.find((blog) => blog.slug === currentSlug);

    const relatedPostsMap = new Map<string, RelatedPost & { score: number }>();

    // Strategy 1: Same series — these belong together regardless of similarity.
    if (currentPost?.series) {
      allBlogs
        .filter((blog) => blog.series === currentPost.series && blog.slug !== currentSlug)
        .forEach((post) => {
          relatedPostsMap.set(post.slug, {
            title: post.title,
            url: `/blog/${post.slug}`,
            description: post.description,
            date: post.date,
            image: post.image,
            similarity: 1.0,
            score: 200,
          });
        });
    }

    // Strategy 2: Semantic similarity (primary signal). Query on title +
    // description for a richer match than the title alone. Results are
    // chunk-level, so collapse to the best similarity per post.
    const query = currentPost
      ? `${currentPost.title}. ${currentPost.description}`
      : title;
    const embeddingResults = (await searchEmbeddings(query, limit + 20)) as EmbeddingResult[];

    const bestBySlug = new Map<string, number>();
    for (const result of embeddingResults) {
      const url = result.metadata?.url;
      if (!url || url === currentUrl) continue;
      const slug = url.split('/').pop() || '';
      if (!slug || slug === currentSlug) continue;
      const sim = result.similarity ?? 0;
      if (sim > (bestBySlug.get(slug) ?? -1)) bestBySlug.set(slug, sim);
    }

    for (const [slug, sim] of Array.from(bestBySlug)) {
      if (relatedPostsMap.has(slug)) {
        relatedPostsMap.get(slug)!.score += sim * 100;
        continue;
      }
      const blog = allBlogs.find((b) => b.slug === slug);
      relatedPostsMap.set(slug, {
        title: blog?.title ?? 'Untitled',
        url: `/blog/${slug}`,
        description: blog?.description ?? '',
        date: blog?.date ?? '',
        image: blog?.image ?? '/images/blog/default.webp',
        similarity: sim,
        score: sim * 100,
      });
    }

    // Strategy 3: Shared tags — a small tiebreak on semantic candidates, and a
    // fallback that fills the section when embeddings returned nothing.
    if (currentPost?.tags && currentPost.tags.length > 0) {
      const semanticAvailable = relatedPostsMap.size > 0;
      allBlogs.forEach((blog) => {
        if (blog.slug === currentSlug) return;
        const matchingTags = blog.tags.filter((tag) => currentPost.tags.includes(tag));
        if (matchingTags.length === 0) return;
        const tagRatio = matchingTags.length / currentPost.tags.length;

        if (relatedPostsMap.has(blog.slug)) {
          relatedPostsMap.get(blog.slug)!.score += tagRatio * 12; // tiebreak
        } else if (!semanticAvailable) {
          relatedPostsMap.set(blog.slug, {
            title: blog.title,
            url: `/blog/${blog.slug}`,
            description: blog.description,
            date: blog.date,
            image: blog.image,
            similarity: tagRatio,
            score: tagRatio * 40,
          });
        }
      });
    }

    // Sort by score and return top N
    const relatedPosts = Array.from(relatedPostsMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ score: _score, ...post }) => {
        void _score; // Strip from response (kept only for sorting)
        return post;
      });

    return apiSuccess({
      related: relatedPosts,
      count: relatedPosts.length,
    });
  } catch (error) {
    logError('Related Posts: Unexpected error', error, { component: 'related-posts', action: 'GET' });
    return ApiErrors.internalError('Failed to fetch related posts');
  }
};

// Export with rate limiting (10 requests per minute)
export const GET = withRateLimit(handleGet, RATE_LIMITS.RELATED_POSTS);
