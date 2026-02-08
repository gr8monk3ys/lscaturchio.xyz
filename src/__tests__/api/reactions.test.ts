import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockSql = vi.fn();

// Mock the dependencies
vi.mock('@/lib/db', () => ({
  getDb: vi.fn(() => mockSql),
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
import { validateCsrf } from '@/lib/csrf';
import { isVoteDeduplicationEnabled, getVoterHash } from '@/lib/voter-hash';

describe('Reactions API Route', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(validateCsrf).mockReturnValue(null);
    vi.mocked(isVoteDeduplicationEnabled).mockReturnValue(false);
    vi.mocked(getVoterHash).mockReturnValue('mock-voter-hash');
  });

  describe('GET /api/reactions', () => {
    it('returns reactions for a valid slug', async () => {
      mockSql.mockResolvedValue([{ likes: 10, bookmarks: 5 }]);

      const request = new NextRequest('http://localhost/api/reactions?slug=test-post');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.slug).toBe('test-post');
      expect(data.data.likes).toBe(10);
      expect(data.data.bookmarks).toBe(5);
      expect(data.success).toBe(true);
    });

    it('returns zero reactions for a post with no reactions', async () => {
      mockSql.mockResolvedValue([]);

      const request = new NextRequest('http://localhost/api/reactions?slug=new-post');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: { slug: 'new-post', likes: 0, bookmarks: 0 }, success: true });
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
      mockSql.mockRejectedValue(new Error('Connection failed'));

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
      vi.mocked(isVoteDeduplicationEnabled).mockReturnValue(false);
    });

    it('adds a like reaction', async () => {
      mockSql.mockResolvedValue([{ toggle_reaction: { likes: 11, bookmarks: 5 } }]);

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
    });

    it('returns 403 when CSRF validation fails', async () => {
      vi.mocked(validateCsrf).mockReturnValue(
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
      mockSql.mockRejectedValue(new Error('RPC failed'));

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
      vi.mocked(isVoteDeduplicationEnabled).mockReturnValue(true);
    });

    it('records vote with deduplication enabled', async () => {
      // First call: record_vote returns 11
      mockSql.mockResolvedValueOnce([{ record_vote: 11 }]);
      // Second call: fetch reactions
      mockSql.mockResolvedValueOnce([{ likes: 11, bookmarks: 5 }]);

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
        data: { slug: 'test-post', likes: 11, bookmarks: 5 },
        success: true,
      });
    });

    it('handles already voted scenario', async () => {
      // record_vote returns -1 (already voted)
      mockSql.mockResolvedValueOnce([{ record_vote: -1 }]);
      // fetch current reactions
      mockSql.mockResolvedValueOnce([{ likes: 10, bookmarks: 5 }]);

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
      vi.mocked(isVoteDeduplicationEnabled).mockReturnValue(false);
    });

    it('removes a like reaction', async () => {
      mockSql.mockResolvedValue([{ decrement_reaction: { likes: 9, bookmarks: 5 } }]);

      const request = new NextRequest('http://localhost/api/reactions?slug=test-post&type=like', {
        method: 'DELETE',
        headers: { 'Origin': 'http://localhost' },
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ data: { slug: 'test-post', likes: 9, bookmarks: 5 }, success: true });
    });

    it('returns 403 when CSRF validation fails', async () => {
      vi.mocked(validateCsrf).mockReturnValue(
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
        headers: { 'Origin': 'http://localhost' },
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('returns 500 on RPC error', async () => {
      mockSql.mockRejectedValue(new Error('RPC failed'));

      const request = new NextRequest('http://localhost/api/reactions?slug=test-post&type=like', {
        method: 'DELETE',
        headers: { 'Origin': 'http://localhost' },
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
      vi.mocked(isVoteDeduplicationEnabled).mockReturnValue(true);
    });

    it('removes vote with deduplication enabled', async () => {
      mockSql.mockResolvedValueOnce([{ remove_vote: 9 }]);
      mockSql.mockResolvedValueOnce([{ likes: 9, bookmarks: 5 }]);

      const request = new NextRequest('http://localhost/api/reactions?slug=test-post&type=like', {
        method: 'DELETE',
        headers: { 'Origin': 'http://localhost' },
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        data: { slug: 'test-post', likes: 9, bookmarks: 5 },
        success: true,
      });
    });

    it('handles never voted scenario', async () => {
      mockSql.mockResolvedValueOnce([{ remove_vote: -1 }]);
      mockSql.mockResolvedValueOnce([{ likes: 10, bookmarks: 5 }]);

      const request = new NextRequest('http://localhost/api/reactions?slug=test-post&type=like', {
        method: 'DELETE',
        headers: { 'Origin': 'http://localhost' },
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
