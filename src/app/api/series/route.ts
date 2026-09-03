import { NextRequest } from "next/server";
import { getSeriesPosts } from "@/lib/getAllBlogs";
import { logError } from "@/lib/logger";
import { withRateLimit, RATE_LIMITS } from "@/lib/with-rate-limit";
import { apiSuccess, ApiErrors } from "@/lib/api-response";

/**
 * API route to fetch posts from a specific series
 * GET /api/series?name=seriesName
 */
const handleGet = async (req: NextRequest) => {
  try {
    const seriesName = req.nextUrl.searchParams.get("name");

    if (!seriesName) {
      return ApiErrors.badRequest("Series name is required");
    }

    const posts = await getSeriesPosts(seriesName);

    const simplifiedPosts = posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      seriesOrder: post.seriesOrder ?? 0,
    }));

    return apiSuccess({
      series: seriesName,
      count: simplifiedPosts.length,
      posts: simplifiedPosts,
    });
  } catch (error) {
    logError("Series API: Unexpected error", error, { component: 'series', action: 'GET' });
    return ApiErrors.internalError("Failed to fetch series posts");
  }
};

export const GET = withRateLimit(handleGet, RATE_LIMITS.PUBLIC);
