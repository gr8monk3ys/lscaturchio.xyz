import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
  insert: vi.fn(),
  update: vi.fn().mockReturnThis(),
};

vi.mock('@/lib/supabase', () => ({
  getSupabase: () => mockSupabase,
}));

vi.mock('@/lib/email', () => ({
  sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
}));

// Note: CSRF validation is not used in this route (uses rate limiting instead)

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
    // Default: no existing subscriber
    mockSupabase.single.mockResolvedValue({ data: null, error: null });
    // Default: insert succeeds
    mockSupabase.insert.mockResolvedValue({ error: null });
    // Default: update succeeds
    mockSupabase.update.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
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

  // Note: CSRF protection removed from this endpoint in favor of rate limiting
  // The withRateLimit HOF provides protection against abuse

  describe('new subscription', () => {
    it('successfully subscribes new email', async () => {
      const request = createMockRequest({ email: 'new@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.message).toBe('Successfully subscribed to newsletter!');
      expect(data.success).toBe(true);
    });

    it('normalizes email to lowercase', async () => {
      const request = createMockRequest({ email: 'TEST@EXAMPLE.COM' });
      await POST(request);

      expect(mockSupabase.from).toHaveBeenCalledWith('newsletter_subscribers');
      expect(mockSupabase.eq).toHaveBeenCalledWith('email', 'test@example.com');
    });

    it('trims whitespace from email', async () => {
      const request = createMockRequest({ email: '  test@example.com  ' });
      await POST(request);

      expect(mockSupabase.eq).toHaveBeenCalledWith('email', 'test@example.com');
    });

    it('sends welcome email after successful subscription', async () => {
      const request = createMockRequest({ email: 'new@example.com' });
      await POST(request);

      expect(sendWelcomeEmail).toHaveBeenCalledWith(
        'new@example.com',
        expect.any(String) // unsubscribe token
      );
    });

    it('inserts subscriber with unsubscribe token', async () => {
      const request = createMockRequest({ email: 'new@example.com' });
      await POST(request);

      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'new@example.com',
          unsubscribe_token: expect.any(String),
        })
      );
    });
  });

  describe('existing subscriber', () => {
    it('returns already subscribed message for active subscriber', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { email: 'existing@example.com', is_active: true },
        error: null,
      });

      const request = createMockRequest({ email: 'existing@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.message).toBe('Already subscribed');
      expect(data.data.alreadySubscribed).toBe(true);
      expect(data.success).toBe(true);
    });

    it('reactivates inactive subscriber', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { email: 'inactive@example.com', is_active: false },
        error: null,
      });

      const mockUpdate = {
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      mockSupabase.update.mockReturnValue(mockUpdate);

      const request = createMockRequest({ email: 'inactive@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.message).toBe('Successfully resubscribed!');
      expect(data.data.resubscribed).toBe(true);
      expect(data.success).toBe(true);
    });

    it('sends welcome email when reactivating subscription', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { email: 'inactive@example.com', is_active: false },
        error: null,
      });

      const mockUpdate = {
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      mockSupabase.update.mockReturnValue(mockUpdate);

      const request = createMockRequest({ email: 'inactive@example.com' });
      await POST(request);

      expect(sendWelcomeEmail).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('returns 500 when database insert fails', async () => {
      mockSupabase.insert.mockResolvedValue({
        error: new Error('Database error'),
      });

      const request = createMockRequest({ email: 'test@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to subscribe. Please try again later.');
      expect(data.success).toBe(false);
    });

    it('returns 500 when database query fails', async () => {
      mockSupabase.single.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({ email: 'test@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to subscribe. Please try again later.');
      expect(data.success).toBe(false);
    });

    it('still succeeds if welcome email fails', async () => {
      vi.mocked(sendWelcomeEmail).mockRejectedValue(new Error('Email error'));

      const request = createMockRequest({ email: 'test@example.com' });
      const response = await POST(request);
      const data = await response.json();

      // Should still succeed - email is non-blocking
      expect(response.status).toBe(201);
      expect(data.data.message).toBe('Successfully subscribed to newsletter!');
      expect(data.success).toBe(true);
    });
  });
});
