import { NextResponse } from "next/server";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { getSupabase } from "@/lib/supabase";

/**
 * API route to fetch engagement statistics
 * GET /api/engagement-stats
 * Returns total likes, bookmarks, and top posts from Supabase
 */
export async function GET() {
  try {
    const supabase = getSupabase();

    // Fetch all reactions from database
    const { data: reactionsData, error } = await supabase
      .from("reactions")
      .select("slug, likes, bookmarks")
      .order("likes", { ascending: false });

    if (error) {
      console.error("[Engagement Stats] Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch engagement stats" },
        { status: 500 }
      );
    }

    // Calculate totals
    const totalLikes = (reactionsData || []).reduce((sum, r) => sum + r.likes, 0);
    const totalBookmarks = (reactionsData || []).reduce((sum, r) => sum + r.bookmarks, 0);

    // Get blog metadata for titles
    const allBlogs = await getAllBlogs();
    const blogMap = new Map(allBlogs.map((blog) => [blog.slug, blog.title]));

    // Get top liked posts (limit to 5)
    const topLiked = (reactionsData || [])
      .filter(r => r.likes > 0)
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 5)
      .map(r => ({
        slug: r.slug,
        title: blogMap.get(r.slug) || r.slug,
        likes: r.likes,
      }));

    // Get top bookmarked posts (limit to 5)
    const topBookmarked = (reactionsData || [])
      .filter(r => r.bookmarks > 0)
      .sort((a, b) => b.bookmarks - a.bookmarks)
      .slice(0, 5)
      .map(r => ({
        slug: r.slug,
        title: blogMap.get(r.slug) || r.slug,
        bookmarks: r.bookmarks,
      }));

    return NextResponse.json({
      totalLikes,
      totalBookmarks,
      topLiked,
      topBookmarked,
    });
  } catch (error) {
    console.error("[Engagement Stats] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch engagement stats" },
      { status: 500 }
    );
  }
}
