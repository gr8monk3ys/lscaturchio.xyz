import { NextRequest } from "next/server";
import { getSupabase, isNoRowsError } from "@/lib/supabase";
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
 * GET /api/reactions?slug=xxx
 * Get reactions (likes and bookmarks) for a specific blog post
 */
const handleGet = async (req: NextRequest) => {
  try {
    // Zod validation
    const parsed = parseQuery(slugQuerySchema, req.nextUrl.searchParams);
    if (!parsed.success) {
      return ApiErrors.badRequest(parsed.error);
    }

    const { slug } = parsed.data;

    const supabase = getSupabase();

    // Get reactions from database
    const { data, error } = await supabase
      .from("reactions")
      .select("likes, bookmarks")
      .eq("slug", slug)
      .single();

    if (error && !isNoRowsError(error)) {
      logError("Reactions: Database error", error, { component: 'reactions', action: 'GET', slug });
      return ApiErrors.internalError("Failed to fetch reactions");
    }

    const reactions: Reactions = data || { likes: 0, bookmarks: 0 };
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
  // CSRF protection
  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;

  try {
    const body = await req.json();

    // Zod validation
    const parsed = parseBody(reactionTrackingSchema, body);
    if (!parsed.success) {
      return ApiErrors.badRequest(parsed.error);
    }

    const { slug, type } = parsed.data;
    const supabase = getSupabase();

    // Check if vote deduplication is enabled
    if (isVoteDeduplicationEnabled()) {
      const voterHash = getVoterHash(req);

      // Use atomic RPC function with deduplication
      const { data, error } = await supabase.rpc("record_vote", {
        p_slug: slug,
        p_type: type,
        p_voter_hash: voterHash,
      });

      if (error) {
        // If record_vote doesn't exist, fall back to old method
        if (error.code === '42883') { // function does not exist
          logInfo("Reactions: record_vote RPC not found, using fallback", { component: 'reactions', action: 'POST', slug, type });
        } else {
          logError("Reactions: RPC error", error, { component: 'reactions', action: 'POST', slug, type });
          return ApiErrors.internalError("Failed to record reaction");
        }
      } else {
        // data is the new count, or -1 if already voted
        if (data === -1) {
          // Already voted - return current counts without error
          const { data: current } = await supabase
            .from("reactions")
            .select("likes, bookmarks")
            .eq("slug", slug)
            .single();

          return apiSuccess({
            slug,
            likes: current?.likes || 0,
            bookmarks: current?.bookmarks || 0,
            alreadyVoted: true,
          });
        }

        // Get full reaction counts to return
        const { data: reactions } = await supabase
          .from("reactions")
          .select("likes, bookmarks")
          .eq("slug", slug)
          .single();

        return apiSuccess({
          slug,
          likes: reactions?.likes || 0,
          bookmarks: reactions?.bookmarks || 0,
        });
      }
    }

    // Fallback: Use original toggle_reaction (no deduplication)
    const { data, error } = await supabase.rpc("toggle_reaction", {
      post_slug: slug,
      reaction_type: type,
    });

    if (error) {
      logError("Reactions: RPC error", error, { component: 'reactions', action: 'POST', slug, type });
      return ApiErrors.internalError("Failed to record reaction");
    }

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
  // CSRF protection
  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;

  try {
    // Zod validation
    const parsed = parseQuery(reactionQuerySchema, req.nextUrl.searchParams);
    if (!parsed.success) {
      return ApiErrors.badRequest(parsed.error);
    }

    const { slug, type } = parsed.data;
    const supabase = getSupabase();

    // Check if vote deduplication is enabled
    if (isVoteDeduplicationEnabled()) {
      const voterHash = getVoterHash(req);

      // Use atomic RPC function with deduplication
      const { data, error } = await supabase.rpc("remove_vote", {
        p_slug: slug,
        p_type: type,
        p_voter_hash: voterHash,
      });

      if (error) {
        // If remove_vote doesn't exist, fall back to old method
        if (error.code === '42883') { // function does not exist
          logInfo("Reactions: remove_vote RPC not found, using fallback", { component: 'reactions', action: 'DELETE', slug, type });
        } else {
          logError("Reactions: RPC error", error, { component: 'reactions', action: 'DELETE', slug, type });
          return ApiErrors.internalError("Failed to remove reaction");
        }
      } else {
        // data is the new count, or -1 if never voted
        if (data === -1) {
          // Never voted - return current counts without error
          const { data: current } = await supabase
            .from("reactions")
            .select("likes, bookmarks")
            .eq("slug", slug)
            .single();

          return apiSuccess({
            slug,
            likes: current?.likes || 0,
            bookmarks: current?.bookmarks || 0,
            neverVoted: true,
          });
        }

        // Get full reaction counts to return
        const { data: reactions } = await supabase
          .from("reactions")
          .select("likes, bookmarks")
          .eq("slug", slug)
          .single();

        return apiSuccess({
          slug,
          likes: reactions?.likes || 0,
          bookmarks: reactions?.bookmarks || 0,
        });
      }
    }

    // Fallback: Use original decrement_reaction (no deduplication)
    const { data, error } = await supabase.rpc("decrement_reaction", {
      post_slug: slug,
      reaction_type: type,
    });

    if (error) {
      logError("Reactions: RPC error", error, { component: 'reactions', action: 'DELETE', slug, type });
      return ApiErrors.internalError("Failed to remove reaction");
    }

    return apiSuccess({ slug, ...data });
  } catch (error) {
    logError("Reactions: Unexpected error", error, { component: 'reactions', action: 'DELETE' });
    return ApiErrors.internalError("Failed to remove reaction");
  }
};

// Export DELETE with rate limiting (30 requests per minute - standard mutation endpoint)
export const DELETE = withRateLimit(handleDelete, RATE_LIMITS.STANDARD);
