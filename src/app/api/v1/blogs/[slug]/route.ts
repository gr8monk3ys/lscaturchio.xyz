import { NextRequest, NextResponse } from 'next/server';
import { getAllBlogs } from '@/lib/getAllBlogs';
import { withRateLimit } from '@/lib/with-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { logError } from '@/lib/logger';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lscaturchio.xyz';

const handleGet = async (
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) => {
  const { slug } = await context.params;
  try {
    const blogs = await getAllBlogs();
    const blog = blogs.find(b => b.slug === slug);

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        title: blog.title,
        description: blog.description,
        date: blog.date,
        slug: blog.slug,
        tags: blog.tags || [],
        image: blog.image || '/images/blog/default.webp',
        url: `${SITE_URL}/blog/${blog.slug}`,
      },
    });
  } catch (error) {
    logError('Blogs API: Unexpected error', error, { component: 'v1/blogs/[slug]', action: 'GET', slug });
    return NextResponse.json(
      { error: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
};

// Export with rate limiting (100 requests per minute - public read-only endpoint)
export const GET = withRateLimit(handleGet, RATE_LIMITS.PUBLIC);
