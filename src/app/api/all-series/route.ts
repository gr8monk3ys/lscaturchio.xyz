import { listSeries } from "@/lib/getAllBlogs";
import { logError } from "@/lib/logger";
import { withRateLimit, RATE_LIMITS } from "@/lib/with-rate-limit";
import { apiSuccess, ApiErrors } from "@/lib/api-response";

interface SeriesInfo {
  name: string;
  posts: {
    slug: string;
    title: string;
    description: string;
    date: string;
    image: string;
    seriesOrder: number;
  }[];
  totalPosts: number;
  totalReadingTime: number;
}

/**
 * API route to fetch all blog series
 * GET /api/all-series
 * Returns all series with their posts
 */
const handleGet = async () => {
  try {
    const allSeries: SeriesInfo[] = (await listSeries()).map((series) => ({
      ...series,
      posts: series.posts.map((post) => ({
        slug: post.slug,
        title: post.title,
        description: post.description,
        date: post.date,
        image: post.image,
        seriesOrder: post.seriesOrder ?? 0,
      })),
    }));

    return apiSuccess({
      series: allSeries,
      count: allSeries.length,
    });
  } catch (error) {
    logError("All Series API: Unexpected error", error, { component: 'all-series', action: 'GET' });
    return ApiErrors.internalError("Failed to fetch series");
  }
};

export const GET = withRateLimit(handleGet, RATE_LIMITS.PUBLIC);
