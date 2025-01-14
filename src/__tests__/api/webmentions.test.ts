import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/webmentions', () => ({
  fetchWebmentions: vi.fn(),
}));

vi.mock('@/lib/site-url', () => ({
  getSiteUrl: vi.fn(() => 'https://lscaturchio.xyz'),
}));

vi.mock('@/lib/with-rate-limit', () => ({
  withRateLimit: <T>(handler: T) => handler,
}));

vi.mock('@/lib/rate-limit', () => ({
  RATE_LIMITS: {
    PUBLIC: { limit: 100, window: 60000 },
  },
}));

import { GET } from '@/app/api/webmentions/route';
import { fetchWebmentions } from '@/lib/webmentions';

function req(path: string | null): NextRequest {
  const url = path === null
    ? 'http://localhost/api/webmentions'
    : `http://localhost/api/webmentions?path=${encodeURIComponent(path)}`;
  return new NextRequest(url, { method: 'GET' });
}

describe('/api/webmentions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns webmentions for a valid blog path', async () => {
    vi.mocked(fetchWebmentions).mockResolvedValue({
      target: 'https://lscaturchio.xyz/blog/post',
      counts: { like: 2, repost: 0, reply: 1, mention: 0 },
      entries: [],
    });

    const res = await GET(req('/blog/post'));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.counts.like).toBe(2);
    expect(vi.mocked(fetchWebmentions)).toHaveBeenCalledWith(
      'https://lscaturchio.xyz/blog/post',
    );
  });

  it('sets a CDN-friendly Cache-Control header', async () => {
    vi.mocked(fetchWebmentions).mockResolvedValue({
      target: 'https://lscaturchio.xyz/',
      counts: { like: 0, repost: 0, reply: 0, mention: 0 },
      entries: [],
    });

    const res = await GET(req('/'));
    const cc = res.headers.get('cache-control') ?? '';
    expect(cc).toContain('s-maxage=3600');
    expect(cc).toContain('stale-while-revalidate');
  });

  it('returns 400 when path is missing', async () => {
    const res = await GET(req(null));
    expect(res.status).toBe(400);
    expect(vi.mocked(fetchWebmentions)).not.toHaveBeenCalled();
  });

  it.each([
    ['no leading slash', 'blog/post'],
    ['protocol-relative', '//evil.com/x'],
    ['absolute URL', 'https://evil.com/x'],
    ['contains fragment', '/blog/post#section'],
    ['too long', `/${'a'.repeat(501)}`],
  ])('rejects unsafe path: %s', async (_label, path) => {
    const res = await GET(req(path));
    expect(res.status).toBe(400);
    expect(vi.mocked(fetchWebmentions)).not.toHaveBeenCalled();
  });

  it('returns degraded payload (200) when upstream fetch throws', async () => {
    vi.mocked(fetchWebmentions).mockRejectedValue(new Error('upstream down'));

    const res = await GET(req('/blog/post'));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.degraded).toBe(true);
    expect(json.target).toBe('https://lscaturchio.xyz/blog/post');
    expect(json.counts).toEqual({ like: 0, repost: 0, reply: 0, mention: 0 });
    expect(json.entries).toEqual([]);
  });

  it('still sets Cache-Control on the degraded path', async () => {
    vi.mocked(fetchWebmentions).mockRejectedValue(new Error('boom'));

    const res = await GET(req('/blog/post'));
    expect(res.headers.get('cache-control')).toContain('s-maxage=3600');
  });
});
