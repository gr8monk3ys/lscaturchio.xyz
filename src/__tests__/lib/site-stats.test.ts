import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSql = vi.fn();

vi.mock('@/lib/db', () => ({
  getDb: vi.fn(() => mockSql),
  isDatabaseConfigured: vi.fn(() => true),
}));

vi.mock('@/lib/getAllBlogs', () => ({
  getAllBlogs: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
}));

import { getSiteStats } from '@/lib/site-stats';
import { getAllBlogs } from '@/lib/getAllBlogs';
import { isDatabaseConfigured } from '@/lib/db';

function post(slug: string, readingTimeMinutes = 6) {
  return {
    slug,
    title: `Title for ${slug}`,
    description: 'desc',
    date: '2025-01-01',
    tags: ['ai'],
    image: `/images/${slug}.webp`,
    readingTimeMinutes,
  };
}

/**
 * Route each tagged-template call by its SQL rather than by call order.
 *
 * `getSiteStats` fires both queries inside one `Promise.all`, so keying the
 * doubles off `mockResolvedValueOnce` ordering would make the test pass or
 * fail on scheduling rather than on behaviour — the instrument would be
 * measuring itself.
 */
function routeSql(handlers: {
  subscribers?: () => unknown;
  views?: () => unknown;
}) {
  mockSql.mockImplementation((strings: TemplateStringsArray) => {
    const text = Array.isArray(strings) ? strings.join('') : String(strings);

    if (text.includes('count_active_subscribers')) {
      return Promise.resolve(
        handlers.subscribers ? handlers.subscribers() : [{ count_active_subscribers: 0 }]
      );
    }

    if (text.includes('FROM views')) {
      return Promise.resolve(handlers.views ? handlers.views() : []);
    }

    throw new Error(`Unexpected query: ${text}`);
  });
}

describe('getSiteStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isDatabaseConfigured).mockReturnValue(true);
  });

  it('sums every view row but ranks only the top seven', async () => {
    vi.mocked(getAllBlogs).mockResolvedValue(
      Array.from({ length: 9 }, (_, index) => post(`p${index}`)) as never
    );
    routeSql({
      views: () => Array.from({ length: 9 }, (_, index) => ({ slug: `p${index}`, count: 10 })),
      subscribers: () => [{ count_active_subscribers: 42 }],
    });

    const stats = await getSiteStats();

    expect(stats.overview.totalViews).toEqual({ available: true, note: undefined, value: 90 });
    expect(stats.rankedViews.rows).toHaveLength(7);
    expect(stats.overview.newsletterSubscribers.value).toBe(42);
  });

  it('drops view rows whose slug is not a real post', async () => {
    // The same guard `/api/views` and `popular-posts` carry: a row for a
    // deleted or renamed post must not surface with the raw slug as a title,
    // and must not inflate the total either.
    vi.mocked(getAllBlogs).mockResolvedValue([post('real-post')] as never);
    routeSql({
      views: () => [
        { slug: 'buy-cheap-stuff', count: 9999 },
        { slug: 'real-post', count: 10 },
      ],
    });

    const stats = await getSiteStats();

    expect(stats.rankedViews.rows).toEqual([
      { slug: 'real-post', title: 'Title for real-post', views: 10 },
    ]);
    expect(stats.overview.totalViews.value).toBe(10);
  });

  it('labels views unavailable rather than reporting zero when the query fails', async () => {
    // The defect this module exists to close. A page that renders "0" for a
    // failed query is not degraded, it is wrong: zero views is a real,
    // reportable state and a dead database must not be able to claim it.
    vi.mocked(getAllBlogs).mockResolvedValue([post('p1')] as never);
    routeSql({
      views: () => {
        throw new Error('connection terminated');
      },
    });

    const stats = await getSiteStats();

    expect(stats.overview.totalViews.available).toBe(false);
    expect(stats.overview.totalViews.value).toBeNull();
    expect(stats.overview.totalViews.note).toMatch(/unavailable/i);
    expect(stats.rankedViews.available).toBe(false);
    expect(stats.rankedViews.rows).toEqual([]);
  });

  it('keeps views available when only the subscriber count fails', async () => {
    // Two sources, two verdicts. One failure used to be indistinguishable
    // from the other because a single skeleton covered both.
    vi.mocked(getAllBlogs).mockResolvedValue([post('p1')] as never);
    routeSql({
      views: () => [{ slug: 'p1', count: 5 }],
      subscribers: () => {
        throw new Error('function does not exist');
      },
    });

    const stats = await getSiteStats();

    expect(stats.overview.totalViews.available).toBe(true);
    expect(stats.overview.totalViews.value).toBe(5);
    expect(stats.overview.newsletterSubscribers.available).toBe(false);
    expect(stats.overview.newsletterSubscribers.note).toMatch(/unavailable/i);
  });

  it('still reports the numbers that come off the filesystem with no database', async () => {
    vi.mocked(isDatabaseConfigured).mockReturnValue(false);
    vi.mocked(getAllBlogs).mockResolvedValue([post('p1', 4), post('p2', 8)] as never);

    const stats = await getSiteStats();

    expect(mockSql).not.toHaveBeenCalled();
    expect(stats.overview.totalPosts).toEqual({ available: true, value: 2 });
    expect(stats.overview.avgReadTime).toEqual({ available: true, value: 6 });
    expect(stats.overview.totalViews.available).toBe(false);
    expect(stats.overview.newsletterSubscribers.available).toBe(false);
  });

  it('dates the snapshot, so a stale page can be told from a broken one', async () => {
    vi.mocked(getAllBlogs).mockResolvedValue([post('p1')] as never);
    routeSql({ views: () => [{ slug: 'p1', count: 1 }] });

    const stats = await getSiteStats();

    expect(stats.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/);
    expect(Number.isNaN(Date.parse(stats.generatedAt))).toBe(false);
  });

  it('reads a null count as zero views rather than dropping the row', async () => {
    vi.mocked(getAllBlogs).mockResolvedValue([post('p1')] as never);
    routeSql({ views: () => [{ slug: 'p1', count: null }] });

    const stats = await getSiteStats();

    expect(stats.rankedViews.rows[0].views).toBe(0);
    expect(stats.overview.totalViews.value).toBe(0);
  });
});
