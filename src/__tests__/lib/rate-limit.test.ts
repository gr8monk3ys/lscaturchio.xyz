import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getClientIp, RATE_LIMITS } from '@/lib/rate-limit';

// Create a fresh rate limiter for each test
function createRateLimiter() {
  // Clear module cache to get fresh instance
  const requests = new Map<string, { count: number; resetTime: number }>();

  return {
    check(identifier: string, limit: number = 10, windowMs: number = 60000) {
      const now = Date.now();
      const entry = requests.get(identifier);

      if (!entry || entry.resetTime < now) {
        requests.set(identifier, {
          count: 1,
          resetTime: now + windowMs,
        });
        return {
          success: true,
          limit,
          remaining: limit - 1,
          reset: now + windowMs,
        };
      }

      if (entry.count < limit) {
        entry.count++;
        return {
          success: true,
          limit,
          remaining: limit - entry.count,
          reset: entry.resetTime,
        };
      }

      return {
        success: false,
        limit,
        remaining: 0,
        reset: entry.resetTime,
      };
    },
    getHeaders(result: ReturnType<typeof this.check>) {
      return {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.reset).toISOString(),
      };
    },
  };
}

describe('RateLimiter', () => {
  let rateLimiter: ReturnType<typeof createRateLimiter>;

  beforeEach(() => {
    rateLimiter = createRateLimiter();
    vi.useFakeTimers();
  });

  it('allows requests under the limit', () => {
    const result = rateLimiter.check('user1', 5);

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.limit).toBe(5);
  });

  it('tracks requests per identifier', () => {
    rateLimiter.check('user1', 5);
    rateLimiter.check('user1', 5);
    const result = rateLimiter.check('user1', 5);

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('blocks requests over the limit', () => {
    const limit = 3;

    rateLimiter.check('user1', limit);
    rateLimiter.check('user1', limit);
    rateLimiter.check('user1', limit);
    const result = rateLimiter.check('user1', limit);

    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('resets after the time window', () => {
    const windowMs = 60000;

    // Use up all requests
    rateLimiter.check('user1', 2, windowMs);
    rateLimiter.check('user1', 2, windowMs);
    const blocked = rateLimiter.check('user1', 2, windowMs);

    expect(blocked.success).toBe(false);

    // Advance time past the window
    vi.advanceTimersByTime(windowMs + 1);

    const allowed = rateLimiter.check('user1', 2, windowMs);
    expect(allowed.success).toBe(true);
    expect(allowed.remaining).toBe(1);
  });

  it('tracks different users independently', () => {
    rateLimiter.check('user1', 2);
    rateLimiter.check('user1', 2);

    const user1 = rateLimiter.check('user1', 2);
    const user2 = rateLimiter.check('user2', 2);

    expect(user1.success).toBe(false);
    expect(user2.success).toBe(true);
    expect(user2.remaining).toBe(1);
  });

  describe('getHeaders', () => {
    it('returns correct rate limit headers', () => {
      const result = rateLimiter.check('user1', 10);
      const headers = rateLimiter.getHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('10');
      expect(headers['X-RateLimit-Remaining']).toBe('9');
      expect(headers['X-RateLimit-Reset']).toBeDefined();
    });
  });
});

describe('RATE_LIMITS presets', () => {
  it('has AI_HEAVY preset', () => {
    expect(RATE_LIMITS.AI_HEAVY).toEqual({
      limit: 5,
      window: 60000,
    });
  });

  it('has STANDARD preset', () => {
    expect(RATE_LIMITS.STANDARD).toEqual({
      limit: 30,
      window: 60000,
    });
  });

  it('has PUBLIC preset', () => {
    expect(RATE_LIMITS.PUBLIC).toEqual({
      limit: 100,
      window: 60000,
    });
  });

  it('has NEWSLETTER preset', () => {
    expect(RATE_LIMITS.NEWSLETTER).toEqual({
      limit: 3,
      window: 300000,
    });
  });
});

describe('getClientIp', () => {
  it('extracts IP from x-forwarded-for header', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      },
    });

    expect(getClientIp(request)).toBe('192.168.1.1');
  });

  it('extracts IP from x-real-ip header', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-real-ip': '192.168.1.2',
      },
    });

    expect(getClientIp(request)).toBe('192.168.1.2');
  });

  it('prefers x-real-ip over x-forwarded-for (Vercel priority)', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '192.168.1.1',
        'x-real-ip': '192.168.1.2',
      },
    });

    // x-real-ip has higher priority than x-forwarded-for
    expect(getClientIp(request)).toBe('192.168.1.2');
  });

  it('returns fingerprint when no IP headers (prevents shared rate limit)', () => {
    const request = new Request('http://localhost');

    // Now returns fingerprint-based identifier instead of 'unknown'
    const result = getClientIp(request);
    expect(result.startsWith('fingerprint:')).toBe(true);
  });

  it('prefers cf-connecting-ip over all other headers', () => {
    const request = new Request('http://localhost', {
      headers: {
        'cf-connecting-ip': '10.0.0.1',
        'x-forwarded-for': '192.168.1.1',
        'x-real-ip': '192.168.1.2',
      },
    });

    expect(getClientIp(request)).toBe('10.0.0.1');
  });

  it('trims whitespace from forwarded IPs', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '  192.168.1.1  , 10.0.0.1',
      },
    });

    expect(getClientIp(request)).toBe('192.168.1.1');
  });
});
