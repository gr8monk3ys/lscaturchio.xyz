import { NextResponse } from "next/server";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { logError } from "@/lib/logger";

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
export async function GET() {
  try {
    const blogs = await getAllBlogs();

    // Group posts by series
    const seriesMap = new Map<string, SeriesInfo["posts"]>();

    blogs.forEach((blog) => {
      if (blog.series && blog.seriesOrder) {
        if (!seriesMap.has(blog.series)) {
          seriesMap.set(blog.series, []);
        }

        seriesMap.get(blog.series)!.push({
          slug: blog.slug,
          title: blog.title,
          description: blog.description,
          date: blog.date,
          image: blog.image,
          seriesOrder: blog.seriesOrder,
        });
      }
    });

    // Convert to array and calculate stats
    const allSeries: SeriesInfo[] = Array.from(seriesMap.entries()).map(
      ([name, posts]) => {
        // Sort posts by seriesOrder
        const sortedPosts = posts.sort((a, b) => a.seriesOrder - b.seriesOrder);

        // Estimate total reading time (1000 chars ≈ 5 min)
        const totalReadingTime = sortedPosts.reduce((total, post) => {
          const estimatedMinutes = 5; // Default estimate per post
          return total + estimatedMinutes;
        }, 0);

        return {
          name,
          posts: sortedPosts,
          totalPosts: sortedPosts.length,
          totalReadingTime,
        };
      }
    );

    // Sort series by total posts (descending)
    allSeries.sort((a, b) => b.totalPosts - a.totalPosts);

    return NextResponse.json({
      series: allSeries,
      count: allSeries.length,
    });
  } catch (error) {
    logError("All Series API: Unexpected error", error, { component: 'all-series', action: 'GET' });
    return NextResponse.json(
      { error: "Failed to fetch series" },
      { status: 500 }
    );
  }
}
