import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getClientIp, RATE_LIMITS } from '@/lib/rate-limit';

describe('rateLimiter', () => {
  // The limiter is a module-level singleton over one MemoryStore, so each test
  // re-imports the module to get an empty store. (The previous version of this
  // file hand-rolled a *copy* of the implementation and asserted against that,
  // so it kept passing no matter what the real module did.)
  let rateLimiter: typeof import('@/lib/rate-limit').rateLimiter;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
    rateLimiter = (await import('@/lib/rate-limit')).rateLimiter;
  });

  afterEach(() => {
    vi.useRealTimers();
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

  it('keeps the reset time of the window a client is already inside', () => {
    const windowMs = 60000;
    const first = rateLimiter.check('user1', 5, windowMs);

    vi.advanceTimersByTime(10_000);
    const second = rateLimiter.check('user1', 5, windowMs);

    // Fixed window: the second request does not extend the deadline.
    expect(second.reset).toBe(first.reset);
  });

  describe('getHeaders', () => {
    it('returns correct rate limit headers', () => {
      const result = rateLimiter.check('user1', 10);
      const headers = rateLimiter.getHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('10');
      expect(headers['X-RateLimit-Remaining']).toBe('9');
      expect(headers['X-RateLimit-Reset']).toBe(new Date(result.reset).toISOString());
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

  it('has CHAT preset', () => {
    expect(RATE_LIMITS.CHAT).toEqual({
      limit: 3,
      window: 60000,
    });
  });

  it('has SUMMARIZE preset', () => {
    expect(RATE_LIMITS.SUMMARIZE).toEqual({
      limit: 2,
      window: 60000,
    });
  });

  it('has RELATED_POSTS preset', () => {
    expect(RATE_LIMITS.RELATED_POSTS).toEqual({
      limit: 10,
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

  it('prefers x-vercel-forwarded-for (platform-set) over other headers', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-vercel-forwarded-for': '203.0.113.5',
        'x-real-ip': '192.168.1.2',
        'x-forwarded-for': '192.168.1.1',
      },
    });

    // The platform-set header is the spoof-resistant source of truth.
    expect(getClientIp(request)).toBe('203.0.113.5');
  });

  it('does not trust cf-connecting-ip (app is not behind Cloudflare)', () => {
    // cf-connecting-ip is fully client-controlled when not behind Cloudflare,
    // so it must NOT win over the platform-set x-real-ip / x-forwarded-for.
    const request = new Request('http://localhost', {
      headers: {
        'cf-connecting-ip': '10.0.0.1',
        'x-forwarded-for': '192.168.1.1',
        'x-real-ip': '192.168.1.2',
      },
    });

    const result = getClientIp(request);
    expect(result).not.toBe('10.0.0.1');
    expect(result).toBe('192.168.1.2');
  });

  it('treats a lone cf-connecting-ip as untrusted and falls back to fingerprint', () => {
    const request = new Request('http://localhost', {
      headers: {
        'cf-connecting-ip': '10.0.0.1',
      },
    });

    const result = getClientIp(request);
    expect(result).not.toBe('10.0.0.1');
    expect(result.startsWith('fingerprint:')).toBe(true);
  });

  it('trims whitespace from forwarded IPs', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '  192.168.1.1  , 10.0.0.1',
      },
    });

    expect(getClientIp(request)).toBe('192.168.1.1');
  });

  it('ignores untrusted client-controlled IP headers', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-client-ip': '203.0.113.10',
      },
    });

    const result = getClientIp(request);
    expect(result.startsWith('fingerprint:')).toBe(true);
  });
});
