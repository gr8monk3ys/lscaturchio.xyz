import { NextRequest } from "next/server";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { getSupabase, isSupabaseConfigured, isNoRowsError } from "@/lib/supabase";
import { logError } from "@/lib/logger";
import { validateCsrf } from "@/lib/csrf";
import { slugQuerySchema, viewTrackingSchema, parseBody, parseQuery } from "@/lib/validations";
import { withRateLimit, RATE_LIMITS } from "@/lib/with-rate-limit";
import { apiSuccess, ApiErrors } from "@/lib/api-response";

/**
 * GET /api/views?slug=xxx
 * Get view count for a specific blog post
 */
const handleGet = async (req: NextRequest) => {
  try {
    // Zod validation
    const parsed = parseQuery(slugQuerySchema, req.nextUrl.searchParams);
    if (!parsed.success) {
      return ApiErrors.badRequest(parsed.error);
    }

    const { slug } = parsed.data;

    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      // Return mock data when Supabase is not configured (dev mode)
      return apiSuccess({ slug, views: 0 });
    }

    const supabase = getSupabase();

    // Get view count from database
    const { data, error } = await supabase
      .from("views")
      .select("count")
      .eq("slug", slug)
      .single();

    if (error && !isNoRowsError(error)) {
      logError("View Counter: Database error", error, { component: 'views', action: 'GET' });
      // Graceful fallback so blog pages still render even if views storage is unavailable
      return apiSuccess({ slug, views: 0 });
    }

    const views = data?.count || 0;
    return apiSuccess({ slug, views });
  } catch (error) {
    logError("View Counter: Unexpected error", error, { component: 'views', action: 'GET' });
    return ApiErrors.internalError("Failed to fetch views");
  }
};

// Export with rate limiting (100 requests per minute - public read-only endpoint)
export const GET = withRateLimit(handleGet, RATE_LIMITS.PUBLIC);

/**
 * POST /api/views
 * Increment view count for a blog post (atomic operation)
 */
const handlePost = async (req: NextRequest) => {
  // CSRF protection
  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;

  try {
    const body = await req.json();

    // Zod validation
    const parsed = parseBody(viewTrackingSchema, body);
    if (!parsed.success) {
      return ApiErrors.badRequest(parsed.error);
    }

    const { slug } = parsed.data;

    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      // Return mock data when Supabase is not configured (dev mode)
      return apiSuccess({ slug, views: 1 });
    }

    const supabase = getSupabase();

    // Use atomic RPC function to prevent race conditions
    const { data, error } = await supabase.rpc("increment_view_count", {
      post_slug: slug,
    });

    if (error) {
      logError("View Counter: RPC error", error, { component: 'views', action: 'POST', slug });
      return ApiErrors.internalError("Failed to record view");
    }

    return apiSuccess({ slug, views: data });
  } catch (error) {
    logError("View Counter: Unexpected error", error, { component: 'views', action: 'POST' });
    return ApiErrors.internalError("Failed to record view");
  }
};

// Export POST with rate limiting (30 requests per minute - standard mutation endpoint)
export const POST = withRateLimit(handlePost, RATE_LIMITS.STANDARD);

/**
 * OPTIONS /api/views
 * Get all views with blog titles (for stats/popular posts)
 */
const handleOptions = async () => {
  try {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      // Return empty data when Supabase is not configured (dev mode)
      return apiSuccess({ views: [], total: 0 });
    }

    const supabase = getSupabase();

    // Fetch all views from database
    const { data: viewsData, error } = await supabase
      .from("views")
      .select("slug, count")
      .order("count", { ascending: false });

    if (error) {
      logError("View Counter: Database error", error, { component: 'views', action: 'OPTIONS' });
      // Graceful fallback for public stats widgets
      return apiSuccess({ views: [], total: 0 });
    }

    // Fetch all blog metadata to get real titles
    const allBlogs = await getAllBlogs();
    const blogMap = new Map(allBlogs.map((blog) => [blog.slug, blog.title]));

    // Map views to include real titles
    const allViews = (viewsData || []).map((view) => ({
      slug: view.slug,
      title: blogMap.get(view.slug) || view.slug, // Fallback to slug if title not found
      views: view.count,
    }));

    return apiSuccess({ views: allViews, total: allViews.length });
  } catch (error) {
    logError("View Counter: Unexpected error", error, { component: 'views', action: 'OPTIONS' });
    return ApiErrors.internalError("Failed to fetch views");
  }
};

// Export OPTIONS with rate limiting (100 requests per minute - public read-only endpoint)
export const OPTIONS = withRateLimit(handleOptions, RATE_LIMITS.PUBLIC);
