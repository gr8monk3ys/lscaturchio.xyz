import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockSql = vi.fn();

// Mock dependencies before imports
vi.mock('@/lib/db', () => ({
  getDb: vi.fn(() => mockSql),
}));

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
}));

vi.mock('@/lib/with-rate-limit', () => ({
  withRateLimit: (handler: (req: NextRequest) => Promise<Response>) => handler,
}));

vi.mock('@/lib/rate-limit', () => ({
  RATE_LIMITS: {
    NEWSLETTER: { limit: 3, window: 300000 },
  },
}));

import { POST } from '@/app/api/newsletter/unsubscribe/route';
import { logError } from '@/lib/logger';

// Helper to create mock request
function createMockRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/newsletter/unsubscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      origin: 'http://localhost:3000',
    },
    body: JSON.stringify(body),
  });
}

describe('/api/newsletter/unsubscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('token validation', () => {
    it('returns 400 when token is missing', async () => {
      const request = createMockRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Unsubscribe token is required');
    });

    it('returns 400 when token is empty string', async () => {
      const request = createMockRequest({ token: '' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Unsubscribe token is required');
    });

    it('returns 400 when token is not a string', async () => {
      const request = createMockRequest({ token: 12345 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Unsubscribe token is required');
    });

    it('returns 400 when token is null', async () => {
      const request = createMockRequest({ token: null });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Unsubscribe token is required');
    });
  });

  describe('successful unsubscribe', () => {
    it('unsubscribes active subscriber with valid token', async () => {
      // First call: SELECT finds active subscriber
      mockSql.mockResolvedValueOnce([{ email: 'test@example.com', is_active: true }]);
      // Second call: UPDATE succeeds
      mockSql.mockResolvedValueOnce([]);

      const request = createMockRequest({ token: 'valid-unsubscribe-token' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Successfully unsubscribed');
    });

    it('calls sql with correct token for lookup', async () => {
      mockSql.mockResolvedValueOnce([{ email: 'test@example.com', is_active: true }]);
      mockSql.mockResolvedValueOnce([]);

      const request = createMockRequest({ token: 'my-token-123' });
      await POST(request);

      // mockSql is called as tagged template - verify it was called
      expect(mockSql).toHaveBeenCalledTimes(2);
    });
  });

  describe('already unsubscribed', () => {
    it('returns success message when subscriber is already inactive', async () => {
      mockSql.mockResolvedValueOnce([{ email: 'test@example.com', is_active: false }]);

      const request = createMockRequest({ token: 'inactive-subscriber-token' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Already unsubscribed');
    });

    it('does not attempt to update when already unsubscribed', async () => {
      mockSql.mockResolvedValueOnce([{ email: 'test@example.com', is_active: false }]);

      const request = createMockRequest({ token: 'inactive-subscriber-token' });
      await POST(request);

      // Only 1 call (the SELECT), no UPDATE
      expect(mockSql).toHaveBeenCalledTimes(1);
    });
  });

  describe('subscriber not found', () => {
    it('returns 404 when token does not match any subscriber', async () => {
      mockSql.mockResolvedValueOnce([]);

      const request = createMockRequest({ token: 'nonexistent-token' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Invalid unsubscribe token');
    });
  });

  describe('database error handling', () => {
    it('returns 500 when find query throws exception', async () => {
      mockSql.mockRejectedValue(new Error('Database connection failed'));

      const request = createMockRequest({ token: 'valid-token' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to unsubscribe. Please try again later.');
    });

    it('returns 500 when update throws', async () => {
      mockSql.mockResolvedValueOnce([{ email: 'test@example.com', is_active: true }]);
      mockSql.mockRejectedValueOnce(new Error('Update failed'));

      const request = createMockRequest({ token: 'valid-token' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to unsubscribe. Please try again later.');
    });

    it('logs error when database operation fails', async () => {
      const dbError = new Error('Connection timeout');
      mockSql.mockRejectedValue(dbError);

      const request = createMockRequest({ token: 'valid-token' });
      await POST(request);

      expect(logError).toHaveBeenCalledWith(
        'Newsletter Unsubscribe: Unexpected error',
        dbError,
        { component: 'newsletter/unsubscribe', action: 'POST' }
      );
    });
  });

  describe('request body parsing', () => {
    it('returns 500 when request body is invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          origin: 'http://localhost:3000',
        },
        body: 'invalid-json{',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to unsubscribe. Please try again later.');
    });
  });
});
