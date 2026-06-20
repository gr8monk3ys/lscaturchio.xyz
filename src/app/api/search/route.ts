import { NextRequest } from 'next/server';
import { searchEmbeddings, type HybridRow } from '@/lib/embeddings';
import { withRateLimit } from '@/lib/with-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { validateCsrf } from '@/lib/csrf';
import { logError } from '@/lib/logger';
import type { SearchResult } from '@/types/embeddings';
import { apiSuccess, ApiErrors } from '@/lib/api-response';

/**
 * Groups raw embedding results by blog post URL, keeping only unique snippets
 * and tracking the highest similarity score per post.
 *
 * Used by both GET and POST handlers to avoid duplicating the reduce logic.
 */
type GroupedResult = SearchResult & { tags?: string[]; score: number };

function groupEmbeddingResults(
  results: HybridRow[],
  options?: { includeTags?: boolean },
): Record<string, GroupedResult> {
  return results.reduce(
    (acc, result) => {
      const blogUrl = result.metadata?.url || '';
      if (!blogUrl) return acc;

      // Lexical-only hits have a null cosine similarity; show 0 for display and
      // rank groups by the fused score instead.
      const sim = result.similarity ?? 0;
      const score = result.score ?? 0;

      if (!acc[blogUrl]) {
        acc[blogUrl] = {
          title: result.metadata?.title || 'Untitled',
          url: blogUrl,
          description: result.metadata?.description || '',
          date: result.metadata?.date || '',
          ...(options?.includeTags ? { tags: result.metadata?.tags || [] } : {}),
          similarity: sim,
          score,
          snippets: [],
        };
      }

      // Add content snippet if it's unique
      if (result.content && !acc[blogUrl].snippets.includes(result.content)) {
        acc[blogUrl].snippets.push(result.content);
      }

      // Track the highest cosine (display) and fused score (ranking) per post.
      if (sim > acc[blogUrl].similarity) acc[blogUrl].similarity = sim;
      if (score > acc[blogUrl].score) acc[blogUrl].score = score;

      return acc;
    },
    {} as Record<string, GroupedResult>,
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

function parseLimit(raw: unknown): number {
  const parsed =
    typeof raw === 'number'
      ? raw
      : Number.parseInt(String(raw ?? ''), 10);

  if (!Number.isFinite(parsed)) {
    return 10;
  }

  return Math.min(Math.max(parsed, 1), 50);
}

const handleGet = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseLimit(searchParams.get('limit'));

    const queryError = validateQuery(query);
    if (queryError) return queryError;

    const results = await searchEmbeddings(query!, limit);
    const grouped = groupEmbeddingResults(results);

    const searchResults = Object.values(grouped)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((result) => ({
        title: result.title,
        url: result.url,
        description: result.description,
        date: result.date,
        similarity: result.similarity,
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
    const limit = parseLimit(body.limit);

    const queryError = validateQuery(query);
    if (queryError) return queryError;

    const results = await searchEmbeddings(query, limit);
    const grouped = groupEmbeddingResults(results, { includeTags: true });

    const searchResults = Object.values(grouped)
      .sort((a, b) => b.score - a.score)
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
