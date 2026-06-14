import { describe, it, expect, vi, afterEach } from 'vitest';
import { getLiveLastWatch } from '@/lib/letterboxd';

const RSS = `<?xml version="1.0"?><rss><channel>
  <item>
    <title>A written review, not a diary entry</title>
    <description>no film tags here</description>
  </item>
  <item>
    <title>Disclosure Day, 2026 - ★★½</title>
    <letterboxd:filmTitle>Disclosure Day</letterboxd:filmTitle>
    <letterboxd:filmYear>2026</letterboxd:filmYear>
    <letterboxd:memberRating>2.5</letterboxd:memberRating>
  </item>
</channel></rss>`;

function mockFetch(impl: () => Promise<Response> | Response) {
  vi.stubGlobal('fetch', vi.fn(impl));
}

afterEach(() => vi.unstubAllGlobals());

describe('getLiveLastWatch', () => {
  it('parses the first diary entry (skipping non-film items)', async () => {
    mockFetch(() => new Response(RSS, { status: 200 }));
    const result = await getLiveLastWatch();
    expect(result).toEqual({ title: 'Disclosure Day', year: '2026', rating: 2.5 });
  });

  it('returns an unrated entry with rating null', async () => {
    const unrated = RSS.replace(/<letterboxd:memberRating>.*?<\/letterboxd:memberRating>/, '');
    mockFetch(() => new Response(unrated, { status: 200 }));
    const result = await getLiveLastWatch();
    expect(result).toMatchObject({ title: 'Disclosure Day', rating: null });
  });

  it('returns null on a non-OK response (caller falls back to CSV)', async () => {
    mockFetch(() => new Response('nope', { status: 503 }));
    expect(await getLiveLastWatch()).toBeNull();
  });

  it('returns null when the fetch throws', async () => {
    mockFetch(() => Promise.reject(new Error('network down')));
    expect(await getLiveLastWatch()).toBeNull();
  });

  it('returns null when no item has a film title', async () => {
    mockFetch(() => new Response('<rss><channel><item><title>just a review</title></item></channel></rss>', { status: 200 }));
    expect(await getLiveLastWatch()).toBeNull();
  });
});
