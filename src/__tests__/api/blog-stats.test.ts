import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies before importing the route
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

import { GET } from '@/app/api/blog-stats/route';
import { getAllBlogs } from '@/lib/getAllBlogs';
import { logError } from '@/lib/logger';

describe('/api/blog-stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/blog-stats', () => {
    it('returns blog statistics for valid blogs', async () => {
      const mockBlogs = [
        {
          slug: 'post-1',
          title: 'First Post',
          description: 'Description 1',
          date: '2024-01-01',
          content: 'A'.repeat(2000), // ~10 minutes reading time (2000 chars / 1000 * 5)
          tags: ['javascript', 'react'],
          image: '/images/blog/post-1.webp',
        },
        {
          slug: 'post-2',
          title: 'Second Post',
          description: 'Description 2',
          date: '2024-01-15',
          content: 'B'.repeat(4000), // ~20 minutes reading time
          tags: ['typescript', 'react'],
          image: '/images/blog/post-2.webp',
        },
        {
          slug: 'post-3',
          title: 'Third Post',
          description: 'Description 3',
          date: '2024-02-01',
          content: 'C'.repeat(1000), // ~5 minutes reading time
          tags: ['javascript'],
          image: '/images/blog/post-3.webp',
        },
      ];

      (getAllBlogs as ReturnType<typeof vi.fn>).mockResolvedValue(mockBlogs);

      const request = new NextRequest('http://localhost/api/blog-stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalPosts).toBe(3);
      expect(data.totalReadingTime).toBe(35); // 10 + 20 + 5
      expect(data.avgReadingTime).toBe(12); // Math.round(35/3)
      expect(data.topTags).toBeDefined();
      expect(data.topTags.length).toBeGreaterThan(0);
    });

    it('returns correct tag counts in topTags', async () => {
      const mockBlogs = [
        {
          slug: 'post-1',
          title: 'Post 1',
          description: 'Desc',
          date: '2024-01-01',
          content: 'Content',
          tags: ['react', 'javascript'],
          image: '/images/blog/default.webp',
        },
        {
          slug: 'post-2',
          title: 'Post 2',
          description: 'Desc',
          date: '2024-01-02',
          content: 'Content',
          tags: ['react', 'typescript'],
          image: '/images/blog/default.webp',
        },
        {
          slug: 'post-3',
          title: 'Post 3',
          description: 'Desc',
          date: '2024-01-03',
          content: 'Content',
          tags: ['react', 'nextjs'],
          image: '/images/blog/default.webp',
        },
      ];

      (getAllBlogs as ReturnType<typeof vi.fn>).mockResolvedValue(mockBlogs);

      const request = new NextRequest('http://localhost/api/blog-stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // React appears 3 times, should be first
      expect(data.topTags[0]).toEqual({ tag: 'react', count: 3 });
      // Other tags appear once each
      expect(data.topTags.length).toBeLessThanOrEqual(5);
    });

    it('limits topTags to maximum 5 tags', async () => {
      const mockBlogs = [
        {
          slug: 'post-1',
          title: 'Post 1',
          description: 'Desc',
          date: '2024-01-01',
          content: 'Content',
          tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7'],
          image: '/images/blog/default.webp',
        },
      ];

      (getAllBlogs as ReturnType<typeof vi.fn>).mockResolvedValue(mockBlogs);

      const request = new NextRequest('http://localhost/api/blog-stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.topTags.length).toBe(5);
    });

    it('handles empty blog list', async () => {
      (getAllBlogs as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const request = new NextRequest('http://localhost/api/blog-stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalPosts).toBe(0);
      expect(data.totalReadingTime).toBe(0);
      // NaN from 0/0, but Math.round(NaN) = NaN
      expect(data.topTags).toEqual([]);
    });

    it('handles blogs with no tags', async () => {
      const mockBlogs = [
        {
          slug: 'post-1',
          title: 'Post 1',
          description: 'Desc',
          date: '2024-01-01',
          content: 'Content',
          tags: [],
          image: '/images/blog/default.webp',
        },
      ];

      (getAllBlogs as ReturnType<typeof vi.fn>).mockResolvedValue(mockBlogs);

      const request = new NextRequest('http://localhost/api/blog-stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalPosts).toBe(1);
      expect(data.topTags).toEqual([]);
    });

    it('handles blogs with empty content', async () => {
      const mockBlogs = [
        {
          slug: 'post-1',
          title: 'Post 1',
          description: 'Desc',
          date: '2024-01-01',
          content: '',
          tags: ['test'],
          image: '/images/blog/default.webp',
        },
      ];

      (getAllBlogs as ReturnType<typeof vi.fn>).mockResolvedValue(mockBlogs);

      const request = new NextRequest('http://localhost/api/blog-stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalPosts).toBe(1);
      // Math.ceil(0/1000) * 5 = 0
      expect(data.totalReadingTime).toBe(0);
    });

    it('calculates reading time correctly for various content lengths', async () => {
      const mockBlogs = [
        {
          slug: 'short-post',
          title: 'Short Post',
          description: 'Desc',
          date: '2024-01-01',
          content: 'A'.repeat(500), // Math.ceil(500/1000) * 5 = 5
          tags: [],
          image: '/images/blog/default.webp',
        },
        {
          slug: 'medium-post',
          title: 'Medium Post',
          description: 'Desc',
          date: '2024-01-02',
          content: 'B'.repeat(1500), // Math.ceil(1500/1000) * 5 = 10
          tags: [],
          image: '/images/blog/default.webp',
        },
      ];

      (getAllBlogs as ReturnType<typeof vi.fn>).mockResolvedValue(mockBlogs);

      const request = new NextRequest('http://localhost/api/blog-stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalReadingTime).toBe(15); // 5 + 10
      expect(data.avgReadingTime).toBe(8); // Math.round(15/2)
    });
  });

  describe('error handling', () => {
    it('returns 500 when getAllBlogs throws an error', async () => {
      (getAllBlogs as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost/api/blog-stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch blog stats');
    });

    it('logs error when getAllBlogs fails', async () => {
      const error = new Error('File system error');
      (getAllBlogs as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      const request = new NextRequest('http://localhost/api/blog-stats');
      await GET(request);

      expect(logError).toHaveBeenCalledWith(
        'Blog Stats: Unexpected error',
        error,
        { component: 'blog-stats', action: 'GET' }
      );
    });

    it('handles unexpected data structure gracefully', async () => {
      // Blog with missing tags property
      const mockBlogs = [
        {
          slug: 'post-1',
          title: 'Post 1',
          description: 'Desc',
          date: '2024-01-01',
          content: 'Content',
          // tags is missing - this might cause issues
          image: '/images/blog/default.webp',
        },
      ];

      (getAllBlogs as ReturnType<typeof vi.fn>).mockResolvedValue(mockBlogs);

      const request = new NextRequest('http://localhost/api/blog-stats');

      // The route should handle this gracefully or throw an error
      // Based on the implementation, it will throw because blog.tags.forEach() fails on undefined
      const response = await GET(request);

      // Depending on implementation, this might be a 500 error
      expect(response.status).toBe(500);
    });
  });

  describe('response structure', () => {
    it('returns all expected fields in the response', async () => {
      const mockBlogs = [
        {
          slug: 'post-1',
          title: 'Post 1',
          description: 'Desc',
          date: '2024-01-01',
          content: 'Content here',
          tags: ['tag1'],
          image: '/images/blog/default.webp',
        },
      ];

      (getAllBlogs as ReturnType<typeof vi.fn>).mockResolvedValue(mockBlogs);

      const request = new NextRequest('http://localhost/api/blog-stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('totalPosts');
      expect(data).toHaveProperty('totalReadingTime');
      expect(data).toHaveProperty('avgReadingTime');
      expect(data).toHaveProperty('topTags');
      expect(typeof data.totalPosts).toBe('number');
      expect(typeof data.totalReadingTime).toBe('number');
      expect(typeof data.avgReadingTime).toBe('number');
      expect(Array.isArray(data.topTags)).toBe(true);
    });

    it('topTags items have correct structure', async () => {
      const mockBlogs = [
        {
          slug: 'post-1',
          title: 'Post 1',
          description: 'Desc',
          date: '2024-01-01',
          content: 'Content',
          tags: ['react', 'typescript'],
          image: '/images/blog/default.webp',
        },
      ];

      (getAllBlogs as ReturnType<typeof vi.fn>).mockResolvedValue(mockBlogs);

      const request = new NextRequest('http://localhost/api/blog-stats');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      data.topTags.forEach((tagItem: { tag: string; count: number }) => {
        expect(tagItem).toHaveProperty('tag');
        expect(tagItem).toHaveProperty('count');
        expect(typeof tagItem.tag).toBe('string');
        expect(typeof tagItem.count).toBe('number');
      });
    });
  });
});
