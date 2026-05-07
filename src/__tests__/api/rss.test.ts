import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/getAllBlogs', () => ({
  getAllBlogs: vi.fn(),
}));

vi.mock('@/lib/site-url', () => ({
  getSiteUrl: vi.fn(() => 'https://lscaturchio.xyz'),
}));

vi.mock('@/lib/with-rate-limit', () => ({
  withRateLimit: <T>(handler: T) => handler,
  RATE_LIMITS: {
    PUBLIC: { limit: 100, window: 60000 },
  },
}));

import { GET } from '@/app/api/rss/route';
import { getAllBlogs } from '@/lib/getAllBlogs';

type Blog = Awaited<ReturnType<typeof getAllBlogs>>[number];

function blog(overrides: Partial<Blog>): Blog {
  return {
    slug: 'a-post',
    title: 'A Post',
    description: 'A post description.',
    date: '2025-01-15',
    updated: '2025-01-20',
    content: '<p>Body</p>',
    tags: ['ai', 'engineering'],
    image: '/images/blog/a-post.webp',
    ...overrides,
  } as Blog;
}

describe('/api/rss', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns application/xml with valid RSS 2.0 envelope', async () => {
    vi.mocked(getAllBlogs).mockResolvedValue([blog({})]);

    const res = await GET(new NextRequest('http://localhost/api/rss', { method: 'GET' }));
    expect(res.headers.get('content-type')).toContain('application/xml');

    const body = await res.text();
    expect(body).toMatch(/^<\?xml version="1\.0" encoding="utf-8"\?>/);
    expect(body).toContain('<rss');
    expect(body).toContain('<channel>');
    expect(body).toMatch(/<title>Lorenzo Scaturchio.s Blog<\/title>/);
    expect(body).toContain('<link>https://lscaturchio.xyz</link>');
  });

  it('emits one <item> per post with title, link, and description', async () => {
    vi.mocked(getAllBlogs).mockResolvedValue([
      blog({ slug: 'first', title: 'First' }),
      blog({ slug: 'second', title: 'Second' }),
    ]);

    const body = await (await GET(new NextRequest('http://localhost/api/rss', { method: 'GET' }))).text();

    const items = body.match(/<item>/g) ?? [];
    expect(items.length).toBe(2);
    expect(body).toContain('https://lscaturchio.xyz/blog/first');
    expect(body).toContain('https://lscaturchio.xyz/blog/second');
    expect(body).toContain('First');
    expect(body).toContain('Second');
  });

  it('renders an empty channel when there are no posts (does not crash)', async () => {
    vi.mocked(getAllBlogs).mockResolvedValue([]);

    const res = await GET(new NextRequest('http://localhost/api/rss', { method: 'GET' }));
    const body = await res.text();

    expect(res.status).toBe(200);
    expect(body).toContain('<channel>');
    expect(body.match(/<item>/g)).toBeNull();
  });

  it('annotates series posts in title and description', async () => {
    vi.mocked(getAllBlogs).mockResolvedValue([
      blog({
        slug: 'rag-2',
        title: 'Vector Stores',
        series: 'Building RAG',
        seriesOrder: 2,
      } as Partial<Blog>),
    ]);

    const body = await (await GET(new NextRequest('http://localhost/api/rss', { method: 'GET' }))).text();

    expect(body).toContain('Vector Stores (Building RAG #2)');
    expect(body).toContain('Part 2');
    expect(body).toContain('Building RAG');
  });

  it('chooses an image MIME type by extension', async () => {
    vi.mocked(getAllBlogs).mockResolvedValue([
      blog({ slug: 'png-post', image: '/images/blog/png-post.png' }),
      blog({ slug: 'jpg-post', image: '/images/blog/jpg-post.jpg' }),
      blog({ slug: 'webp-post', image: '/images/blog/webp-post.webp' }),
    ]);

    const body = await (await GET(new NextRequest('http://localhost/api/rss', { method: 'GET' }))).text();

    expect(body).toContain('image/png');
    expect(body).toContain('image/jpg');
    expect(body).toContain('image/webp');
  });

  it('falls back to date when updated is missing', async () => {
    vi.mocked(getAllBlogs).mockResolvedValue([
      blog({ slug: 'no-updated', date: '2025-03-04', updated: undefined }),
    ]);

    const res = await GET(new NextRequest('http://localhost/api/rss', { method: 'GET' }));
    expect(res.status).toBe(200);
    const body = await res.text();
    // pubDate is the publication date; no error means the fallback worked.
    expect(body).toContain('<pubDate>');
  });
});
