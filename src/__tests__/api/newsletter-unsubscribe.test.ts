import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies before imports
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
  update: vi.fn().mockReturnThis(),
};

vi.mock('@/lib/supabase', () => ({
  getSupabase: () => mockSupabase,
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
    // Reset mock chain
    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
    mockSupabase.update.mockReturnThis();
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

  // Note: CSRF protection removed from this endpoint in favor of rate limiting
  // The withRateLimit HOF provides protection against abuse

  describe('successful unsubscribe', () => {
    it('unsubscribes active subscriber with valid token', async () => {
      // Mock finding active subscriber
      mockSupabase.single.mockResolvedValue({
        data: { email: 'test@example.com', is_active: true },
        error: null,
      });

      // Mock successful update
      const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
      mockSupabase.update.mockReturnValue({
        eq: mockUpdateEq,
      });

      const request = createMockRequest({ token: 'valid-unsubscribe-token' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Successfully unsubscribed');
    });

    it('queries newsletter_subscribers table with correct token', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { email: 'test@example.com', is_active: true },
        error: null,
      });

      const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
      mockSupabase.update.mockReturnValue({
        eq: mockUpdateEq,
      });

      const request = createMockRequest({ token: 'my-token-123' });
      await POST(request);

      expect(mockSupabase.from).toHaveBeenCalledWith('newsletter_subscribers');
      expect(mockSupabase.select).toHaveBeenCalledWith('email, is_active');
      expect(mockSupabase.eq).toHaveBeenCalledWith('unsubscribe_token', 'my-token-123');
    });

    it('updates is_active to false for matching token', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { email: 'test@example.com', is_active: true },
        error: null,
      });

      const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
      mockSupabase.update.mockReturnValue({
        eq: mockUpdateEq,
      });

      const request = createMockRequest({ token: 'valid-token' });
      await POST(request);

      expect(mockSupabase.update).toHaveBeenCalledWith({ is_active: false });
      expect(mockUpdateEq).toHaveBeenCalledWith('unsubscribe_token', 'valid-token');
    });
  });

  describe('already unsubscribed', () => {
    it('returns success message when subscriber is already inactive', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { email: 'test@example.com', is_active: false },
        error: null,
      });

      const request = createMockRequest({ token: 'inactive-subscriber-token' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Already unsubscribed');
    });

    it('does not attempt to update when already unsubscribed', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { email: 'test@example.com', is_active: false },
        error: null,
      });

      const request = createMockRequest({ token: 'inactive-subscriber-token' });
      await POST(request);

      // update should not be called for already unsubscribed
      expect(mockSupabase.update).not.toHaveBeenCalled();
    });
  });

  describe('subscriber not found', () => {
    it('returns 404 when token does not match any subscriber', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      const request = createMockRequest({ token: 'nonexistent-token' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Invalid unsubscribe token');
    });

    it('returns 404 when subscriber data is null', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: null,
      });

      const request = createMockRequest({ token: 'unknown-token' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Invalid unsubscribe token');
    });

    it('returns 404 when findError is truthy', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { email: 'test@example.com', is_active: true },
        error: { code: 'SOME_ERROR', message: 'Database lookup failed' },
      });

      const request = createMockRequest({ token: 'error-token' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Invalid unsubscribe token');
    });
  });

  describe('database error handling', () => {
    it('returns 500 when find query throws exception', async () => {
      mockSupabase.single.mockRejectedValue(new Error('Database connection failed'));

      const request = createMockRequest({ token: 'valid-token' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to unsubscribe. Please try again later.');
    });

    it('returns 500 when update fails', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { email: 'test@example.com', is_active: true },
        error: null,
      });

      const mockUpdateEq = vi.fn().mockResolvedValue({
        error: { message: 'Update failed' },
      });
      mockSupabase.update.mockReturnValue({
        eq: mockUpdateEq,
      });

      const request = createMockRequest({ token: 'valid-token' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to unsubscribe. Please try again later.');
    });

    it('logs error when database operation fails', async () => {
      const dbError = new Error('Connection timeout');
      mockSupabase.single.mockRejectedValue(dbError);

      const request = createMockRequest({ token: 'valid-token' });
      await POST(request);

      expect(logError).toHaveBeenCalledWith(
        'Newsletter Unsubscribe: Unexpected error',
        dbError,
        { component: 'newsletter/unsubscribe', action: 'POST' }
      );
    });

    it('logs error when update operation throws', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { email: 'test@example.com', is_active: true },
        error: null,
      });

      const updateError = { message: 'Foreign key violation' };
      const mockUpdateEq = vi.fn().mockResolvedValue({
        error: updateError,
      });
      mockSupabase.update.mockReturnValue({
        eq: mockUpdateEq,
      });

      const request = createMockRequest({ token: 'valid-token' });
      await POST(request);

      expect(logError).toHaveBeenCalledWith(
        'Newsletter Unsubscribe: Unexpected error',
        updateError,
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
