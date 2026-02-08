import { NextRequest } from "next/server";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { getDb, isDatabaseConfigured } from "@/lib/db";
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

    // Check if database is properly configured
    if (!isDatabaseConfigured()) {
      // Return mock data when database is not configured (dev mode)
      return apiSuccess({ slug, views: 0 });
    }

    const sql = getDb();

    // Get view count from database
    const rows = await sql`SELECT count FROM views WHERE slug = ${slug}`;

    if (rows.length === 0) {
      return apiSuccess({ slug, views: 0 });
    }

    const views = rows[0].count || 0;
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

    // Check if database is properly configured
    if (!isDatabaseConfigured()) {
      // Return mock data when database is not configured (dev mode)
      return apiSuccess({ slug, views: 1 });
    }

    const sql = getDb();

    // Use atomic RPC function to prevent race conditions
    const rows = await sql`SELECT increment_view_count(${slug})`;

    if (!rows.length) {
      logError("View Counter: RPC returned no result", null, { component: 'views', action: 'POST', slug });
      return ApiErrors.internalError("Failed to record view");
    }

    return apiSuccess({ slug, views: rows[0].increment_view_count });
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
    // Check if database is properly configured
    if (!isDatabaseConfigured()) {
      // Return empty data when database is not configured (dev mode)
      return apiSuccess({ views: [], total: 0 });
    }

    const sql = getDb();

    // Fetch all views from database
    const rows = await sql`SELECT slug, count FROM views ORDER BY count DESC`;

    // Fetch all blog metadata to get real titles
    const allBlogs = await getAllBlogs();
    const blogMap = new Map(allBlogs.map((blog) => [blog.slug, blog.title]));

    // Map views to include real titles
    const allViews = rows.map((view) => ({
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
