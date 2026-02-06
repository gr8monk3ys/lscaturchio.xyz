import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock the dependencies - use inline vi.fn() in factory since it's hoisted
vi.mock('@/lib/supabase', () => ({
  getSupabase: vi.fn(),
  isSupabaseConfigured: vi.fn(() => true),
  isNoRowsError: vi.fn((error: { code?: string } | null) => error?.code === 'PGRST116'),
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

import { GET, POST, OPTIONS } from '@/app/api/views/route';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { validateCsrf } from '@/lib/csrf';
import { getAllBlogs } from '@/lib/getAllBlogs';

describe('Views API Route', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    order: vi.fn().mockReturnThis(),
    rpc: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Set environment variables for Supabase to be "configured"
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_KEY = 'test-service-key';
    // Reset mocks to their default behavior
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    vi.mocked(getSupabase).mockReturnValue(mockSupabase as unknown as SupabaseClient);
    vi.mocked(validateCsrf).mockReturnValue(null);
  });

  describe('GET /api/views', () => {
    it('returns view count for a valid slug', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { count: 42 },
        error: null,
      });

      const request = new NextRequest('http://localhost/api/views?slug=test-post');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: { slug: 'test-post', views: 42 }, success: true });
    });

    it('returns 0 views for a post with no views', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }, // No rows found
      });

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

    it('returns 200 with zero views on database error (graceful fallback)', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'DB_ERROR', message: 'Connection failed' },
      });

      const request = new NextRequest('http://localhost/api/views?slug=test-post');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: { slug: 'test-post', views: 0 }, success: true });
    });

    it('returns all views with titles when all=true', async () => {
      const mockViewsData = [
        { slug: 'post-1', count: 100 },
        { slug: 'post-2', count: 50 },
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockViewsData,
        error: null,
      });

      (getAllBlogs as ReturnType<typeof vi.fn>).mockResolvedValue([
        { slug: 'post-1', title: 'First Post' },
        { slug: 'post-2', title: 'Second Post' },
      ]);

      // Note: The route uses OPTIONS method for fetching all views, not GET with ?all=true
      // OPTIONS is wrapped with withRateLimit, so it requires a NextRequest argument
      const request = new NextRequest('http://localhost/api/views', { method: 'OPTIONS' });
      const response = await OPTIONS(request);
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
      mockSupabase.rpc.mockResolvedValue({
        data: 43,
        error: null,
      });

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
      expect(mockSupabase.rpc).toHaveBeenCalledWith('increment_view_count', {
        post_slug: 'test-post',
      });
    });

    it('returns 403 when CSRF validation fails', async () => {
      (validateCsrf as ReturnType<typeof vi.fn>).mockReturnValue(
        new Response(JSON.stringify({ error: 'CSRF validation failed' }), { status: 403 })
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
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC failed' },
      });

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
