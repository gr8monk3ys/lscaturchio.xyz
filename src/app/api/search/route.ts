import { NextRequest } from 'next/server';
import { searchEmbeddings } from '@/lib/embeddings';
import { withRateLimit } from '@/lib/with-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { validateCsrf } from '@/lib/csrf';
import { logError } from '@/lib/logger';
import type { EmbeddingResult, SearchResult } from '@/types/embeddings';
import { apiSuccess, ApiErrors } from '@/lib/api-response';

/**
 * Groups raw embedding results by blog post URL, keeping only unique snippets
 * and tracking the highest similarity score per post.
 *
 * Used by both GET and POST handlers to avoid duplicating the reduce logic.
 */
function groupEmbeddingResults(
  results: EmbeddingResult[],
  options?: { includeTags?: boolean },
): Record<string, SearchResult & { tags?: string[] }> {
  return results.reduce(
    (acc, result) => {
      const blogUrl = result.metadata?.url || '';
      if (!blogUrl) return acc;

      if (!acc[blogUrl]) {
        acc[blogUrl] = {
          title: result.metadata?.title || 'Untitled',
          url: blogUrl,
          description: result.metadata?.description || '',
          date: result.metadata?.date || '',
          ...(options?.includeTags ? { tags: result.metadata?.tags || [] } : {}),
          similarity: result.similarity,
          snippets: [],
        };
      }

      // Add content snippet if it's unique
      if (result.content && !acc[blogUrl].snippets.includes(result.content)) {
        acc[blogUrl].snippets.push(result.content);
      }

      // Update similarity to the highest match
      if (result.similarity > acc[blogUrl].similarity) {
        acc[blogUrl].similarity = result.similarity;
      }

      return acc;
    },
    {} as Record<string, SearchResult & { tags?: string[] }>,
  );
}

/**
 * Validates a search query string, returning an error response if invalid.
 */
function validateQuery(query: string | null): ReturnType<typeof ApiErrors.badRequest> | null {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return ApiErrors.badRequest('Search query is required');
  }
  if (query.length > 500) {
    return ApiErrors.badRequest('Search query too long (max 500 characters)');
  }
  return null;
}

const handleGet = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    const queryError = validateQuery(query);
    if (queryError) return queryError;

    const results = await searchEmbeddings(query!, Math.min(limit, 50));
    const grouped = groupEmbeddingResults(results as EmbeddingResult[]);

    const searchResults = Object.values(grouped)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map((result) => ({
        ...result,
        snippets: result.snippets.slice(0, 2),
      }));

    return apiSuccess({
      query,
      results: searchResults,
      count: searchResults.length,
    });
  } catch (error) {
    logError('Search: Unexpected error', error, { component: 'search', action: 'GET' });
    return ApiErrors.internalError('Search failed. Please try again later.');
  }
};

const handlePost = async (request: NextRequest) => {
  const csrfError = validateCsrf(request);
  if (csrfError) return csrfError;

  try {
    const body = await request.json();
    const query = body.query;
    const limit = parseInt(body.limit || '10');

    const queryError = validateQuery(query);
    if (queryError) return queryError;

    const results = await searchEmbeddings(query, Math.min(limit, 50));
    const grouped = groupEmbeddingResults(results as EmbeddingResult[], {
      includeTags: true,
    });

    const searchResults = Object.values(grouped)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map((result) => {
        const slug = result.url.split('/').pop() || '';
        return {
          slug,
          title: result.title,
          description: result.description,
          date: result.date,
          tags: result.tags || [],
          relevance: result.similarity,
        };
      });

    return apiSuccess({
      query,
      results: searchResults,
      count: searchResults.length,
    });
  } catch (error) {
    logError('Search: Unexpected error', error, { component: 'search', action: 'POST' });
    return ApiErrors.internalError('Search failed. Please try again later.');
  }
};

// Export with rate limiting (5 requests per minute)
export const GET = withRateLimit(handleGet, RATE_LIMITS.AI_HEAVY);
export const POST = withRateLimit(handlePost, RATE_LIMITS.AI_HEAVY);
