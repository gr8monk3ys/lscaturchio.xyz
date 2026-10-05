import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// The route is `getBlogStats` (covered in blog-data.test.ts) over the
// catalogue's default, published-only answer (covered in getAllBlogs.test.ts).
// What is left to test here is the envelope and the failure path.

vi.mock('@/lib/getAllBlogs', () => ({
  getAllBlogs: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

vi.mock('@/lib/rate-limit-redis', () => ({
  getUpstashStore: vi.fn(() => null),
}));

import { GET } from '@/app/api/blog-stats/route';
import { getAllBlogs, type BlogPost } from '@/lib/getAllBlogs';
import { logError } from '@/lib/logger';

function post(slug: string, readingTimeMinutes: number, tags: string[]): BlogPost {
  return {
    slug,
    title: slug,
    description: '',
    date: '2024-01-01',
    image: '/images/blog/default.webp',
    tags,
    content: '',
    published: true,
    readingTimeMinutes,
    words: readingTimeMinutes * 200,
  };
}

function request(): NextRequest {
  return new NextRequest('http://localhost:3000/api/blog-stats', { method: 'GET' });
}

describe('/api/blog-stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reports totals and top tags over the catalogue answer', async () => {
    vi.mocked(getAllBlogs).mockResolvedValue([
      post('post-1', 10, ['javascript', 'react']),
      post('post-2', 20, ['typescript', 'react']),
      post('post-3', 5, ['javascript']),
    ]);

    const response = await GET(request());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      data: {
        totalPosts: 3,
        totalReadingTime: 35,
        avgReadingTime: 12,
        topTags: [
          { tag: 'javascript', count: 2 },
          { tag: 'react', count: 2 },
          { tag: 'typescript', count: 1 },
        ],
      },
    });
  });

  it('returns 500 and logs when the catalogue read fails', async () => {
    const error = new Error('File system error');
    vi.mocked(getAllBlogs).mockRejectedValue(error);

    const response = await GET(request());
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Failed to fetch blog stats');
    expect(logError).toHaveBeenCalledWith('Blog Stats: Unexpected error', error, {
      component: 'blog-stats',
      action: 'GET',
    });
  });
});
