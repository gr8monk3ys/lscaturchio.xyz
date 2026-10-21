import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const relevantEssays = vi.fn();
const getAllBlogs = vi.fn();

vi.mock('@/lib/retrieval', () => ({ relevantEssays: (...a: unknown[]) => relevantEssays(...a) }));
vi.mock('@/lib/getAllBlogs', () => ({ getAllBlogs: () => getAllBlogs() }));
vi.mock('@/lib/logger', () => ({ logError: vi.fn() }));
vi.mock('@/lib/rate-limit', () => ({ withRateLimit: <T>(handler: T) => handler }));

import { GET } from '@/app/api/related-posts/route';

const BLOGS = [
  { slug: 'carceral', title: 'The Prison System', description: 'on mass incarceration', date: '2026-02-01', image: '/a.webp', tags: ['justice'] },
  { slug: 'bureaucratic', title: 'Bureaucratic Violence', description: 'how systems harm', date: '2026-02-02', image: '/b.webp', tags: ['institutions'] },
  { slug: 'shares-tag', title: 'Shares A Tag', description: 'same tag, different idea', date: '2026-02-03', image: '/c.webp', tags: ['justice'] },
];

/** An essay as the retrieval module returns it; only url/slug/scores matter here. */
function essay(slug: string, relevance: number, similarity = relevance) {
  return {
    url: `/blog/${slug}`,
    slug,
    title: slug,
    description: '',
    date: '',
    tags: [],
    similarity,
    relevance,
    snippets: [],
  };
}

function req(slug: string, title: string) {
  return new NextRequest(
    `http://localhost/api/related-posts?title=${encodeURIComponent(title)}&url=/blog/${slug}&limit=2`
  );
}

describe('Related Posts API (semantic-first)', () => {
  beforeEach(() => {
    relevantEssays.mockReset();
    getAllBlogs.mockReset().mockResolvedValue(BLOGS);
  });

  it('ranks a high-similarity post above a shared-tag-only post', async () => {
    // 'bureaucratic' shares NO tag with 'carceral' but is semantically closest;
    // 'shares-tag' shares the tag but is semantically distant.
    relevantEssays.mockResolvedValue([essay('bureaucratic', 1), essay('shares-tag', 0.45)]);

    const res = await GET(req('carceral', 'The Prison System'));
    const body = await res.json();
    expect(body.data.related[0].url).toBe('/blog/bureaucratic');
  });

  it('ranks a keyword-only match by its relevance, not as zero similarity', async () => {
    // 'bureaucratic' matched on exact terms alone (no cosine), and ranked top of
    // the fused list; it used to score 0 here and lose to any vector hit.
    relevantEssays.mockResolvedValue([essay('bureaucratic', 1, 0), essay('shares-tag', 0.5)]);

    const res = await GET(req('carceral', 'The Prison System'));
    const body = await res.json();
    expect(body.data.related.map((p: { url: string }) => p.url)).toEqual([
      '/blog/bureaucratic',
      '/blog/shares-tag',
    ]);
    // The displayed similarity stays the cosine, which is 0 for a keyword match.
    expect(body.data.related[0].similarity).toBe(0);
  });

  it('queries on the current post’s title and description, with headroom past the limit', async () => {
    relevantEssays.mockResolvedValue([]);
    await GET(req('carceral', 'The Prison System'));
    expect(relevantEssays).toHaveBeenCalledWith('The Prison System. on mass incarceration', { limit: 22 });
  });

  it('excludes the current post from results', async () => {
    relevantEssays.mockResolvedValue([essay('carceral', 1), essay('bureaucratic', 0.5)]);
    const res = await GET(req('carceral', 'The Prison System'));
    const body = await res.json();
    expect(body.data.related.every((p: { url: string }) => p.url !== '/blog/carceral')).toBe(true);
  });

  it('falls back to shared tags when embeddings return nothing', async () => {
    relevantEssays.mockResolvedValue([]);
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
    expect(relevantEssays).not.toHaveBeenCalled();
  });
});
