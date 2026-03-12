import { getAllBlogs } from "@/lib/getAllBlogs";
import { logError } from "@/lib/logger";
import { withRateLimit, RATE_LIMITS } from "@/lib/with-rate-limit";
import { apiSuccess, ApiErrors } from "@/lib/api-response";
import { getBlogStats } from "@/lib/blog-data";

/**
 * API route to fetch blog statistics
 * GET /api/blog-stats
 * Returns total posts, reading time, and top tags
 */
const handleGet = async () => {
  try {
    const blogs = await getAllBlogs();
    const { totalPosts, totalReadingTime, avgReadingTime, topTags } = getBlogStats(blogs);

    return apiSuccess({
      totalPosts,
      totalReadingTime,
      avgReadingTime,
      topTags,
    });
  } catch (error) {
    logError("Blog Stats: Unexpected error", error, { component: 'blog-stats', action: 'GET' });
    return ApiErrors.internalError("Failed to fetch blog stats");
  }
};

export const GET = withRateLimit(handleGet, RATE_LIMITS.PUBLIC);
