import { NextRequest } from 'next/server';
import { relevantEssays } from '@/lib/retrieval';
import { withRateLimit } from '@/lib/rate-limit';
import { logError } from '@/lib/logger';
import type { RelatedPost } from '@/types/embeddings';
import { getAllBlogs } from '@/lib/getAllBlogs';
import { apiSuccess, ApiErrors } from '@/lib/api-response';

/**
 * Related posts, semantic-first. The point of a garden is non-obvious
 * connections, so retrieval relevance is the primary signal — not shared
 * tags. Order of influence:
 * 1. Same series (kept together by design)
 * 2. Retrieval relevance over the post's title + description (primary) —
 *    the same fused vector + keyword rank search uses, so an essay that
 *    matches on exact terms ranks on that rather than scoring zero
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

    // A title past any real essay length is almost certainly junk, and when the
    // post isn't found locally it gets embedded verbatim — cap it before any
    // provider call to bound cost and avoid oversized-input errors.
    if (title.length > 300) {
      return ApiErrors.badRequest('Post title is too long');
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

    // Strategy 2: Retrieval relevance (primary signal). Query on title +
    // description for a richer match than the title alone. The current post is
    // its own best match, so ask for headroom past `limit`.
    const query = currentPost
      ? `${currentPost.title}. ${currentPost.description}`
      : title;
    const essays = await relevantEssays(query, { limit: limit + 20 });

    for (const essay of essays) {
      const { slug } = essay;
      if (!slug || slug === currentSlug || essay.url === currentUrl) continue;
      const score = essay.relevance * 100;
      if (relatedPostsMap.has(slug)) {
        relatedPostsMap.get(slug)!.score += score;
        continue;
      }
      const blog = allBlogs.find((b) => b.slug === slug);
      relatedPostsMap.set(slug, {
        title: blog?.title ?? 'Untitled',
        url: `/blog/${slug}`,
        description: blog?.description ?? '',
        date: blog?.date ?? '',
        image: blog?.image ?? '/images/blog/default.webp',
        similarity: essay.similarity,
        score,
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
export const GET = withRateLimit(handleGet, 'RELATED_POSTS');
