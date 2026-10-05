import { NextRequest } from 'next/server';
import { z } from 'zod';
import { relevantEssays } from '@/lib/retrieval';
import { withRateLimit } from '@/lib/rate-limit';
import { logError } from '@/lib/logger';
import { parseBody } from '@/lib/validations';
import { apiSuccess, ApiErrors } from '@/lib/api-response';
import { withWriteRoute } from '@/lib/api/write-route';

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
 * One search request, whichever verb carried it: GET reads `?q=&limit=`, POST
 * reads `{ query, limit }`. Both go through this schema, so the two cannot
 * disagree about what a valid query is.
 */
const searchRequestSchema = z
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
    const parsed = parseBody(searchRequestSchema, {
      query: searchParams.get('q'),
      limit: searchParams.get('limit'),
    });
    if (!parsed.success) return ApiErrors.badRequest(parsed.error, parsed.field);
    const { query, limit } = parsed.data;

    const essays = await relevantEssays(query, { limit });
    const searchResults = essays.map((essay) => ({
      title: essay.title,
      url: essay.url,
      description: essay.description,
      date: essay.date,
      similarity: essay.similarity,
      snippets: essay.snippets,
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
    limit: 'SEARCH',
    auth: {
      kind: 'public',
      reason: 'Site search is a public read; the mutation-shaped POST only carries a longer query body.',
    },
    csrf: { kind: 'required' },
    body: { kind: 'json', schema: searchRequestSchema },
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

    const essays = await relevantEssays(query, { limit });
    const searchResults = essays.map((essay) => ({
      slug: essay.slug,
      title: essay.title,
      description: essay.description,
      date: essay.date,
      tags: essay.tags,
      relevance: essay.similarity,
    }));

    return { query, results: searchResults, count: searchResults.length };
  }
);

// Export with rate limiting (5 requests per minute)
export const GET = withRateLimit(handleGet, 'SEARCH');
