import { NextRequest, NextResponse } from "next/server";
import { getAllBlogs } from "@/lib/getAllBlogs";

// In-memory view storage (resets on server restart)
// For production, migrate to Supabase or Redis
const viewsStore = new Map<string, number>();

interface ViewData {
  slug: string;
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  const views = viewsStore.get(slug) || 0;
  return NextResponse.json({ slug, views });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ViewData;
    const { slug } = body;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "Valid slug is required" }, { status: 400 });
    }

    // Increment view count
    const currentViews = viewsStore.get(slug) || 0;
    const newViews = currentViews + 1;
    viewsStore.set(slug, newViews);

    return NextResponse.json({ slug, views: newViews });
  } catch (error) {
    console.error("[View Counter] Error:", error);
    return NextResponse.json(
      { error: "Failed to record view" },
      { status: 500 }
    );
  }
}

// Get all views (for stats) with real blog titles
export async function OPTIONS() {
  try {
    // Fetch all blog metadata to get real titles
    const allBlogs = await getAllBlogs();
    const blogMap = new Map(allBlogs.map((blog) => [blog.slug, blog.title]));

    // Map views to include real titles
    const allViews = Array.from(viewsStore.entries()).map(([slug, views]) => ({
      slug,
      title: blogMap.get(slug) || slug, // Fallback to slug if title not found
      views,
    }));

    return NextResponse.json({ views: allViews, total: allViews.length });
  } catch (error) {
    console.error("[View Counter] Error fetching blog titles:", error);
    // Fallback to just slug if getAllBlogs fails
    const allViews = Array.from(viewsStore.entries()).map(([slug, views]) => ({
      slug,
      title: slug,
      views,
    }));
    return NextResponse.json({ views: allViews, total: allViews.length });
  }
}
