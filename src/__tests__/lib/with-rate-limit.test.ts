import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, RATE_LIMITS } from '@/lib/with-rate-limit';
import { rateLimiter, getClientIp } from '@/lib/rate-limit';
import { logError } from '@/lib/logger';

// Mock dependencies
vi.mock('@/lib/rate-limit', () => ({
  rateLimiter: {
    check: vi.fn(),
    getHeaders: vi.fn(),
  },
  getClientIp: vi.fn(),
  RATE_LIMITS: {
    STANDARD: { limit: 30, window: 60000 },
    AI_HEAVY: { limit: 5, window: 60000 },
    PUBLIC: { limit: 100, window: 60000 },
  },
}));

vi.mock('@/lib/rate-limit-redis', () => ({
  getRedisRateLimiter: vi.fn(() => null), // Default to no Redis
}));

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
}));

describe('withRateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock returns
    (getClientIp as Mock).mockReturnValue('192.168.1.1');
    (rateLimiter.check as Mock).mockReturnValue({
      success: true,
      limit: 30,
      remaining: 29,
      reset: Date.now() + 60000,
    });
    (rateLimiter.getHeaders as Mock).mockReturnValue({
      'X-RateLimit-Limit': '30',
      'X-RateLimit-Remaining': '29',
      'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString(),
    });
  });

  it('calls the handler when under rate limit', async () => {
    const mockHandler = vi.fn().mockResolvedValue(
      NextResponse.json({ success: true })
    );

    const wrappedHandler = withRateLimit(mockHandler);
    const request = new NextRequest('http://localhost/api/test');

    await wrappedHandler(request);

    expect(mockHandler).toHaveBeenCalledWith(request);
  });

  it('adds rate limit headers to successful responses', async () => {
    const mockHandler = vi.fn().mockResolvedValue(
      NextResponse.json({ success: true })
    );

    const wrappedHandler = withRateLimit(mockHandler);
    const request = new NextRequest('http://localhost/api/test');

    const response = await wrappedHandler(request);

    expect(response.headers.get('X-RateLimit-Limit')).toBe('30');
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('29');
    expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
    expect(response.headers.get('X-RateLimit-Backend')).toBe('memory');
  });

  it('returns 429 when rate limited', async () => {
    (rateLimiter.check as Mock).mockReturnValue({
      success: false,
      limit: 30,
      remaining: 0,
      reset: Date.now() + 60000,
    });
    (rateLimiter.getHeaders as Mock).mockReturnValue({
      'X-RateLimit-Limit': '30',
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString(),
    });

    const mockHandler = vi.fn();
    const wrappedHandler = withRateLimit(mockHandler);
    const request = new NextRequest('http://localhost/api/test');

    const response = await wrappedHandler(request);

    expect(response.status).toBe(429);
    expect(mockHandler).not.toHaveBeenCalled();

    const body = await response.json();
    expect(body.error).toBe('Too many requests');
    expect(body.retryAfter).toBeDefined();
  });

  it('includes Retry-After header when rate limited', async () => {
    (rateLimiter.check as Mock).mockReturnValue({
      success: false,
      limit: 30,
      remaining: 0,
      reset: Date.now() + 30000, // 30 seconds from now
    });

    const mockHandler = vi.fn();
    const wrappedHandler = withRateLimit(mockHandler);
    const request = new NextRequest('http://localhost/api/test');

    const response = await wrappedHandler(request);

    const retryAfter = response.headers.get('Retry-After');
    expect(retryAfter).toBeDefined();
    expect(parseInt(retryAfter!)).toBeGreaterThan(0);
  });

  it('returns 500 and logs error when handler throws', async () => {
    const testError = new Error('Handler error');
    const mockHandler = vi.fn().mockRejectedValue(testError);

    const wrappedHandler = withRateLimit(mockHandler);
    const request = new NextRequest('http://localhost/api/test');

    const response = await wrappedHandler(request);

    expect(response.status).toBe(500);
    expect(logError).toHaveBeenCalledWith('API handler error', testError, {
      component: 'withRateLimit',
      action: 'handler',
    });

    const body = await response.json();
    expect(body.error).toBe('Internal server error');
  });

  it('includes rate limit headers even on handler error', async () => {
    const mockHandler = vi.fn().mockRejectedValue(new Error('Handler error'));

    const wrappedHandler = withRateLimit(mockHandler);
    const request = new NextRequest('http://localhost/api/test');

    const response = await wrappedHandler(request);

    expect(response.headers.get('X-RateLimit-Limit')).toBe('30');
    expect(response.headers.get('X-RateLimit-Backend')).toBe('memory');
  });

  it('uses provided rate limit config', async () => {
    const mockHandler = vi.fn().mockResolvedValue(
      NextResponse.json({ success: true })
    );

    const customConfig = { limit: 10, window: 30000 };
    const wrappedHandler = withRateLimit(mockHandler, customConfig);
    const request = new NextRequest('http://localhost/api/test');

    await wrappedHandler(request);

    expect(rateLimiter.check).toHaveBeenCalledWith('192.168.1.1', 10, 30000);
  });

  it('defaults to STANDARD rate limit config', async () => {
    const mockHandler = vi.fn().mockResolvedValue(
      NextResponse.json({ success: true })
    );

    const wrappedHandler = withRateLimit(mockHandler);
    const request = new NextRequest('http://localhost/api/test');

    await wrappedHandler(request);

    expect(rateLimiter.check).toHaveBeenCalledWith(
      '192.168.1.1',
      RATE_LIMITS.STANDARD.limit,
      RATE_LIMITS.STANDARD.window
    );
  });

  it('uses client IP from request for rate limiting', async () => {
    (getClientIp as Mock).mockReturnValue('10.0.0.1');

    const mockHandler = vi.fn().mockResolvedValue(
      NextResponse.json({ success: true })
    );

    const wrappedHandler = withRateLimit(mockHandler);
    const request = new NextRequest('http://localhost/api/test');

    await wrappedHandler(request);

    expect(getClientIp).toHaveBeenCalledWith(request);
    expect(rateLimiter.check).toHaveBeenCalledWith('10.0.0.1', 30, 60000);
  });
});

describe('RATE_LIMITS re-export', () => {
  it('re-exports RATE_LIMITS from rate-limit module', () => {
    expect(RATE_LIMITS).toBeDefined();
    expect(RATE_LIMITS.STANDARD).toBeDefined();
    expect(RATE_LIMITS.AI_HEAVY).toBeDefined();
    expect(RATE_LIMITS.PUBLIC).toBeDefined();
  });
});
