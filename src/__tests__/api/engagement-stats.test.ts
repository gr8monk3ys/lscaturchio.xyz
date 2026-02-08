import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

const mockSql = vi.fn();

// Mock dependencies before importing the route
vi.mock('@/lib/db', () => ({
  getDb: vi.fn(() => mockSql),
}));

vi.mock('@/lib/getAllBlogs', () => ({
  getAllBlogs: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

// Mock rate limiting to pass through for tests
vi.mock('@/lib/with-rate-limit', () => ({
  withRateLimit: (handler: (req: NextRequest) => Promise<Response>) => handler,
}));

vi.mock('@/lib/rate-limit', () => ({
  RATE_LIMITS: {
    PUBLIC: { limit: 100, window: 60000 },
  },
}));

import { GET } from '@/app/api/engagement-stats/route';
import { getAllBlogs } from '@/lib/getAllBlogs';
import { logError } from '@/lib/logger';

describe('/api/engagement-stats', () => {
  const mockBlogs = [
    { slug: 'react-hooks', title: 'React Hooks Guide' },
    { slug: 'typescript-tips', title: 'TypeScript Tips' },
    { slug: 'nextjs-routing', title: 'Next.js Routing' },
    { slug: 'css-grid', title: 'CSS Grid Layout' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (getAllBlogs as ReturnType<typeof vi.fn>).mockResolvedValue(mockBlogs);
  });

  describe('GET /api/engagement-stats', () => {
    it('returns engagement statistics', async () => {
      const mockReactions = [
        { slug: 'react-hooks', likes: 42, bookmarks: 15 },
        { slug: 'typescript-tips', likes: 38, bookmarks: 22 },
        { slug: 'nextjs-routing', likes: 25, bookmarks: 10 },
        { slug: 'css-grid', likes: 18, bookmarks: 8 },
      ];

      mockSql.mockResolvedValue(mockReactions);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('totalLikes');
      expect(data.data).toHaveProperty('totalBookmarks');
      expect(data.data).toHaveProperty('topLiked');
      expect(data.data).toHaveProperty('topBookmarked');
    });

    it('calculates correct totals', async () => {
      const mockReactions = [
        { slug: 'react-hooks', likes: 42, bookmarks: 15 },
        { slug: 'typescript-tips', likes: 38, bookmarks: 22 },
        { slug: 'nextjs-routing', likes: 25, bookmarks: 10 },
      ];

      mockSql.mockResolvedValue(mockReactions);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.totalLikes).toBe(105);
      expect(data.data.totalBookmarks).toBe(47);
    });

    it('returns top 5 liked posts sorted by likes', async () => {
      const mockReactions = [
        { slug: 'post-1', likes: 100, bookmarks: 5 },
        { slug: 'post-2', likes: 90, bookmarks: 10 },
        { slug: 'post-3', likes: 80, bookmarks: 15 },
        { slug: 'post-4', likes: 70, bookmarks: 20 },
        { slug: 'post-5', likes: 60, bookmarks: 25 },
        { slug: 'post-6', likes: 50, bookmarks: 30 },
        { slug: 'post-7', likes: 40, bookmarks: 35 },
      ];

      const allBlogs = mockReactions.map(r => ({ slug: r.slug, title: `Title for ${r.slug}` }));
      (getAllBlogs as ReturnType<typeof vi.fn>).mockResolvedValue(allBlogs);
      mockSql.mockResolvedValue(mockReactions);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.topLiked.length).toBe(5);
      expect(data.data.topLiked[0].slug).toBe('post-1');
      expect(data.data.topLiked[0].likes).toBe(100);
      expect(data.data.topLiked[4].slug).toBe('post-5');
    });

    it('includes blog titles in top posts', async () => {
      mockSql.mockResolvedValue([
        { slug: 'react-hooks', likes: 42, bookmarks: 15 },
      ]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.topLiked[0].title).toBe('React Hooks Guide');
    });

    it('uses slug as fallback when blog title not found', async () => {
      mockSql.mockResolvedValue([
        { slug: 'unknown-post', likes: 42, bookmarks: 15 },
      ]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.topLiked[0].title).toBe('unknown-post');
    });

    it('excludes posts with zero likes from topLiked', async () => {
      mockSql.mockResolvedValue([
        { slug: 'popular-post', likes: 42, bookmarks: 15 },
        { slug: 'no-likes-post', likes: 0, bookmarks: 10 },
      ]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.topLiked.length).toBe(1);
      expect(data.data.topLiked.find((p: { slug: string }) => p.slug === 'no-likes-post')).toBeUndefined();
    });

    it('handles empty reactions data', async () => {
      mockSql.mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.totalLikes).toBe(0);
      expect(data.data.totalBookmarks).toBe(0);
      expect(data.data.topLiked).toEqual([]);
      expect(data.data.topBookmarked).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('returns 500 on database error', async () => {
      mockSql.mockRejectedValue(new Error('Connection failed'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch engagement stats');
      expect(data.success).toBe(false);
    });

    it('logs database error', async () => {
      const dbError = new Error('Connection failed');
      mockSql.mockRejectedValue(dbError);

      await GET();

      expect(logError).toHaveBeenCalledWith(
        'Engagement Stats: Unexpected error',
        dbError,
        { component: 'engagement-stats', action: 'GET' }
      );
    });

    it('returns 500 on getAllBlogs error', async () => {
      mockSql.mockResolvedValue([{ slug: 'post-1', likes: 10, bookmarks: 5 }]);
      (getAllBlogs as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('File system error')
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch engagement stats');
      expect(data.success).toBe(false);
    });
  });

  describe('response structure', () => {
    it('returns all expected fields in response', async () => {
      mockSql.mockResolvedValue([{ slug: 'react-hooks', likes: 42, bookmarks: 15 }]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(typeof data.data.totalLikes).toBe('number');
      expect(typeof data.data.totalBookmarks).toBe('number');
      expect(Array.isArray(data.data.topLiked)).toBe(true);
      expect(Array.isArray(data.data.topBookmarked)).toBe(true);
    });
  });
});
