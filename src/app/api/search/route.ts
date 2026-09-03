import { NextRequest } from 'next/server';
import { z } from 'zod';
import { searchEmbeddings, type HybridRow } from '@/lib/embeddings';
import { withRateLimit } from '@/lib/with-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { logError } from '@/lib/logger';
import type { SearchResult } from '@/types/embeddings';
import { apiSuccess, ApiErrors } from '@/lib/api-response';
import { withWriteRoute } from '@/lib/api/write-route';

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

/**
 * The POST body, as a schema rather than the route-local checks GET still uses.
 * Messages and coercions are deliberately identical to `validateQuery` /
 * `parseLimit` so moving POST onto the shared write chain changed no response.
 */
const searchPostSchema = z
  .object({ query: z.unknown().optional(), limit: z.unknown().optional() })
  .superRefine((body, ctx) => {
    const query = body.query;
    if (typeof query !== 'string' || query.trim().length === 0) {
      ctx.addIssue({ code: 'custom', message: 'Search query is required' });
      return;
    }
    if (query.length > 500) {
      ctx.addIssue({ code: 'custom', message: 'Search query too long (max 500 characters)' });
    }
  })
  .transform((body) => ({
    query: body.query as string,
    limit: parseLimit(body.limit),
  }));

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

export const POST = withWriteRoute(
  {
    // 5 requests per minute.
    limit: RATE_LIMITS.AI_HEAVY,
    auth: {
      kind: 'public',
      reason: 'Site search is a public read; the mutation-shaped POST only carries a longer query body.',
    },
    csrf: { kind: 'required' },
    body: { kind: 'json', schema: searchPostSchema },
    envelope: { kind: 'standard' },
    errors: {
      log: 'Search: Unexpected error',
      component: 'search',
      action: 'POST',
      message: 'Search failed. Please try again later.',
    },
  },
  async ({ data }) => {
    const { query, limit } = data;

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

    return { query, results: searchResults, count: searchResults.length };
  }
);

// Export with rate limiting (5 requests per minute)
export const GET = withRateLimit(handleGet, RATE_LIMITS.AI_HEAVY);
