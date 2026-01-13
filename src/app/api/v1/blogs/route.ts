import { NextRequest, NextResponse } from 'next/server';
import { getAllBlogs } from '@/lib/getAllBlogs';
import { withRateLimit } from '@/lib/with-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { logError } from '@/lib/logger';
import { validatePagination } from '@/lib/sanitize';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lscaturchio.xyz';

const handleGet = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { limit, offset } = validatePagination(
      searchParams.get('limit'),
      searchParams.get('offset')
    );
    const tag = searchParams.get('tag');

    let blogs = await getAllBlogs();

    // Filter by tag if specified
    if (tag) {
      blogs = blogs.filter(blog => blog.tags?.includes(tag));
    }

    // Sort by date (newest first)
    blogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Pagination
    const total = blogs.length;
    const paginatedBlogs = blogs.slice(offset, offset + limit);

    return NextResponse.json({
      data: paginatedBlogs.map(blog => ({
        title: blog.title,
        description: blog.description,
        date: blog.date,
        slug: blog.slug,
        tags: blog.tags || [],
        image: blog.image || '/images/blog/default.webp',
        url: `${SITE_URL}/blog/${blog.slug}`,
      })),
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    logError('Blogs API: Unexpected error', error, { component: 'v1/blogs', action: 'GET' });
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
};

// Export with rate limiting (100 requests per minute - public read-only endpoint)
export const GET = withRateLimit(handleGet, RATE_LIMITS.PUBLIC);
