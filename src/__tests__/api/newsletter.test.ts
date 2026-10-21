import { afterAll, beforeAll, describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockSql = vi.fn();

// Mock dependencies
vi.mock('@/lib/db', () => ({
  getDb: vi.fn(() => mockSql),
}));

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

vi.mock('@/lib/csrf', () => ({
  validateCsrf: vi.fn(() => null),
}));

vi.mock('@/lib/rate-limit', () => ({ withRateLimit: <T>(handler: T) => handler }));

import { POST } from '@/app/api/newsletter/subscribe/route';
import { logError } from '@/lib/logger';
import { installMailTransport } from '@/lib/mail/deliver';
import { createOutbox } from '@/lib/mail/outbox';

// The mailer: an in-memory outbox in place of Resend.
const outbox = createOutbox();
let restoreTransport: () => void;
beforeAll(() => {
  restoreTransport = installMailTransport(outbox);
});
afterAll(() => restoreTransport());

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
    outbox.clear();
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

      expect(response.status).toBe(200);
      expect(data.data.message).toBe('Thanks! Check your inbox to confirm your subscription.');
      expect(data.success).toBe(true);
    });

    it('sends welcome email after successful subscription', async () => {
      mockSql.mockResolvedValueOnce([]);
      mockSql.mockResolvedValueOnce([]);

      const request = createMockRequest({ email: 'new@example.com' });
      await POST(request);

      await vi.waitFor(() => expect(outbox.sent).toHaveLength(1));
      expect(outbox.sent[0].to).toBe('new@example.com');
    });
  });

  describe('existing subscriber', () => {
    it('returns the same body for an active subscriber', async () => {
      mockSql.mockResolvedValueOnce([{ email: 'existing@example.com', is_active: true }]);

      const request = createMockRequest({ email: 'existing@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.message).toBe('Thanks! Check your inbox to confirm your subscription.');
      expect(data.success).toBe(true);
    });

    it('updates active subscriber preferences without restarting onboarding', async () => {
      mockSql.mockResolvedValueOnce([{ email: 'existing@example.com', is_active: true }]);
      mockSql.mockResolvedValueOnce([]);

      const request = createMockRequest({
        email: 'existing@example.com',
        topics: ['rag-llms', 'systems-craft'],
        source: '/blog/test-post',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Updating preferences must not change the response either.
      expect(data.data.message).toBe('Thanks! Check your inbox to confirm your subscription.');
      expect(mockSql).toHaveBeenCalledTimes(2);

      const updateCall = mockSql.mock.calls[1];
      const metadataJson = updateCall[1] as string;
      expect(JSON.parse(metadataJson)).toEqual({
        topics: ['rag-llms', 'systems-craft'],
        source: { path: '/blog/test-post' },
      });
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
      expect(data.data.message).toBe('Thanks! Check your inbox to confirm your subscription.');
      expect(data.success).toBe(true);
    });

    it('sends welcome email when reactivating subscription', async () => {
      mockSql.mockResolvedValueOnce([{ email: 'inactive@example.com', is_active: false }]);
      mockSql.mockResolvedValueOnce([]);

      const request = createMockRequest({ email: 'inactive@example.com' });
      await POST(request);

      await vi.waitFor(() => expect(outbox.sent).toHaveLength(1));
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

    it('still succeeds if the welcome email fails, and logs the failure', async () => {
      mockSql.mockResolvedValueOnce([]);
      mockSql.mockResolvedValueOnce([]);
      outbox.respondWith({ status: 'failed', reason: 'Resend API error' });

      const request = createMockRequest({ email: 'test@example.com' });
      const response = await POST(request);
      const data = await response.json();

      // The subscription stands; the welcome email is not awaited.
      expect(response.status).toBe(200);
      expect(data.data.message).toBe('Thanks! Check your inbox to confirm your subscription.');
      expect(data.success).toBe(true);
      // It used to be `.catch(() => {})`: a failure went nowhere.
      await vi.waitFor(() =>
        expect(logError).toHaveBeenCalledWith(
          'Mail: Resend API error',
          undefined,
          expect.objectContaining({ component: 'newsletter/subscribe' })
        )
      );
    });

    it('logs a missing mail configuration instead of skipping the welcome email silently', async () => {
      mockSql.mockResolvedValueOnce([]);
      mockSql.mockResolvedValueOnce([]);
      outbox.respondWith({ status: 'not-configured', missing: 'RESEND_API_KEY' });

      const response = await POST(createMockRequest({ email: 'test@example.com' }));

      expect(response.status).toBe(200);
      await vi.waitFor(() =>
        expect(logError).toHaveBeenCalledWith(
          'Mail: RESEND_API_KEY is not configured; message not sent',
          null,
          expect.objectContaining({ component: 'newsletter/subscribe' })
        )
      );
    });
  });
});
