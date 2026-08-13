import { NextRequest } from "next/server";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { logError } from "@/lib/logger";
import { validateCsrf } from "@/lib/csrf";
import { slugQuerySchema, viewTrackingSchema, parseBody, parseQuery } from "@/lib/validations";
import { withRateLimit, RATE_LIMITS } from "@/lib/with-rate-limit";
import { apiSuccess, ApiErrors } from "@/lib/api-response";

/**
 * GET /api/views?slug=xxx              - Get view count for a specific blog post
 * GET /api/views?all=true              - Get all view counts (batched, used by ViewCountsProvider)
 * GET /api/views?format=detailed       - Get all views with blog titles (for stats/popular posts)
 */
const handleGet = async (req: NextRequest) => {
  try {
    const formatParam = req.nextUrl.searchParams.get('format');

    // Detailed format: views enriched with blog titles (used by stats page)
    if (formatParam === 'detailed') {
      if (!isDatabaseConfigured()) {
        return apiSuccess({
          views: [],
          total: 0,
          available: false,
          message: 'Public view data is unavailable right now.',
        });
      }

      const sql = getDb();
      const rows = await sql`SELECT slug, count FROM views ORDER BY count DESC LIMIT 1000`;

      const allBlogs = await getAllBlogs();
      const blogMap = new Map(allBlogs.map((blog) => [blog.slug, blog.title]));

      // Defensive: rows written before the slug check above (or by a direct
      // DB write) must not surface as posts with the raw slug as their title.
      const allViews = rows
        .filter((view) => blogMap.has(view.slug))
        .map((view) => ({
          slug: view.slug,
          title: blogMap.get(view.slug) as string,
          views: view.count,
        }));

      return apiSuccess({
        views: allViews,
        total: allViews.length,
        available: true,
      });
    }

    const allParam = req.nextUrl.searchParams.get('all');

    // Batch-fetch all view counts (used by ViewCountsProvider to avoid N+1)
    if (allParam === 'true') {
      if (!isDatabaseConfigured()) {
        return apiSuccess({
          views: [],
          available: false,
          message: 'View tracking is unavailable right now.',
        });
      }

      const sql = getDb();
      const rows = await sql`SELECT slug, count FROM views ORDER BY count DESC LIMIT 1000`;

      const views = rows.map((row) => ({
        slug: row.slug,
        views: row.count || 0,
      }));

      return apiSuccess({ views, available: true });
    }

    // Single slug lookup
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
    // View counts are decoration. A reachable-but-failing database degrades to
    // the same "unavailable" shapes as the unconfigured case (the error is
    // already reported above) instead of surfacing 500s on every blog page.
    const formatParam = req.nextUrl.searchParams.get('format');
    if (formatParam === 'detailed') {
      return apiSuccess({
        views: [],
        total: 0,
        available: false,
        message: 'Public view data is unavailable right now.',
      });
    }
    if (req.nextUrl.searchParams.get('all') === 'true') {
      return apiSuccess({
        views: [],
        available: false,
        message: 'View tracking is unavailable right now.',
      });
    }
    return apiSuccess({ slug: req.nextUrl.searchParams.get('slug') ?? '', views: 0 });
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

    // The schema only checks slug *shape*. increment_view_count upserts, so
    // without checking the slug actually exists any caller could create rows
    // for arbitrary strings — growing the table without bound and, because the
    // read paths fall back to `title: slug`, printing attacker-chosen text on
    // the public /stats page. getAllBlogs() is cached for 60s, so this costs
    // at most one disk read per minute.
    const allBlogs = await getAllBlogs();
    if (!allBlogs.some((blog) => blog.slug === slug)) {
      return ApiErrors.notFound(`No blog post with slug "${slug}"`);
    }

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
