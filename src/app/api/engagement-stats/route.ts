import { getAllBlogs } from "@/lib/getAllBlogs";
import { getSupabase } from "@/lib/supabase";
import { logError } from "@/lib/logger";
import { apiSuccess, ApiErrors } from "@/lib/api-response";

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
      logError("Engagement Stats: Database error", error, { component: 'engagement-stats', action: 'GET' });
      return ApiErrors.internalError("Failed to fetch engagement stats");
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

    return apiSuccess({
      totalLikes,
      totalBookmarks,
      topLiked,
      topBookmarked,
    });
  } catch (error) {
    logError("Engagement Stats: Unexpected error", error, { component: 'engagement-stats', action: 'GET' });
    return ApiErrors.internalError("Failed to fetch engagement stats");
  }
}
