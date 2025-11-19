import { NextRequest, NextResponse } from "next/server";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { getSupabase } from "@/lib/supabase";

interface ViewData {
  slug: string;
}

/**
 * GET /api/views?slug=xxx
 * Get view count for a specific blog post
 */
export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const supabase = getSupabase();

    // Get view count from database
    const { data, error } = await supabase
      .from("views")
      .select("count")
      .eq("slug", slug)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error("[View Counter] Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch views" },
        { status: 500 }
      );
    }

    const views = data?.count || 0;
    return NextResponse.json({ slug, views });
  } catch (error) {
    console.error("[View Counter] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch views" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/views
 * Increment view count for a blog post
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ViewData;
    const { slug } = body;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "Valid slug is required" }, { status: 400 });
    }

    const supabase = getSupabase();

    // Use upsert to increment or create view count
    const { data, error } = await supabase
      .from("views")
      .select("count")
      .eq("slug", slug)
      .single();

    const currentCount = data?.count || 0;
    const newCount = currentCount + 1;

    const { error: upsertError } = await supabase
      .from("views")
      .upsert({
        slug,
        count: newCount,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'slug'
      });

    if (upsertError) {
      console.error("[View Counter] Upsert error:", upsertError);
      return NextResponse.json(
        { error: "Failed to record view" },
        { status: 500 }
      );
    }

    return NextResponse.json({ slug, views: newCount });
  } catch (error) {
    console.error("[View Counter] Error:", error);
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
      console.error("[View Counter] Database error:", error);
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
    console.error("[View Counter] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch views" },
      { status: 500 }
    );
  }
}
