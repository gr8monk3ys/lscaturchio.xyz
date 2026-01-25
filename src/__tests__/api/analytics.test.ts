import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  not: vi.fn().mockReturnThis(),
  is: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  rpc: vi.fn(),
};

vi.mock('@/lib/supabase', () => ({
  getSupabase: () => mockSupabase,
}));

vi.mock('@/lib/getAllBlogs', () => ({
  getAllBlogs: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
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

// Mock api-auth module
vi.mock('@/lib/api-auth', () => ({
  validateApiKey: vi.fn(),
}));

import { GET } from '@/app/api/analytics/route';
import { getAllBlogs } from '@/lib/getAllBlogs';
import { validateApiKey } from '@/lib/api-auth';
import { logError } from '@/lib/logger';
import { NextResponse } from 'next/server';

describe('/api/analytics', () => {
  const originalEnv = process.env;

  function createRequest(): NextRequest {
    return new NextRequest('http://localhost/api/analytics', {
      method: 'GET',
      headers: {
        'x-api-key': 'valid-api-key',
      },
    });
  }

  function createMockRpcChain() {
    return {
      rpc: vi.fn().mockResolvedValue({ data: 0, error: null }),
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn(),
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.ANALYTICS_API_KEY = 'valid-api-key';

    // Default: API key validation passes
    vi.mocked(validateApiKey).mockReturnValue(null);

    // Default: getAllBlogs returns empty array
    vi.mocked(getAllBlogs).mockResolvedValue([]);

    // Setup mock chain for newsletter stats
    mockSupabase.rpc.mockResolvedValue({ data: 0, error: null });

    // Setup chained select for count queries - return head: true queries
    let selectCallCount = 0;
    mockSupabase.select.mockImplementation(() => {
      selectCallCount++;
      return {
        ...mockSupabase,
        then: (resolve: (value: { count: number }) => void) => {
          resolve({ count: 0 });
        },
      };
    });

    // Mock the order call for views/reactions data
    mockSupabase.order.mockResolvedValue({ data: [], error: null });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('authentication', () => {
    it('returns 401 when API key is invalid', async () => {
      vi.mocked(validateApiKey).mockReturnValue(
        NextResponse.json(
          { error: 'Unauthorized - valid API key required' },
          { status: 401 }
        )
      );

      const request = new NextRequest('http://localhost/api/analytics', {
        method: 'GET',
        headers: {
          'x-api-key': 'invalid-key',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Unauthorized');
    });

    it('returns 401 when API key is missing', async () => {
      vi.mocked(validateApiKey).mockReturnValue(
        NextResponse.json(
          { error: 'Unauthorized - valid API key required' },
          { status: 401 }
        )
      );

      const request = new NextRequest('http://localhost/api/analytics', {
        method: 'GET',
      });

      const response = await GET(request);
      expect(response.status).toBe(401);
    });

    it('calls validateApiKey with correct component', async () => {
      const request = createRequest();
      await GET(request);

      expect(validateApiKey).toHaveBeenCalledWith(request, { component: 'analytics' });
    });
  });

  describe('successful responses', () => {
    beforeEach(() => {
      // Setup successful mock responses for all newsletter queries
      // The route makes 4 parallel queries for newsletter stats
      mockSupabase.rpc.mockResolvedValue({ data: 150, error: null });

      // Mock the from().select() chains for count queries
      const createCountMock = (count: number) => ({
        select: vi.fn().mockReturnValue({
          not: vi.fn().mockReturnValue({
            is: vi.fn().mockResolvedValue({ count, error: null }),
          }),
          gte: vi.fn().mockReturnValue({
            is: vi.fn().mockResolvedValue({ count, error: null }),
          }),
        }),
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'newsletter_subscribers') {
          return {
            select: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                is: vi.fn().mockResolvedValue({ count: 10, error: null }),
              }),
              gte: vi.fn().mockReturnValue({
                is: vi.fn().mockResolvedValue({ count: 5, error: null }),
              }),
            }),
          };
        }
        if (table === 'views') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [
                  { slug: 'post-1', count: 100 },
                  { slug: 'post-2', count: 50 },
                ],
                error: null,
              }),
            }),
          };
        }
        if (table === 'reactions') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [
                  { slug: 'post-1', likes: 20, bookmarks: 5 },
                  { slug: 'post-2', likes: 10, bookmarks: 3 },
                ],
                error: null,
              }),
            }),
          };
        }
        return mockSupabase;
      });

      vi.mocked(getAllBlogs).mockResolvedValue([
        { slug: 'post-1', title: 'First Post', tags: ['react', 'nextjs'], date: '2024-01-01', description: 'First' },
        { slug: 'post-2', title: 'Second Post', tags: ['typescript'], date: '2024-01-02', description: 'Second' },
      ]);
    });

    it('returns analytics data with valid API key', async () => {
      const request = createRequest();
      const response = await GET(request);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('newsletter');
      expect(data).toHaveProperty('engagement');
      expect(data).toHaveProperty('topPosts');
      expect(data).toHaveProperty('content');
    });

    it('returns newsletter statistics', async () => {
      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(data.newsletter).toBeDefined();
      expect(typeof data.newsletter.activeSubscribers).toBe('number');
      expect(typeof data.newsletter.totalSubscribers).toBe('number');
      expect(typeof data.newsletter.unsubscribed).toBe('number');
      expect(typeof data.newsletter.last30Days).toBe('number');
    });

    it('returns engagement statistics', async () => {
      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(data.engagement).toBeDefined();
      expect(typeof data.engagement.totalViews).toBe('number');
      expect(typeof data.engagement.totalLikes).toBe('number');
      expect(typeof data.engagement.totalBookmarks).toBe('number');
      expect(typeof data.engagement.uniquePosts).toBe('number');
    });

    it('returns top posts by views, likes, and bookmarks', async () => {
      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(data.topPosts).toBeDefined();
      expect(data.topPosts.byViews).toBeInstanceOf(Array);
      expect(data.topPosts.byLikes).toBeInstanceOf(Array);
      expect(data.topPosts.byBookmarks).toBeInstanceOf(Array);
    });

    it('returns content statistics with tag counts', async () => {
      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(data.content).toBeDefined();
      expect(typeof data.content.totalPosts).toBe('number');
      expect(data.content.tags).toBeInstanceOf(Array);
    });

    it('maps blog slugs to titles in top posts', async () => {
      // Reset mock to control exact data
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'newsletter_subscribers') {
          return {
            select: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                is: vi.fn().mockResolvedValue({ count: 0, error: null }),
              }),
              gte: vi.fn().mockReturnValue({
                is: vi.fn().mockResolvedValue({ count: 0, error: null }),
              }),
            }),
          };
        }
        if (table === 'views') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [{ slug: 'post-1', count: 100 }],
                error: null,
              }),
            }),
          };
        }
        if (table === 'reactions') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          };
        }
        return mockSupabase;
      });

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(data.topPosts.byViews[0].title).toBe('First Post');
      expect(data.topPosts.byViews[0].slug).toBe('post-1');
    });
  });

  describe('error handling', () => {
    it('returns 500 when Supabase throws an error', async () => {
      mockSupabase.rpc.mockRejectedValue(new Error('Database connection failed'));

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch analytics');
    });

    it('logs error when database operation fails', async () => {
      const dbError = new Error('Database error');
      mockSupabase.rpc.mockRejectedValue(dbError);

      const request = createRequest();
      await GET(request);

      expect(logError).toHaveBeenCalledWith(
        'Analytics: Unexpected error',
        dbError,
        expect.objectContaining({
          component: 'analytics',
          action: 'GET',
        })
      );
    });

    it('handles null data gracefully', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'newsletter_subscribers') {
          return {
            select: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                is: vi.fn().mockResolvedValue({ count: null, error: null }),
              }),
              gte: vi.fn().mockReturnValue({
                is: vi.fn().mockResolvedValue({ count: null, error: null }),
              }),
            }),
          };
        }
        if (table === 'views' || table === 'reactions') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          };
        }
        return mockSupabase;
      });

      vi.mocked(getAllBlogs).mockResolvedValue([]);

      const request = createRequest();
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.engagement.totalViews).toBe(0);
      expect(data.engagement.totalLikes).toBe(0);
    });

    it('handles empty views data', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 0, error: null });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'newsletter_subscribers') {
          return {
            select: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                is: vi.fn().mockResolvedValue({ count: 0, error: null }),
              }),
              gte: vi.fn().mockReturnValue({
                is: vi.fn().mockResolvedValue({ count: 0, error: null }),
              }),
            }),
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        };
      });

      const request = createRequest();
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.topPosts.byViews).toHaveLength(0);
      expect(data.engagement.totalViews).toBe(0);
    });
  });

  describe('data aggregation', () => {
    it('correctly calculates total views from multiple posts', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 0, error: null });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'newsletter_subscribers') {
          return {
            select: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                is: vi.fn().mockResolvedValue({ count: 0, error: null }),
              }),
              gte: vi.fn().mockReturnValue({
                is: vi.fn().mockResolvedValue({ count: 0, error: null }),
              }),
            }),
          };
        }
        if (table === 'views') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [
                  { slug: 'post-1', count: 100 },
                  { slug: 'post-2', count: 200 },
                  { slug: 'post-3', count: 300 },
                ],
                error: null,
              }),
            }),
          };
        }
        if (table === 'reactions') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          };
        }
        return mockSupabase;
      });

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(data.engagement.totalViews).toBe(600); // 100 + 200 + 300
    });

    it('correctly calculates unique posts with engagement', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 0, error: null });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'newsletter_subscribers') {
          return {
            select: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                is: vi.fn().mockResolvedValue({ count: 0, error: null }),
              }),
              gte: vi.fn().mockReturnValue({
                is: vi.fn().mockResolvedValue({ count: 0, error: null }),
              }),
            }),
          };
        }
        if (table === 'views') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [
                  { slug: 'post-1', count: 100 },
                  { slug: 'post-2', count: 50 },
                ],
                error: null,
              }),
            }),
          };
        }
        if (table === 'reactions') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [
                  { slug: 'post-1', likes: 10, bookmarks: 5 }, // Overlap with views
                  { slug: 'post-3', likes: 20, bookmarks: 10 }, // New post
                ],
                error: null,
              }),
            }),
          };
        }
        return mockSupabase;
      });

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(data.engagement.uniquePosts).toBe(3); // post-1, post-2, post-3
    });

    it('limits top posts to 5 entries', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 0, error: null });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'newsletter_subscribers') {
          return {
            select: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                is: vi.fn().mockResolvedValue({ count: 0, error: null }),
              }),
              gte: vi.fn().mockReturnValue({
                is: vi.fn().mockResolvedValue({ count: 0, error: null }),
              }),
            }),
          };
        }
        if (table === 'views') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: Array.from({ length: 10 }, (_, i) => ({
                  slug: `post-${i}`,
                  count: 100 - i * 10,
                })),
                error: null,
              }),
            }),
          };
        }
        if (table === 'reactions') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          };
        }
        return mockSupabase;
      });

      vi.mocked(getAllBlogs).mockResolvedValue(
        Array.from({ length: 10 }, (_, i) => ({
          slug: `post-${i}`,
          title: `Post ${i}`,
          tags: [],
          date: '2024-01-01',
          description: `Description ${i}`,
        }))
      );

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(data.topPosts.byViews).toHaveLength(5);
    });

    it('limits tag list to top 10', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 0, error: null });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'newsletter_subscribers') {
          return {
            select: vi.fn().mockReturnValue({
              not: vi.fn().mockReturnValue({
                is: vi.fn().mockResolvedValue({ count: 0, error: null }),
              }),
              gte: vi.fn().mockReturnValue({
                is: vi.fn().mockResolvedValue({ count: 0, error: null }),
              }),
            }),
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        };
      });

      // Create 15 unique tags across posts
      vi.mocked(getAllBlogs).mockResolvedValue(
        Array.from({ length: 15 }, (_, i) => ({
          slug: `post-${i}`,
          title: `Post ${i}`,
          tags: [`tag-${i}`],
          date: '2024-01-01',
          description: `Description ${i}`,
        }))
      );

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(data.content.tags.length).toBeLessThanOrEqual(10);
    });
  });
});
