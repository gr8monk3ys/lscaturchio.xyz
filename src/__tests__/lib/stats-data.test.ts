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

import {
  getDetailedViews,
  getDetailedViewsSafe,
  getBlogStatsSafe,
  getNewsletterStats,
  getStatsOverview,
  VIEWS_UNAVAILABLE_MESSAGE,
  NEWSLETTER_UNAVAILABLE_MESSAGE,
} from '@/lib/stats-data';
import { getAllBlogs } from '@/lib/getAllBlogs';
import { isDatabaseConfigured } from '@/lib/db';

function post(slug: string, content = 'word '.repeat(200)) {
  return {
    slug,
    title: `Title for ${slug}`,
    description: 'desc',
    date: '2025-01-01',
    tags: ['ai'],
    content,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(isDatabaseConfigured).mockReturnValue(true);
  vi.mocked(getAllBlogs).mockResolvedValue([post('real-post')] as never);
});

describe('getDetailedViews', () => {
  it('returns the unavailable shape when the database is not configured', async () => {
    vi.mocked(isDatabaseConfigured).mockReturnValue(false);

    await expect(getDetailedViews()).resolves.toEqual({
      views: [],
      total: 0,
      available: false,
      message: VIEWS_UNAVAILABLE_MESSAGE,
    });
    expect(mockSql).not.toHaveBeenCalled();
  });

  it('drops view rows whose slug is no longer a real post', async () => {
    mockSql.mockResolvedValue([
      { slug: 'real-post', count: 12 },
      { slug: 'deleted-post', count: 9999 },
    ]);

    const payload = await getDetailedViews();

    expect(payload.available).toBe(true);
    expect(payload.total).toBe(1);
    expect(payload.views).toEqual([
      { slug: 'real-post', title: 'Title for real-post', views: 12 },
    ]);
  });
});

describe('getDetailedViewsSafe', () => {
  it('folds a query failure into the unavailable shape instead of throwing', async () => {
    mockSql.mockRejectedValue(new Error('connection refused'));

    await expect(getDetailedViewsSafe()).resolves.toEqual({
      views: [],
      total: 0,
      available: false,
      message: VIEWS_UNAVAILABLE_MESSAGE,
    });
  });
});

describe('getBlogStatsSafe', () => {
  it('summarises the blog corpus', async () => {
    const stats = await getBlogStatsSafe();

    expect(stats?.totalPosts).toBe(1);
    expect(typeof stats?.avgReadingTime).toBe('number');
  });

  it('returns null when the blog metadata cannot be read', async () => {
    vi.mocked(getAllBlogs).mockRejectedValue(new Error('no content dir'));

    await expect(getBlogStatsSafe()).resolves.toBeNull();
  });
});

describe('getNewsletterStats', () => {
  it('reports unavailable — with no error — when the database is not configured', async () => {
    vi.mocked(isDatabaseConfigured).mockReturnValue(false);

    const payload = await getNewsletterStats();

    expect(payload).toEqual({
      activeSubscribers: null,
      available: false,
      message: NEWSLETTER_UNAVAILABLE_MESSAGE,
    });
    expect(payload.error).toBeUndefined();
  });

  it('returns the active subscriber count', async () => {
    mockSql.mockResolvedValue([{ count_active_subscribers: 42 }]);

    await expect(getNewsletterStats()).resolves.toEqual({
      activeSubscribers: 42,
      available: true,
    });
  });

  it('coerces a null count to zero', async () => {
    mockSql.mockResolvedValue([{ count_active_subscribers: null }]);

    await expect(getNewsletterStats()).resolves.toEqual({
      activeSubscribers: 0,
      available: true,
    });
  });

  it('sets error on an unexpected failure', async () => {
    mockSql.mockRejectedValue(new Error('boom'));

    const payload = await getNewsletterStats();

    expect(payload.error).toBe('Failed to fetch stats');
    expect(payload.available).toBe(false);
  });
});

describe('getStatsOverview', () => {
  it('assembles four available metrics when every reader succeeds', async () => {
    mockSql.mockImplementation((strings: TemplateStringsArray) => {
      const query = Array.isArray(strings) ? strings.join('') : String(strings);
      if (query.includes('count_active_subscribers')) {
        return Promise.resolve([{ count_active_subscribers: 7 }]);
      }
      return Promise.resolve([{ slug: 'real-post', count: 12 }]);
    });

    const overview = await getStatsOverview();

    expect(overview.totalViews).toEqual({ value: 12, available: true, note: undefined });
    expect(overview.newsletterSubscribers.value).toBe(7);
    expect(overview.newsletterSubscribers.available).toBe(true);
    expect(overview.totalPosts.value).toBe(1);
    expect(overview.avgReadTime.available).toBe(true);
  });

  it('degrades every metric — with a note — when nothing is reachable', async () => {
    vi.mocked(isDatabaseConfigured).mockReturnValue(false);
    vi.mocked(getAllBlogs).mockRejectedValue(new Error('no content dir'));

    const overview = await getStatsOverview();

    expect(overview.totalViews.available).toBe(false);
    expect(overview.totalViews.note).toBe(VIEWS_UNAVAILABLE_MESSAGE);
    expect(overview.newsletterSubscribers.available).toBe(false);
    expect(overview.newsletterSubscribers.note).toBe(NEWSLETTER_UNAVAILABLE_MESSAGE);
    expect(overview.totalPosts.value).toBeNull();
    expect(overview.avgReadTime.note).toBe('Reading-time estimates are unavailable right now.');
  });
});
