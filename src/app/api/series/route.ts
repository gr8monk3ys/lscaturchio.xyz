import { NextRequest, NextResponse } from "next/server";
import { getSeriesPosts } from "@/lib/getAllBlogs";

/**
 * API route to fetch posts from a specific series
 * GET /api/series?name=seriesName
 */
export async function GET(req: NextRequest) {
  try {
    const seriesName = req.nextUrl.searchParams.get("name");

    if (!seriesName) {
      return NextResponse.json(
        { error: "Series name is required" },
        { status: 400 }
      );
    }

    const posts = await getSeriesPosts(seriesName);

    const simplifiedPosts = posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      seriesOrder: post.seriesOrder ?? 0,
    }));

    return NextResponse.json({
      series: seriesName,
      count: simplifiedPosts.length,
      posts: simplifiedPosts,
    });
  } catch (error) {
    console.error("[Series API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch series posts" },
      { status: 500 }
    );
  }
}
