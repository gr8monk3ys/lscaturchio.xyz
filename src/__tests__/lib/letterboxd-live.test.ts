import { describe, it, expect, vi } from 'vitest';
import { getLiveLastWatch } from '@/lib/letterboxd';

// Feed parsing — non-film items, the rating range, entities — is covered once,
// in letterboxd-format.test.ts. This file covers only the adapter: fetch, hand
// the body to that parser, and degrade to null.

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
  logWarn: vi.fn(),
}));

const RSS = `<?xml version="1.0"?><rss><channel>
  <item><title>A list, not a diary entry</title></item>
  <item>
    <letterboxd:filmTitle>Disclosure Day</letterboxd:filmTitle>
    <letterboxd:filmYear>2026</letterboxd:filmYear>
    <letterboxd:memberRating>2.5</letterboxd:memberRating>
  </item>
</channel></rss>`;

const fetchReturning = (response: () => Promise<Response>) =>
  vi.fn(response) as unknown as typeof fetch;

describe('getLiveLastWatch', () => {
  it('returns the first film in the feed, its rating as a number, revalidated hourly', async () => {
    const fetchFeed = fetchReturning(async () => new Response(RSS, { status: 200 }));

    expect(await getLiveLastWatch(fetchFeed)).toEqual({ title: 'Disclosure Day', year: '2026', rating: 2.5 });
    expect(fetchFeed).toHaveBeenCalledWith(
      'https://letterboxd.com/gr8monk3ys/rss/',
      expect.objectContaining({ next: { revalidate: 3600 } }),
    );
  });

  it('returns null — so the caller falls back to the CSV — on a bad status, a throw, or no film', async () => {
    expect(await getLiveLastWatch(fetchReturning(async () => new Response('nope', { status: 503 })))).toBeNull();
    expect(await getLiveLastWatch(fetchReturning(() => Promise.reject(new Error('network down'))))).toBeNull();
    expect(await getLiveLastWatch(fetchReturning(async () => new Response('<rss/>', { status: 200 })))).toBeNull();
  });
});
