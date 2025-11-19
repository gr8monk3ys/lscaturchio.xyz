import { NextRequest, NextResponse } from 'next/server';
import { getAllBlogs } from '@/lib/getAllBlogs';
import { withRateLimit } from '@/lib/with-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';

const handleGet = async (
  request: NextRequest,
  { params }: { params: { slug: string } }
) => {
  try {
    const blogs = await getAllBlogs();
    const blog = blogs.find(b => b.slug === params.slug);

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
        url: `https://lscaturchio.xyz/blog/${blog.slug}`,
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
};

// Export with rate limiting (100 requests per minute - public read-only endpoint)
export const GET = withRateLimit(handleGet, RATE_LIMITS.PUBLIC);
