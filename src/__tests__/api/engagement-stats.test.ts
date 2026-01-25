import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies before importing the route
vi.mock('@/lib/supabase', () => ({
  getSupabase: vi.fn(),
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
import { getSupabase } from '@/lib/supabase';
import { getAllBlogs } from '@/lib/getAllBlogs';
import { logError } from '@/lib/logger';

// Store original env
const originalEnv = { ...process.env };

describe('/api/engagement-stats', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    order: vi.fn(),
  };

  const mockBlogs = [
    { slug: 'react-hooks', title: 'React Hooks Guide' },
    { slug: 'typescript-tips', title: 'TypeScript Tips' },
    { slug: 'nextjs-routing', title: 'Next.js Routing' },
    { slug: 'css-grid', title: 'CSS Grid Layout' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_KEY = 'test-service-key';
    (getSupabase as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);
    (getAllBlogs as ReturnType<typeof vi.fn>).mockResolvedValue(mockBlogs);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('GET /api/engagement-stats', () => {
    it('returns engagement statistics', async () => {
      const mockReactions = [
        { slug: 'react-hooks', likes: 42, bookmarks: 15 },
        { slug: 'typescript-tips', likes: 38, bookmarks: 22 },
        { slug: 'nextjs-routing', likes: 25, bookmarks: 10 },
        { slug: 'css-grid', likes: 18, bookmarks: 8 },
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockReactions,
        error: null,
      });

      const request = new NextRequest('http://localhost/api/engagement-stats');
      const response = await GET(request);
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

      mockSupabase.order.mockResolvedValue({
        data: mockReactions,
        error: null,
      });

      const request = new NextRequest('http://localhost/api/engagement-stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.totalLikes).toBe(105); // 42 + 38 + 25
      expect(data.data.totalBookmarks).toBe(47); // 15 + 22 + 10
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

      mockSupabase.order.mockResolvedValue({
        data: mockReactions,
        error: null,
      });

      const request = new NextRequest('http://localhost/api/engagement-stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.topLiked.length).toBe(5);
      expect(data.data.topLiked[0].slug).toBe('post-1');
      expect(data.data.topLiked[0].likes).toBe(100);
      expect(data.data.topLiked[4].slug).toBe('post-5');
    });

    it('returns top 5 bookmarked posts sorted by bookmarks', async () => {
      const mockReactions = [
        { slug: 'post-1', likes: 5, bookmarks: 100 },
        { slug: 'post-2', likes: 10, bookmarks: 90 },
        { slug: 'post-3', likes: 15, bookmarks: 80 },
        { slug: 'post-4', likes: 20, bookmarks: 70 },
        { slug: 'post-5', likes: 25, bookmarks: 60 },
        { slug: 'post-6', likes: 30, bookmarks: 50 },
        { slug: 'post-7', likes: 35, bookmarks: 40 },
      ];

      const allBlogs = mockReactions.map(r => ({ slug: r.slug, title: `Title for ${r.slug}` }));
      (getAllBlogs as ReturnType<typeof vi.fn>).mockResolvedValue(allBlogs);

      mockSupabase.order.mockResolvedValue({
        data: mockReactions,
        error: null,
      });

      const request = new NextRequest('http://localhost/api/engagement-stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.topBookmarked.length).toBe(5);
      expect(data.data.topBookmarked[0].slug).toBe('post-1');
      expect(data.data.topBookmarked[0].bookmarks).toBe(100);
      expect(data.data.topBookmarked[4].slug).toBe('post-5');
    });

    it('includes blog titles in top posts', async () => {
      const mockReactions = [
        { slug: 'react-hooks', likes: 42, bookmarks: 15 },
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockReactions,
        error: null,
      });

      const request = new NextRequest('http://localhost/api/engagement-stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.topLiked[0].title).toBe('React Hooks Guide');
    });

    it('uses slug as fallback when blog title not found', async () => {
      const mockReactions = [
        { slug: 'unknown-post', likes: 42, bookmarks: 15 },
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockReactions,
        error: null,
      });

      const request = new NextRequest('http://localhost/api/engagement-stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.topLiked[0].title).toBe('unknown-post');
    });

    it('excludes posts with zero likes from topLiked', async () => {
      const mockReactions = [
        { slug: 'popular-post', likes: 42, bookmarks: 15 },
        { slug: 'no-likes-post', likes: 0, bookmarks: 10 },
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockReactions,
        error: null,
      });

      const request = new NextRequest('http://localhost/api/engagement-stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.topLiked.length).toBe(1);
      expect(data.data.topLiked.find((p: { slug: string }) => p.slug === 'no-likes-post')).toBeUndefined();
    });

    it('excludes posts with zero bookmarks from topBookmarked', async () => {
      const mockReactions = [
        { slug: 'bookmarked-post', likes: 10, bookmarks: 25 },
        { slug: 'no-bookmarks-post', likes: 42, bookmarks: 0 },
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockReactions,
        error: null,
      });

      const request = new NextRequest('http://localhost/api/engagement-stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.topBookmarked.length).toBe(1);
      expect(data.data.topBookmarked.find((p: { slug: string }) => p.slug === 'no-bookmarks-post')).toBeUndefined();
    });

    it('handles empty reactions data', async () => {
      mockSupabase.order.mockResolvedValue({
        data: [],
        error: null,
      });

      const request = new NextRequest('http://localhost/api/engagement-stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.totalLikes).toBe(0);
      expect(data.data.totalBookmarks).toBe(0);
      expect(data.data.topLiked).toEqual([]);
      expect(data.data.topBookmarked).toEqual([]);
    });

    it('handles null reactions data', async () => {
      mockSupabase.order.mockResolvedValue({
        data: null,
        error: null,
      });

      const request = new NextRequest('http://localhost/api/engagement-stats');
      const response = await GET(request);
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
    it('returns 500 on Supabase database error', async () => {
      mockSupabase.order.mockResolvedValue({
        data: null,
        error: { code: 'PGRST301', message: 'Connection failed' },
      });

      const request = new NextRequest('http://localhost/api/engagement-stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch engagement stats');
      expect(data.success).toBe(false);
    });

    it('logs database error', async () => {
      const dbError = { code: 'PGRST301', message: 'Connection failed' };
      mockSupabase.order.mockResolvedValue({
        data: null,
        error: dbError,
      });

      const request = new NextRequest('http://localhost/api/engagement-stats');
      await GET(request);

      expect(logError).toHaveBeenCalledWith(
        'Engagement Stats: Database error',
        dbError,
        { component: 'engagement-stats', action: 'GET' }
      );
    });

    it('returns 500 on getAllBlogs error', async () => {
      mockSupabase.order.mockResolvedValue({
        data: [{ slug: 'post-1', likes: 10, bookmarks: 5 }],
        error: null,
      });
      (getAllBlogs as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('File system error')
      );

      const request = new NextRequest('http://localhost/api/engagement-stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch engagement stats');
      expect(data.success).toBe(false);
    });

    it('logs unexpected errors', async () => {
      const error = new Error('Unexpected error');
      mockSupabase.order.mockResolvedValue({
        data: [{ slug: 'post-1', likes: 10, bookmarks: 5 }],
        error: null,
      });
      (getAllBlogs as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      const request = new NextRequest('http://localhost/api/engagement-stats');
      await GET(request);

      expect(logError).toHaveBeenCalledWith(
        'Engagement Stats: Unexpected error',
        error,
        { component: 'engagement-stats', action: 'GET' }
      );
    });

    it('handles Supabase not being configured', async () => {
      (getSupabase as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error('Supabase not configured');
      });

      const request = new NextRequest('http://localhost/api/engagement-stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch engagement stats');
      expect(data.success).toBe(false);
    });
  });

  describe('response structure', () => {
    it('returns all expected fields in response', async () => {
      mockSupabase.order.mockResolvedValue({
        data: [{ slug: 'react-hooks', likes: 42, bookmarks: 15 }],
        error: null,
      });

      const request = new NextRequest('http://localhost/api/engagement-stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(typeof data.data.totalLikes).toBe('number');
      expect(typeof data.data.totalBookmarks).toBe('number');
      expect(Array.isArray(data.data.topLiked)).toBe(true);
      expect(Array.isArray(data.data.topBookmarked)).toBe(true);
    });

    it('topLiked items have correct structure', async () => {
      mockSupabase.order.mockResolvedValue({
        data: [{ slug: 'react-hooks', likes: 42, bookmarks: 15 }],
        error: null,
      });

      const request = new NextRequest('http://localhost/api/engagement-stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.topLiked[0]).toHaveProperty('slug');
      expect(data.data.topLiked[0]).toHaveProperty('title');
      expect(data.data.topLiked[0]).toHaveProperty('likes');
      expect(typeof data.data.topLiked[0].slug).toBe('string');
      expect(typeof data.data.topLiked[0].title).toBe('string');
      expect(typeof data.data.topLiked[0].likes).toBe('number');
    });

    it('topBookmarked items have correct structure', async () => {
      mockSupabase.order.mockResolvedValue({
        data: [{ slug: 'react-hooks', likes: 42, bookmarks: 15 }],
        error: null,
      });

      const request = new NextRequest('http://localhost/api/engagement-stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.topBookmarked[0]).toHaveProperty('slug');
      expect(data.data.topBookmarked[0]).toHaveProperty('title');
      expect(data.data.topBookmarked[0]).toHaveProperty('bookmarks');
      expect(typeof data.data.topBookmarked[0].slug).toBe('string');
      expect(typeof data.data.topBookmarked[0].title).toBe('string');
      expect(typeof data.data.topBookmarked[0].bookmarks).toBe('number');
    });
  });

  describe('Supabase query', () => {
    it('queries reactions table with correct parameters', async () => {
      mockSupabase.order.mockResolvedValue({
        data: [],
        error: null,
      });

      const request = new NextRequest('http://localhost/api/engagement-stats');
      await GET(request);

      expect(mockSupabase.from).toHaveBeenCalledWith('reactions');
      expect(mockSupabase.select).toHaveBeenCalledWith('slug, likes, bookmarks');
      expect(mockSupabase.order).toHaveBeenCalledWith('likes', { ascending: false });
    });
  });

  describe('edge cases', () => {
    it('handles very large like counts', async () => {
      const mockReactions = [
        { slug: 'viral-post', likes: 1000000, bookmarks: 500000 },
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockReactions,
        error: null,
      });

      const request = new NextRequest('http://localhost/api/engagement-stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.totalLikes).toBe(1000000);
      expect(data.data.totalBookmarks).toBe(500000);
    });

    it('handles posts with same like count', async () => {
      const mockReactions = [
        { slug: 'post-1', likes: 42, bookmarks: 10 },
        { slug: 'post-2', likes: 42, bookmarks: 20 },
        { slug: 'post-3', likes: 42, bookmarks: 15 },
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockReactions,
        error: null,
      });

      const request = new NextRequest('http://localhost/api/engagement-stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.topLiked.length).toBe(3);
      // All should have same likes
      expect(data.data.topLiked.every((p: { likes: number }) => p.likes === 42)).toBe(true);
    });

    it('handles single post in database', async () => {
      const mockReactions = [
        { slug: 'only-post', likes: 10, bookmarks: 5 },
      ];

      (getAllBlogs as ReturnType<typeof vi.fn>).mockResolvedValue([
        { slug: 'only-post', title: 'The Only Post' },
      ]);

      mockSupabase.order.mockResolvedValue({
        data: mockReactions,
        error: null,
      });

      const request = new NextRequest('http://localhost/api/engagement-stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.totalLikes).toBe(10);
      expect(data.data.totalBookmarks).toBe(5);
      expect(data.data.topLiked.length).toBe(1);
      expect(data.data.topBookmarked.length).toBe(1);
    });
  });
});
