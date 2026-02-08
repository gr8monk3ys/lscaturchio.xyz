import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockSql = vi.fn();

// Mock dependencies
vi.mock('@/lib/db', () => ({
  getDb: vi.fn(() => mockSql),
}));

vi.mock('@/lib/email', () => ({
  sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
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

import { POST } from '@/app/api/newsletter/subscribe/route';
import { sendWelcomeEmail } from '@/lib/email';

// Helper to create mock request
function createMockRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      origin: 'http://localhost:3000',
    },
    body: JSON.stringify(body),
  });
}

describe('/api/newsletter/subscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no existing subscriber (empty rows)
    mockSql.mockResolvedValue([]);
  });

  describe('validation', () => {
    it('returns 400 when email is missing', async () => {
      const request = createMockRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.success).toBe(false);
    });

    it('returns 400 when email is empty string', async () => {
      const request = createMockRequest({ email: '' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.success).toBe(false);
    });

    it('returns 400 when email is invalid format', async () => {
      const request = createMockRequest({ email: 'not-an-email' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.success).toBe(false);
    });

    it('returns 400 when email has invalid domain', async () => {
      const request = createMockRequest({ email: 'test@invalid' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.success).toBe(false);
    });
  });

  describe('new subscription', () => {
    it('successfully subscribes new email', async () => {
      // First call: SELECT returns no existing subscriber
      mockSql.mockResolvedValueOnce([]);
      // Second call: INSERT succeeds
      mockSql.mockResolvedValueOnce([]);

      const request = createMockRequest({ email: 'new@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.message).toBe('Successfully subscribed to newsletter!');
      expect(data.success).toBe(true);
    });

    it('sends welcome email after successful subscription', async () => {
      mockSql.mockResolvedValueOnce([]);
      mockSql.mockResolvedValueOnce([]);

      const request = createMockRequest({ email: 'new@example.com' });
      await POST(request);

      expect(sendWelcomeEmail).toHaveBeenCalledWith(
        'new@example.com',
        expect.any(String) // unsubscribe token
      );
    });
  });

  describe('existing subscriber', () => {
    it('returns already subscribed message for active subscriber', async () => {
      mockSql.mockResolvedValueOnce([{ email: 'existing@example.com', is_active: true }]);

      const request = createMockRequest({ email: 'existing@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.message).toBe('Already subscribed');
      expect(data.data.alreadySubscribed).toBe(true);
      expect(data.success).toBe(true);
    });

    it('reactivates inactive subscriber', async () => {
      // First call: SELECT returns inactive subscriber
      mockSql.mockResolvedValueOnce([{ email: 'inactive@example.com', is_active: false }]);
      // Second call: UPDATE succeeds
      mockSql.mockResolvedValueOnce([]);

      const request = createMockRequest({ email: 'inactive@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.message).toBe('Successfully resubscribed!');
      expect(data.data.resubscribed).toBe(true);
      expect(data.success).toBe(true);
    });

    it('sends welcome email when reactivating subscription', async () => {
      mockSql.mockResolvedValueOnce([{ email: 'inactive@example.com', is_active: false }]);
      mockSql.mockResolvedValueOnce([]);

      const request = createMockRequest({ email: 'inactive@example.com' });
      await POST(request);

      expect(sendWelcomeEmail).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('returns 500 when database query fails', async () => {
      mockSql.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({ email: 'test@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to subscribe. Please try again later.');
      expect(data.success).toBe(false);
    });

    it('still succeeds if welcome email fails', async () => {
      mockSql.mockResolvedValueOnce([]);
      mockSql.mockResolvedValueOnce([]);
      vi.mocked(sendWelcomeEmail).mockRejectedValue(new Error('Email error'));

      const request = createMockRequest({ email: 'test@example.com' });
      const response = await POST(request);
      const data = await response.json();

      // Should still succeed - email is non-blocking (catch in route)
      expect(response.status).toBe(201);
      expect(data.data.message).toBe('Successfully subscribed to newsletter!');
      expect(data.success).toBe(true);
    });
  });
});
