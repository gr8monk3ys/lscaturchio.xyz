/**
 * Rate limiting, tested at its interface: charge a request against a policy
 * name. The stores are real `MemoryStore`s, or a hand-written store standing
 * in for Upstash where a test needs it to fail. Nothing between the request
 * and the store is mocked, so the bucket key — where the cross-policy bug in
 * ffee38e lived — is exercised, not assumed.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { MemoryStore, type RateLimitStore } from '@gr8monk3ys/next-kit/rate-limit';
import {
  createRateLimit,
  getClientIp,
  RATE_LIMIT_POLICIES,
  SHARED_STORE_RETRY_AFTER_MS,
  type RateLimitPolicy,
} from '@/lib/rate-limit';
import { logError, logWarn } from '@/lib/logger';

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
  logWarn: vi.fn(),
}));

function request(ip = '203.0.113.7'): NextRequest {
  return new NextRequest('http://localhost/api/test', { headers: { 'x-real-ip': ip } });
}

function memoryOnly() {
  return createRateLimit({ shared: () => null, local: new MemoryStore() });
}

/** Charge `times` requests and return the last charge. */
async function chargeN(
  limiter: ReturnType<typeof createRateLimit>,
  policy: RateLimitPolicy,
  times: number,
  ip?: string,
) {
  let last = await limiter.charge(request(ip), policy);
  for (let i = 1; i < times; i += 1) {
    last = await limiter.charge(request(ip), policy);
  }
  return last;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('charge', () => {
  it('admits up to the policy limit and counts down X-RateLimit-Remaining', async () => {
    const limiter = memoryOnly();
    const { limit } = RATE_LIMIT_POLICIES.CONTACT;

    for (let i = 0; i < limit; i += 1) {
      const charge = await limiter.charge(request(), 'CONTACT');
      expect(charge.allowed).toBe(true);
      expect(charge.headers['X-RateLimit-Remaining']).toBe(String(limit - i - 1));
    }

    expect((await limiter.charge(request(), 'CONTACT')).allowed).toBe(false);
  });

  it('keeps two policies with identical numbers independent', async () => {
    // CONTACT and NEWSLETTER_SUBSCRIBE are both 3 per 5 minutes. When a policy
    // was its numbers, they were one bucket: three contact messages used up
    // the same reader's newsletter signup.
    expect(RATE_LIMIT_POLICIES.CONTACT).toEqual(RATE_LIMIT_POLICIES.NEWSLETTER_SUBSCRIBE);
    const limiter = memoryOnly();

    const contact = await chargeN(limiter, 'CONTACT', RATE_LIMIT_POLICIES.CONTACT.limit + 1);
    const subscribe = await limiter.charge(request(), 'NEWSLETTER_SUBSCRIBE');

    expect(contact.allowed).toBe(false);
    expect(subscribe.allowed).toBe(true);
    expect(subscribe.headers['X-RateLimit-Remaining']).toBe(
      String(RATE_LIMIT_POLICIES.NEWSLETTER_SUBSCRIBE.limit - 1),
    );
  });

  it('keeps the same client independent across policies with different numbers', async () => {
    // A reader who opens an essay spends several PUBLIC_READ hits on load;
    // none of them may come out of CHAT's 3-per-minute allowance.
    const limiter = memoryOnly();
    await chargeN(limiter, 'PUBLIC_READ', 4);

    const chat = await limiter.charge(request(), 'CHAT');

    expect(chat.allowed).toBe(true);
    expect(chat.headers['X-RateLimit-Remaining']).toBe(String(RATE_LIMIT_POLICIES.CHAT.limit - 1));
  });

  it('keeps different clients under one policy independent', async () => {
    const limiter = memoryOnly();
    await chargeN(limiter, 'CHAT', RATE_LIMIT_POLICIES.CHAT.limit + 1, '198.51.100.1');

    expect((await limiter.charge(request('198.51.100.2'), 'CHAT')).allowed).toBe(true);
  });

  it('opens a fresh window once the policy window has passed', async () => {
    const limiter = memoryOnly();
    expect((await chargeN(limiter, 'CHAT', RATE_LIMIT_POLICIES.CHAT.limit + 1)).allowed).toBe(false);

    vi.advanceTimersByTime(RATE_LIMIT_POLICIES.CHAT.windowMs + 1);

    expect((await limiter.charge(request(), 'CHAT')).allowed).toBe(true);
  });

  it('builds one key, <POLICY>:<client>, and hands it to the shared store', async () => {
    const keys: string[] = [];
    const shared = new MemoryStore();
    const recording: RateLimitStore = {
      hit: (key, windowMs) => {
        keys.push(key);
        return shared.hit(key, windowMs);
      },
      reset: () => {},
      cleanup: () => {},
    };
    const local = new MemoryStore();
    const limiter = createRateLimit({ shared: () => recording, local });

    const charge = await limiter.charge(request('203.0.113.9'), 'SEARCH');

    expect(keys).toEqual(['SEARCH:203.0.113.9']);
    expect(charge.headers['X-RateLimit-Backend']).toBe('redis');
    expect(local.size).toBe(0);
  });
});

describe('charge when the shared store fails', () => {
  const failing = (): RateLimitStore & { hit: ReturnType<typeof vi.fn> } => ({
    hit: vi.fn(async () => {
      throw new Error('Your database has been temporarily rate-limited.');
    }),
    reset: () => {},
    cleanup: () => {},
  });

  it('still enforces the policy through the memory store', async () => {
    const limiter = createRateLimit({ shared: failing, local: new MemoryStore() });
    const { limit } = RATE_LIMIT_POLICIES.CONTACT;

    const admitted = await chargeN(limiter, 'CONTACT', limit);
    const blocked = await limiter.charge(request(), 'CONTACT');

    // A dead Upstash must neither take the route down nor open it up.
    expect(admitted.allowed).toBe(true);
    expect(admitted.headers['X-RateLimit-Backend']).toBe('memory');
    expect(blocked.allowed).toBe(false);
    expect(logError).not.toHaveBeenCalled();
    // Upstash's own message survives into the warning.
    expect(logWarn).toHaveBeenCalledWith(
      'Redis rate limiter unavailable, falling back to in-memory',
      expect.objectContaining({ cause: 'Your database has been temporarily rate-limited.' }),
    );
  });

  it('degrades the same way when building the shared store throws', async () => {
    const limiter = createRateLimit({
      shared: () => {
        throw new TypeError('Invalid URL');
      },
      local: new MemoryStore(),
    });

    const charge = await limiter.charge(request(), 'CHAT');

    expect(charge.allowed).toBe(true);
    expect(charge.headers['X-RateLimit-Backend']).toBe('memory');
  });

  it('stops asking the shared store for a minute after a failure, then retries', async () => {
    const store = failing();
    const limiter = createRateLimit({ shared: () => store, local: new MemoryStore() });

    await chargeN(limiter, 'PUBLIC_READ', 3);

    // One failed round trip and one report for the whole window, not one per
    // request. The per-request report was ~9,000 Sentry events.
    expect(store.hit).toHaveBeenCalledTimes(1);
    expect(logWarn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(SHARED_STORE_RETRY_AFTER_MS + 1);
    await limiter.charge(request(), 'PUBLIC_READ');

    expect(store.hit).toHaveBeenCalledTimes(2);
  });

  it('uses the memory store silently when no shared store is configured', async () => {
    const charge = await memoryOnly().charge(request(), 'CHAT');

    expect(charge.headers['X-RateLimit-Backend']).toBe('memory');
    expect(logWarn).not.toHaveBeenCalled();
  });
});

describe('the 429', () => {
  it('is the standard error envelope with retryAfter, plus the rate-limit headers', async () => {
    const limiter = memoryOnly();
    const { limit, windowMs } = RATE_LIMIT_POLICIES.CONTACT;
    await chargeN(limiter, 'CONTACT', limit);

    const charge = await limiter.charge(request(), 'CONTACT');
    if (charge.allowed) throw new Error('expected the request to be rejected');

    const retryAfter = windowMs / 1000;
    expect(charge.response.status).toBe(429);
    expect(await charge.response.json()).toEqual({
      success: false,
      error: 'Too many requests',
      retryAfter,
    });
    const header = (name: string) => charge.response.headers.get(name);
    expect(header('Retry-After')).toBe(String(retryAfter));
    expect(header('X-RateLimit-Limit')).toBe(String(limit));
    expect(header('X-RateLimit-Remaining')).toBe('0');
    expect(header('X-RateLimit-Reset')).toBe(new Date(Date.now() + windowMs).toISOString());
    expect(header('X-RateLimit-Backend')).toBe('memory');
  });
});

describe('withRateLimit', () => {
  // The production instance: no Upstash credentials in the test env, so it
  // runs on its memory store. Fresh module per test for an empty store.
  const originalEnv = process.env;
  let withRateLimit: typeof import('@/lib/rate-limit').withRateLimit;

  beforeEach(async () => {
    process.env = { ...originalEnv };
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    vi.resetModules();
    ({ withRateLimit } = await import('@/lib/rate-limit'));
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('puts the rate-limit headers on the handler response', async () => {
    const route = withRateLimit(async () => NextResponse.json({ ok: true }), 'PUBLIC_READ');

    const res = await route(request());

    expect(res.status).toBe(200);
    expect(res.headers.get('X-RateLimit-Limit')).toBe('100');
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('99');
  });

  it('never runs the handler once the policy is exhausted', async () => {
    const handler = vi.fn(async () => NextResponse.json({ ok: true }));
    const route = withRateLimit(handler, 'SUMMARIZE');

    for (let i = 0; i < RATE_LIMIT_POLICIES.SUMMARIZE.limit; i += 1) await route(request());
    const res = await route(request());

    expect(res.status).toBe(429);
    expect(handler).toHaveBeenCalledTimes(RATE_LIMIT_POLICIES.SUMMARIZE.limit);
  });

  it('answers a throwing handler with the standard 500, headers included', async () => {
    const route = withRateLimit(async () => {
      throw new Error('boom');
    }, 'CHAT');

    const res = await route(request());

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ success: false, error: 'Internal server error' });
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('2');
    const { logError: log } = await import('@/lib/logger');
    expect(log).toHaveBeenCalledWith(
      'API handler error',
      expect.any(Error),
      expect.objectContaining({ policy: 'CHAT' }),
    );
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
