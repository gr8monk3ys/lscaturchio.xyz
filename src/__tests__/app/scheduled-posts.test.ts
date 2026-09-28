import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// A post whose front-matter date is in the future is scheduled: the blog index
// and the feed hide it until its day. The sitemap and the public posts API are
// discovery surfaces too, so they must not announce it early.

vi.mock('@/lib/getAllBlogs', () => ({
  getAllBlogs: vi.fn(),
}));

vi.mock('@/lib/with-rate-limit', () => ({
  withRateLimit: <T>(handler: T) => handler,
}));

import { getAllBlogs } from '@/lib/getAllBlogs';

type Blog = Awaited<ReturnType<typeof getAllBlogs>>[number];

function blog(slug: string, published: boolean, tags: string[] = []): Blog {
  return {
    slug,
    title: slug,
    description: '',
    date: '2026-01-01',
    content: '',
    tags,
    image: '/images/blog/default.webp',
    published,
    readingTimeMinutes: 1,
    words: 10,
  } as Blog;
}

describe('scheduled posts', () => {
  beforeEach(() => {
    vi.mocked(getAllBlogs).mockResolvedValue([
      blog('live-post', true, ['live-tag']),
      blog('scheduled-post', false, ['scheduled-only-tag']),
    ]);
  });

  it('are left out of the sitemap, along with tags only they carry', async () => {
    const { default: sitemap } = await import('@/app/sitemap');
    const urls = (await sitemap()).map((entry) => entry.url).join('\n');

    expect(urls).toContain('/blog/live-post');
    expect(urls).not.toContain('/blog/scheduled-post');
    expect(urls).not.toContain('/tag/scheduled-only-tag');
  });

  it('are left out of /api/posts', async () => {
    const { GET } = await import('@/app/api/posts/route');
    const res = await GET(new NextRequest('http://localhost/api/posts'));
    const body = JSON.stringify(await res.json());

    expect(body).toContain('live-post');
    expect(body).not.toContain('scheduled-post');
  });
});
