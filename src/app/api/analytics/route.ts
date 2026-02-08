import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAllBlogs } from '@/lib/getAllBlogs';
import { withRateLimit } from '@/lib/with-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { logError } from '@/lib/logger';
import { validateApiKey } from '@/lib/api-auth';

interface AnalyticsData {
  newsletter: {
    activeSubscribers: number;
    totalSubscribers: number;
    unsubscribed: number;
    last30Days: number;
  };
  engagement: {
    totalViews: number;
    totalLikes: number;
    totalBookmarks: number;
    uniquePosts: number;
  };
  topPosts: {
    byViews: { slug: string; title: string; views: number }[];
    byLikes: { slug: string; title: string; likes: number }[];
    byBookmarks: { slug: string; title: string; bookmarks: number }[];
  };
  content: {
    totalPosts: number;
    tags: { name: string; count: number }[];
  };
}

const handleGet = async (request: NextRequest) => {
  // Require API key authentication
  const authError = validateApiKey(request, { component: 'analytics' });
  if (authError) return authError;

  try {
    const sql = getDb();
    const allBlogs = await getAllBlogs();
    const blogMap = new Map(allBlogs.map((blog) => [blog.slug, blog.title]));

    // Fetch newsletter stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      activeRows,
      totalRows,
      unsubRows,
      recentRows,
    ] = await Promise.all([
      sql`SELECT count_active_subscribers() as count`,
      sql`SELECT COUNT(*) as count FROM newsletter_subscribers`,
      sql`SELECT COUNT(*) as count FROM newsletter_subscribers WHERE is_active = false`,
      sql`SELECT COUNT(*) as count FROM newsletter_subscribers WHERE subscribed_at >= ${thirtyDaysAgo.toISOString()} AND is_active = true`,
    ]);

    const activeCount = Number(activeRows[0].count) || 0;
    const totalCount = Number(totalRows[0].count) || 0;
    const unsubCount = Number(unsubRows[0].count) || 0;
    const recentCount = Number(recentRows[0].count) || 0;

    // Fetch views
    const viewsData = await sql`
      SELECT slug, count FROM views ORDER BY count DESC
    `;

    // Fetch reactions
    const reactionsData = await sql`
      SELECT slug, likes, bookmarks FROM reactions ORDER BY likes DESC
    `;

    // Calculate totals
    const totalViews = viewsData.reduce((sum, v) => sum + v.count, 0);
    const totalLikes = reactionsData.reduce((sum, r) => sum + r.likes, 0);
    const totalBookmarks = reactionsData.reduce((sum, r) => sum + r.bookmarks, 0);

    // Get unique posts with any engagement
    const postsWithEngagement = new Set([
      ...viewsData.map(v => v.slug),
      ...reactionsData.map(r => r.slug),
    ]);

    // Calculate tag distribution
    const tagCounts = new Map<string, number>();
    allBlogs.forEach(blog => {
      (blog.tags || []).forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    const tags = Array.from(tagCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const analyticsData: AnalyticsData = {
      newsletter: {
        activeSubscribers: activeCount,
        totalSubscribers: totalCount,
        unsubscribed: unsubCount,
        last30Days: recentCount,
      },
      engagement: {
        totalViews,
        totalLikes,
        totalBookmarks,
        uniquePosts: postsWithEngagement.size,
      },
      topPosts: {
        byViews: viewsData.slice(0, 5).map(v => ({
          slug: v.slug,
          title: blogMap.get(v.slug) || v.slug,
          views: v.count,
        })),
        byLikes: reactionsData
          .filter(r => r.likes > 0)
          .sort((a, b) => b.likes - a.likes)
          .slice(0, 5)
          .map(r => ({
            slug: r.slug,
            title: blogMap.get(r.slug) || r.slug,
            likes: r.likes,
          })),
        byBookmarks: reactionsData
          .filter(r => r.bookmarks > 0)
          .sort((a, b) => b.bookmarks - a.bookmarks)
          .slice(0, 5)
          .map(r => ({
            slug: r.slug,
            title: blogMap.get(r.slug) || r.slug,
            bookmarks: r.bookmarks,
          })),
      },
      content: {
        totalPosts: allBlogs.length,
        tags,
      },
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    logError('Analytics: Unexpected error', error, { component: 'analytics', action: 'GET' });
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
};

export const GET = withRateLimit(handleGet, RATE_LIMITS.PUBLIC);
