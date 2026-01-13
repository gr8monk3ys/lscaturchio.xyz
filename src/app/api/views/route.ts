import { NextRequest, NextResponse } from "next/server";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { getSupabase } from "@/lib/supabase";
import { logError } from "@/lib/logger";
import { validateCsrf } from "@/lib/csrf";
import { slugQuerySchema, viewTrackingSchema, parseBody, parseQuery } from "@/lib/validations";

/**
 * GET /api/views?slug=xxx
 * Get view count for a specific blog post
 */
export async function GET(req: NextRequest) {
  try {
    // Zod validation
    const parsed = parseQuery(slugQuerySchema, req.nextUrl.searchParams);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { slug } = parsed.data;

    const supabase = getSupabase();

    // Get view count from database
    const { data, error } = await supabase
      .from("views")
      .select("count")
      .eq("slug", slug)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      logError("View Counter: Database error", error, { component: 'views', action: 'GET' });
      return NextResponse.json(
        { error: "Failed to fetch views" },
        { status: 500 }
      );
    }

    const views = data?.count || 0;
    return NextResponse.json({ slug, views });
  } catch (error) {
    logError("View Counter: Unexpected error", error, { component: 'views', action: 'GET' });
    return NextResponse.json(
      { error: "Failed to fetch views" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/views
 * Increment view count for a blog post (atomic operation)
 */
export async function POST(req: NextRequest) {
  // CSRF protection
  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;

  try {
    const body = await req.json();

    // Zod validation
    const parsed = parseBody(viewTrackingSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { slug } = parsed.data;

    const supabase = getSupabase();

    // Use atomic RPC function to prevent race conditions
    const { data, error } = await supabase.rpc("increment_view_count", {
      post_slug: slug,
    });

    if (error) {
      logError("View Counter: RPC error", error, { component: 'views', action: 'POST', slug });
      return NextResponse.json(
        { error: "Failed to record view" },
        { status: 500 }
      );
    }

    return NextResponse.json({ slug, views: data });
  } catch (error) {
    logError("View Counter: Unexpected error", error, { component: 'views', action: 'POST' });
    return NextResponse.json(
      { error: "Failed to record view" },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/views
 * Get all views with blog titles (for stats/popular posts)
 */
export async function OPTIONS() {
  try {
    const supabase = getSupabase();

    // Fetch all views from database
    const { data: viewsData, error } = await supabase
      .from("views")
      .select("slug, count")
      .order("count", { ascending: false });

    if (error) {
      logError("View Counter: Database error", error, { component: 'views', action: 'OPTIONS' });
      return NextResponse.json(
        { error: "Failed to fetch views" },
        { status: 500 }
      );
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

    return NextResponse.json({ views: allViews, total: allViews.length });
  } catch (error) {
    logError("View Counter: Unexpected error", error, { component: 'views', action: 'OPTIONS' });
    return NextResponse.json(
      { error: "Failed to fetch views" },
      { status: 500 }
    );
  }
}
