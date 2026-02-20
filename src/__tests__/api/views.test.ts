import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Create a mock sql tagged template function
const mockSql = vi.fn();

// Mock the dependencies
vi.mock('@/lib/db', () => ({
  getDb: vi.fn(() => mockSql),
  isDatabaseConfigured: vi.fn(() => true),
}));

vi.mock('@/lib/csrf', () => ({
  validateCsrf: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

vi.mock('@/lib/getAllBlogs', () => ({
  getAllBlogs: vi.fn(),
}));

// Mock rate limiting to pass through for tests
vi.mock('@/lib/with-rate-limit', () => ({
  withRateLimit: (handler: (req: NextRequest) => Promise<Response>) => handler,
  RATE_LIMITS: {
    STANDARD: { limit: 60, window: 60000 },
    PUBLIC: { limit: 100, window: 60000 },
    AI_HEAVY: { limit: 5, window: 60000 },
  },
}));

import { GET, POST } from '@/app/api/views/route';
import { isDatabaseConfigured } from '@/lib/db';
import { validateCsrf } from '@/lib/csrf';
import { getAllBlogs } from '@/lib/getAllBlogs';

describe('Views API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isDatabaseConfigured).mockReturnValue(true);
    vi.mocked(validateCsrf).mockReturnValue(null);
  });

  describe('GET /api/views', () => {
    it('returns view count for a valid slug', async () => {
      mockSql.mockResolvedValue([{ count: 42 }]);

      const request = new NextRequest('http://localhost/api/views?slug=test-post');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: { slug: 'test-post', views: 42 }, success: true });
    });

    it('returns 0 views for a post with no views', async () => {
      mockSql.mockResolvedValue([]);

      const request = new NextRequest('http://localhost/api/views?slug=new-post');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: { slug: 'new-post', views: 0 }, success: true });
    });

    it('returns 400 for invalid slug', async () => {
      const request = new NextRequest('http://localhost/api/views?slug=');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.success).toBe(false);
    });

    it('returns 400 for missing slug parameter', async () => {
      const request = new NextRequest('http://localhost/api/views');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('returns 500 on database error', async () => {
      mockSql.mockRejectedValue(new Error('Connection failed'));

      const request = new NextRequest('http://localhost/api/views?slug=test-post');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch views');
      expect(data.success).toBe(false);
    });

    it('returns all views with titles via format=detailed', async () => {
      mockSql.mockResolvedValue([
        { slug: 'post-1', count: 100 },
        { slug: 'post-2', count: 50 },
      ]);

      (getAllBlogs as ReturnType<typeof vi.fn>).mockResolvedValue([
        { slug: 'post-1', title: 'First Post' },
        { slug: 'post-2', title: 'Second Post' },
      ]);

      const request = new NextRequest('http://localhost/api/views?format=detailed');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.views).toHaveLength(2);
      expect(data.data.views[0]).toEqual({ slug: 'post-1', title: 'First Post', views: 100 });
      expect(data.data.views[1]).toEqual({ slug: 'post-2', title: 'Second Post', views: 50 });
      expect(data.data.total).toBe(2);
    });
  });

  describe('POST /api/views', () => {
    it('increments view count for a valid slug', async () => {
      mockSql.mockResolvedValue([{ increment_view_count: 43 }]);

      const request = new NextRequest('http://localhost/api/views', {
        method: 'POST',
        body: JSON.stringify({ slug: 'test-post' }),
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: { slug: 'test-post', views: 43 }, success: true });
    });

    it('returns 403 when CSRF validation fails', async () => {
      (validateCsrf as ReturnType<typeof vi.fn>).mockReturnValue(
        NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 })
      );

      const request = new NextRequest('http://localhost/api/views', {
        method: 'POST',
        body: JSON.stringify({ slug: 'test-post' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(403);
    });

    it('returns 400 for invalid slug in body', async () => {
      const request = new NextRequest('http://localhost/api/views', {
        method: 'POST',
        body: JSON.stringify({ slug: 'Invalid Slug' }),
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.success).toBe(false);
    });

    it('returns 400 for missing slug in body', async () => {
      const request = new NextRequest('http://localhost/api/views', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('returns 500 on RPC error', async () => {
      mockSql.mockRejectedValue(new Error('RPC failed'));

      const request = new NextRequest('http://localhost/api/views', {
        method: 'POST',
        body: JSON.stringify({ slug: 'test-post' }),
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to record view');
      expect(data.success).toBe(false);
    });
  });
});
