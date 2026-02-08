import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { logError, logInfo } from "@/lib/logger";
import { validateCsrf } from "@/lib/csrf";
import { slugQuerySchema, reactionTrackingSchema, reactionQuerySchema, parseBody, parseQuery } from "@/lib/validations";
import { getVoterHash, isVoteDeduplicationEnabled } from "@/lib/voter-hash";
import { withRateLimit, RATE_LIMITS } from "@/lib/with-rate-limit";
import { apiSuccess, ApiErrors } from "@/lib/api-response";

interface Reactions {
  likes: number;
  bookmarks: number;
}

/**
 * Fetch current reaction counts for a slug, defaulting to zeros if no row exists.
 */
async function fetchReactions(slug: string): Promise<Reactions> {
  const sql = getDb();
  const rows = await sql`SELECT likes, bookmarks FROM reactions WHERE slug = ${slug}`;

  if (rows.length === 0) {
    return { likes: 0, bookmarks: 0 };
  }

  return { likes: rows[0].likes, bookmarks: rows[0].bookmarks };
}

/**
 * Check whether an error is a "function does not exist" PostgreSQL error.
 */
function isFunctionNotFoundError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('function') && error.message.includes('does not exist');
  }
  return false;
}

/**
 * GET /api/reactions?slug=xxx
 * Get reactions (likes and bookmarks) for a specific blog post
 */
const handleGet = async (req: NextRequest) => {
  try {
    const parsed = parseQuery(slugQuerySchema, req.nextUrl.searchParams);
    if (!parsed.success) {
      return ApiErrors.badRequest(parsed.error);
    }

    const { slug } = parsed.data;
    const reactions = await fetchReactions(slug);

    return apiSuccess({ slug, ...reactions });
  } catch (error) {
    logError("Reactions: Unexpected error", error, { component: 'reactions', action: 'GET' });
    return ApiErrors.internalError("Failed to fetch reactions");
  }
};

// Export GET with rate limiting (100 requests per minute - public read-only endpoint)
export const GET = withRateLimit(handleGet, RATE_LIMITS.PUBLIC);

/**
 * POST /api/reactions
 * Add a reaction (like or bookmark) to a blog post
 * Uses server-side deduplication to prevent vote manipulation
 */
const handlePost = async (req: NextRequest) => {
  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;

  try {
    const body = await req.json();

    const parsed = parseBody(reactionTrackingSchema, body);
    if (!parsed.success) {
      return ApiErrors.badRequest(parsed.error);
    }

    const { slug, type } = parsed.data;
    const sql = getDb();

    if (isVoteDeduplicationEnabled()) {
      const voterHash = getVoterHash(req);

      try {
        const rows = await sql`SELECT record_vote(${slug}, ${type}, ${voterHash})`;
        const result = rows[0].record_vote;

        if (result === -1) {
          const reactions = await fetchReactions(slug);
          return apiSuccess({ slug, ...reactions, alreadyVoted: true });
        }

        const reactions = await fetchReactions(slug);
        return apiSuccess({ slug, ...reactions });
      } catch (rpcError) {
        if (isFunctionNotFoundError(rpcError)) {
          logInfo("Reactions: record_vote RPC not found, using fallback", { component: 'reactions', action: 'POST', slug, type });
        } else {
          logError("Reactions: RPC error", rpcError, { component: 'reactions', action: 'POST', slug, type });
          return ApiErrors.internalError("Failed to record reaction");
        }
      }
    }

    // Fallback: Use original toggle_reaction (no deduplication)
    const rows = await sql`SELECT toggle_reaction(${slug}, ${type})`;
    const data = rows[0].toggle_reaction;

    return apiSuccess({ slug, ...data });
  } catch (error) {
    logError("Reactions: Unexpected error", error, { component: 'reactions', action: 'POST' });
    return ApiErrors.internalError("Failed to record reaction");
  }
};

// Export POST with rate limiting (30 requests per minute - standard mutation endpoint)
export const POST = withRateLimit(handlePost, RATE_LIMITS.STANDARD);

/**
 * DELETE /api/reactions?slug=xxx&type=like
 * Remove a reaction (for toggle functionality)
 * Uses server-side deduplication to ensure only actual votes can be removed
 */
const handleDelete = async (req: NextRequest) => {
  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;

  try {
    const parsed = parseQuery(reactionQuerySchema, req.nextUrl.searchParams);
    if (!parsed.success) {
      return ApiErrors.badRequest(parsed.error);
    }

    const { slug, type } = parsed.data;
    const sql = getDb();

    if (isVoteDeduplicationEnabled()) {
      const voterHash = getVoterHash(req);

      try {
        const rows = await sql`SELECT remove_vote(${slug}, ${type}, ${voterHash})`;
        const result = rows[0].remove_vote;

        if (result === -1) {
          const reactions = await fetchReactions(slug);
          return apiSuccess({ slug, ...reactions, neverVoted: true });
        }

        const reactions = await fetchReactions(slug);
        return apiSuccess({ slug, ...reactions });
      } catch (rpcError) {
        if (isFunctionNotFoundError(rpcError)) {
          logInfo("Reactions: remove_vote RPC not found, using fallback", { component: 'reactions', action: 'DELETE', slug, type });
        } else {
          logError("Reactions: RPC error", rpcError, { component: 'reactions', action: 'DELETE', slug, type });
          return ApiErrors.internalError("Failed to remove reaction");
        }
      }
    }

    // Fallback: Use original decrement_reaction (no deduplication)
    const rows = await sql`SELECT decrement_reaction(${slug}, ${type})`;
    const data = rows[0].decrement_reaction;

    return apiSuccess({ slug, ...data });
  } catch (error) {
    logError("Reactions: Unexpected error", error, { component: 'reactions', action: 'DELETE' });
    return ApiErrors.internalError("Failed to remove reaction");
  }
};

// Export DELETE with rate limiting (30 requests per minute - standard mutation endpoint)
export const DELETE = withRateLimit(handleDelete, RATE_LIMITS.STANDARD);
