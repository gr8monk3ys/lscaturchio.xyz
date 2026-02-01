import { NextRequest, NextResponse } from "next/server";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { logError } from "@/lib/logger";

/**
 * API route to fetch blog statistics
 * GET /api/blog-stats
 * Returns total posts, reading time, and top tags
 */
export async function GET(_request: NextRequest) {
  try {
    const blogs = await getAllBlogs();

    // Calculate total posts
    const totalPosts = blogs.length;

    // Estimate average reading time (assuming 200 words per minute)
    // We'll estimate based on content length
    const totalReadingTime = blogs.reduce((total, blog) => {
      // Rough estimate: 1000 characters ≈ 5 minutes
      const estimatedMinutes = Math.ceil(blog.content.length / 1000) * 5;
      return total + estimatedMinutes;
    }, 0);

    const avgReadingTime = Math.round(totalReadingTime / totalPosts);

    // Count tags
    const tagCounts = new Map<string, number>();
    blogs.forEach((blog) => {
      blog.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    // Get top 5 tags
    const topTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      totalPosts,
      totalReadingTime,
      avgReadingTime,
      topTags,
    });
  } catch (error) {
    logError("Blog Stats: Unexpected error", error, { component: 'blog-stats', action: 'GET' });
    return NextResponse.json(
      { error: "Failed to fetch blog stats" },
      { status: 500 }
    );
  }
}
