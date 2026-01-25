import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the dependencies
vi.mock('@/lib/supabase', () => ({
  getSupabase: vi.fn(),
  isNoRowsError: vi.fn((error: { code?: string } | null) => error?.code === 'PGRST116'),
}));

vi.mock('@/lib/csrf', () => ({
  validateCsrf: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

vi.mock('@/lib/voter-hash', () => ({
  getVoterHash: vi.fn().mockReturnValue('mock-voter-hash'),
  isVoteDeduplicationEnabled: vi.fn(),
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

import { GET, POST, DELETE } from '@/app/api/reactions/route';
import { getSupabase, isNoRowsError } from '@/lib/supabase';
import { validateCsrf } from '@/lib/csrf';
import { isVoteDeduplicationEnabled, getVoterHash } from '@/lib/voter-hash';

describe('Reactions API Route', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    rpc: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    // Reset the chained mocks
    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
    (getSupabase as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);
    (isNoRowsError as ReturnType<typeof vi.fn>).mockImplementation(
      (error: { code?: string } | null) => error?.code === 'PGRST116'
    );
    (validateCsrf as ReturnType<typeof vi.fn>).mockReturnValue(null);
    (isVoteDeduplicationEnabled as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (getVoterHash as ReturnType<typeof vi.fn>).mockReturnValue('mock-voter-hash');
  });

  // Default reactions object with all fields
  const defaultReactions = {
    likes: 0,
    bookmarks: 0,
  };

  describe('GET /api/reactions', () => {
    it('returns reactions for a valid slug', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { likes: 10, bookmarks: 5, fire: 2, celebrate: 1, insightful: 3, thinking: 0 },
        error: null,
      });

      const request = new NextRequest('http://localhost/api/reactions?slug=test-post');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        data: {
          slug: 'test-post',
          likes: 10,
          bookmarks: 5,
          fire: 2,
          celebrate: 1,
          insightful: 3,
          thinking: 0,
        },
        success: true,
      });
    });

    it('returns zero reactions for a post with no reactions', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }, // No rows found
      });

      const request = new NextRequest('http://localhost/api/reactions?slug=new-post');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: { slug: 'new-post', ...defaultReactions }, success: true });
    });

    it('returns 400 for invalid slug', async () => {
      const request = new NextRequest('http://localhost/api/reactions?slug=');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.success).toBe(false);
    });

    it('returns 400 for missing slug parameter', async () => {
      const request = new NextRequest('http://localhost/api/reactions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('returns 500 on database error', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'DB_ERROR', message: 'Connection failed' },
      });

      const request = new NextRequest('http://localhost/api/reactions?slug=test-post');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch reactions');
      expect(data.success).toBe(false);
    });
  });

  describe('POST /api/reactions (without deduplication)', () => {
    beforeEach(() => {
      (isVoteDeduplicationEnabled as ReturnType<typeof vi.fn>).mockReturnValue(false);
    });

    it('adds a like reaction', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: { likes: 11, bookmarks: 5 },
        error: null,
      });

      const request = new NextRequest('http://localhost/api/reactions', {
        method: 'POST',
        body: JSON.stringify({ slug: 'test-post', type: 'like' }),
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: { slug: 'test-post', likes: 11, bookmarks: 5 }, success: true });
      expect(mockSupabase.rpc).toHaveBeenCalledWith('toggle_reaction', {
        post_slug: 'test-post',
        reaction_type: 'like',
      });
    });

    it('adds a bookmark reaction', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: { likes: 10, bookmarks: 6 },
        error: null,
      });

      const request = new NextRequest('http://localhost/api/reactions', {
        method: 'POST',
        body: JSON.stringify({ slug: 'test-post', type: 'bookmark' }),
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: { slug: 'test-post', likes: 10, bookmarks: 6 }, success: true });
    });

    it('returns 403 when CSRF validation fails', async () => {
      (validateCsrf as ReturnType<typeof vi.fn>).mockReturnValue(
        new Response(JSON.stringify({ error: 'CSRF validation failed' }), { status: 403 })
      );

      const request = new NextRequest('http://localhost/api/reactions', {
        method: 'POST',
        body: JSON.stringify({ slug: 'test-post', type: 'like' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(403);
    });

    it('returns 400 for invalid reaction type', async () => {
      const request = new NextRequest('http://localhost/api/reactions', {
        method: 'POST',
        body: JSON.stringify({ slug: 'test-post', type: 'upvote' }),
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

    it('returns 400 for invalid slug', async () => {
      const request = new NextRequest('http://localhost/api/reactions', {
        method: 'POST',
        body: JSON.stringify({ slug: 'Invalid Slug', type: 'like' }),
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

      const request = new NextRequest('http://localhost/api/reactions', {
        method: 'POST',
        body: JSON.stringify({ slug: 'test-post', type: 'like' }),
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to record reaction');
      expect(data.success).toBe(false);
    });
  });

  describe('POST /api/reactions (with deduplication)', () => {
    beforeEach(() => {
      (isVoteDeduplicationEnabled as ReturnType<typeof vi.fn>).mockReturnValue(true);
    });

    it('records vote with deduplication enabled', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: 11,
        error: null,
      });
      mockSupabase.single.mockResolvedValue({
        data: { likes: 11, bookmarks: 5 },
        error: null,
      });

      const request = new NextRequest('http://localhost/api/reactions', {
        method: 'POST',
        body: JSON.stringify({ slug: 'test-post', type: 'like' }),
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        data: {
          slug: 'test-post',
          likes: 11,
          bookmarks: 5,
        },
        success: true,
      });
      expect(mockSupabase.rpc).toHaveBeenCalledWith('record_vote', {
        p_slug: 'test-post',
        p_type: 'like',
        p_voter_hash: 'mock-voter-hash',
      });
    });

    it('handles already voted scenario', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: -1, // Already voted
        error: null,
      });
      mockSupabase.single.mockResolvedValue({
        data: { likes: 10, bookmarks: 5 },
        error: null,
      });

      const request = new NextRequest('http://localhost/api/reactions', {
        method: 'POST',
        body: JSON.stringify({ slug: 'test-post', type: 'like' }),
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.alreadyVoted).toBe(true);
      expect(data.data.likes).toBe(10);
      expect(data.success).toBe(true);
    });
  });

  describe('DELETE /api/reactions', () => {
    beforeEach(() => {
      (isVoteDeduplicationEnabled as ReturnType<typeof vi.fn>).mockReturnValue(false);
    });

    it('removes a like reaction', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: { likes: 9, bookmarks: 5 },
        error: null,
      });

      const request = new NextRequest('http://localhost/api/reactions?slug=test-post&type=like', {
        method: 'DELETE',
        headers: {
          'Origin': 'http://localhost',
        },
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: { slug: 'test-post', likes: 9, bookmarks: 5 }, success: true });
      expect(mockSupabase.rpc).toHaveBeenCalledWith('decrement_reaction', {
        post_slug: 'test-post',
        reaction_type: 'like',
      });
    });

    it('removes a bookmark reaction', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: { likes: 10, bookmarks: 4 },
        error: null,
      });

      const request = new NextRequest('http://localhost/api/reactions?slug=test-post&type=bookmark', {
        method: 'DELETE',
        headers: {
          'Origin': 'http://localhost',
        },
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: { slug: 'test-post', likes: 10, bookmarks: 4 }, success: true });
    });

    it('returns 403 when CSRF validation fails', async () => {
      (validateCsrf as ReturnType<typeof vi.fn>).mockReturnValue(
        new Response(JSON.stringify({ error: 'CSRF validation failed' }), { status: 403 })
      );

      const request = new NextRequest('http://localhost/api/reactions?slug=test-post&type=like', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      expect(response.status).toBe(403);
    });

    it('returns 400 for missing type parameter', async () => {
      const request = new NextRequest('http://localhost/api/reactions?slug=test-post', {
        method: 'DELETE',
        headers: {
          'Origin': 'http://localhost',
        },
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('returns 400 for invalid type parameter', async () => {
      const request = new NextRequest('http://localhost/api/reactions?slug=test-post&type=upvote', {
        method: 'DELETE',
        headers: {
          'Origin': 'http://localhost',
        },
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.success).toBe(false);
    });

    it('returns 500 on RPC error', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC failed' },
      });

      const request = new NextRequest('http://localhost/api/reactions?slug=test-post&type=like', {
        method: 'DELETE',
        headers: {
          'Origin': 'http://localhost',
        },
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to remove reaction');
      expect(data.success).toBe(false);
    });
  });

  describe('DELETE /api/reactions (with deduplication)', () => {
    beforeEach(() => {
      (isVoteDeduplicationEnabled as ReturnType<typeof vi.fn>).mockReturnValue(true);
    });

    it('removes vote with deduplication enabled', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: 9,
        error: null,
      });
      mockSupabase.single.mockResolvedValue({
        data: { likes: 9, bookmarks: 5 },
        error: null,
      });

      const request = new NextRequest('http://localhost/api/reactions?slug=test-post&type=like', {
        method: 'DELETE',
        headers: {
          'Origin': 'http://localhost',
        },
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        data: {
          slug: 'test-post',
          likes: 9,
          bookmarks: 5,
        },
        success: true,
      });
      expect(mockSupabase.rpc).toHaveBeenCalledWith('remove_vote', {
        p_slug: 'test-post',
        p_type: 'like',
        p_voter_hash: 'mock-voter-hash',
      });
    });

    it('handles never voted scenario', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: -1, // Never voted
        error: null,
      });
      mockSupabase.single.mockResolvedValue({
        data: { likes: 10, bookmarks: 5 },
        error: null,
      });

      const request = new NextRequest('http://localhost/api/reactions?slug=test-post&type=like', {
        method: 'DELETE',
        headers: {
          'Origin': 'http://localhost',
        },
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.neverVoted).toBe(true);
      expect(data.data.likes).toBe(10);
      expect(data.data.bookmarks).toBe(5);
      expect(data.success).toBe(true);
    });
  });
});
