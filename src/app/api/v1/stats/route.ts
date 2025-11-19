import { NextRequest, NextResponse } from 'next/server';
import { getAllBlogs } from '@/lib/getAllBlogs';
import { withRateLimit } from '@/lib/with-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';

const handleGet = async (request: NextRequest) => {
  try {
    const blogs = await getAllBlogs();

    // Calculate stats
    const totalPosts = blogs.length;
    const allTags = blogs.flatMap(blog => blog.tags || []);
    const uniqueTags = Array.from(new Set(allTags));
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostPopularTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    return NextResponse.json({
      data: {
        totalPosts,
        totalTags: uniqueTags.length,
        popularTags: mostPopularTags,
        latestPost: blogs.sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0],
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
};

// Export with rate limiting (100 requests per minute - public read-only endpoint)
export const GET = withRateLimit(handleGet, RATE_LIMITS.PUBLIC);
