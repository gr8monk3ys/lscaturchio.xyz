import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const searchEmbeddings = vi.fn();
const getAllBlogs = vi.fn();

vi.mock('@/lib/embeddings', () => ({ searchEmbeddings: (...a: unknown[]) => searchEmbeddings(...a) }));
vi.mock('@/lib/getAllBlogs', () => ({ getAllBlogs: () => getAllBlogs() }));
vi.mock('@/lib/logger', () => ({ logError: vi.fn() }));
vi.mock('@/lib/with-rate-limit', () => ({
  withRateLimit: (handler: (req: NextRequest) => Promise<Response>) => handler,
}));
vi.mock('@/lib/rate-limit', () => ({ RATE_LIMITS: { RELATED_POSTS: { limit: 10, window: 60000 } } }));

import { GET } from '@/app/api/related-posts/route';

const BLOGS = [
  { slug: 'carceral', title: 'The Prison System', description: 'on mass incarceration', date: '2026-02-01', image: '/a.webp', tags: ['justice'] },
  { slug: 'bureaucratic', title: 'Bureaucratic Violence', description: 'how systems harm', date: '2026-02-02', image: '/b.webp', tags: ['institutions'] },
  { slug: 'shares-tag', title: 'Shares A Tag', description: 'same tag, different idea', date: '2026-02-03', image: '/c.webp', tags: ['justice'] },
];

function req(slug: string, title: string) {
  return new NextRequest(
    `http://localhost/api/related-posts?title=${encodeURIComponent(title)}&url=/blog/${slug}&limit=2`
  );
}

describe('Related Posts API (semantic-first)', () => {
  beforeEach(() => {
    searchEmbeddings.mockReset();
    getAllBlogs.mockReset().mockResolvedValue(BLOGS);
  });

  it('ranks a high-similarity post above a shared-tag-only post', async () => {
    // 'bureaucratic' shares NO tag with 'carceral' but is semantically closest;
    // 'shares-tag' shares the tag but is semantically distant.
    searchEmbeddings.mockResolvedValue([
      { similarity: 0.92, metadata: { url: '/blog/bureaucratic' } },
      { similarity: 0.41, metadata: { url: '/blog/shares-tag' } },
    ]);

    const res = await GET(req('carceral', 'The Prison System'));
    const body = await res.json();
    expect(body.data.related[0].url).toBe('/blog/bureaucratic');
  });

  it('excludes the current post from results', async () => {
    searchEmbeddings.mockResolvedValue([
      { similarity: 0.99, metadata: { url: '/blog/carceral' } },
      { similarity: 0.5, metadata: { url: '/blog/bureaucratic' } },
    ]);
    const res = await GET(req('carceral', 'The Prison System'));
    const body = await res.json();
    expect(body.data.related.every((p: { url: string }) => p.url !== '/blog/carceral')).toBe(true);
  });

  it('falls back to shared tags when embeddings return nothing', async () => {
    searchEmbeddings.mockResolvedValue([]);
    const res = await GET(req('carceral', 'The Prison System'));
    const body = await res.json();
    // 'shares-tag' shares the 'justice' tag with current post.
    expect(body.data.related.map((p: { url: string }) => p.url)).toContain('/blog/shares-tag');
  });

  it('400s without a title', async () => {
    const res = await GET(new NextRequest('http://localhost/api/related-posts?url=/blog/carceral'));
    expect(res.status).toBe(400);
  });

  it('400s when the title is unreasonably long (would be embedded verbatim)', async () => {
    // When the post is not found locally the raw title is sent to the embedding
    // provider, so an oversized title would burn quota / risk a provider error.
    const longTitle = 'a'.repeat(1000);
    const res = await GET(
      new NextRequest(`http://localhost/api/related-posts?title=${encodeURIComponent(longTitle)}`)
    );
    expect(res.status).toBe(400);
    expect(searchEmbeddings).not.toHaveBeenCalled();
  });
});
