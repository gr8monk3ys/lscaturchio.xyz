/**
 * The one API test that runs the REAL write chain.
 *
 * Every other file in this directory replaces `withRateLimit` with
 * `(handler) => handler` and stubs `validateCsrf`, so nothing there can fail
 * when a layer is dropped from a route — and `contact.test.ts` used to
 * reimplement the sanitisers inside its own mock, asserting a copy of the code
 * rather than the code. This file stubs only the two OUTBOUND side effects the
 * routes reach for — the mailer (Resend, via global fetch) and the database
 * (Neon) — and lets everything between the request and those sinks run for
 * real: the in-memory rate limiter, Origin validation, Zod, the sanitisers in
 * `src/lib/sanitize.ts`, and the response envelope.
 *
 * It therefore also pins the LAYER ORDER, which is the property `withWriteRoute`
 * exists to guarantee: rate limit -> auth -> CSRF -> Zod -> handler -> envelope.
 */

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// The ONLY doubles: the outbound sinks.
// ---------------------------------------------------------------------------
const mockSql = vi.fn();

vi.mock('@/lib/db', () => ({
  getDb: () => mockSql,
  isDatabaseConfigured: () => true,
}));

vi.mock('@/lib/email', () => ({
  sendWelcomeEmail: vi.fn(async () => true),
  sendOnboardingEmail: vi.fn(async () => true),
}));

// Resend is reached through global fetch; this is the mailer.
const mailer = vi.fn();
vi.stubGlobal('fetch', mailer);

import { POST as contactPost } from '@/app/api/contact/route';
import { POST as subscribePost } from '@/app/api/newsletter/subscribe/route';
import { POST as dripPost } from '@/app/api/newsletter/drip/route';
import { RATE_LIMITS } from '@/lib/rate-limit';

const GOOD_ORIGIN = 'http://localhost:3000';

/**
 * Each test gets its own client IP so the shared in-memory limiter buckets
 * don't leak between them. `x-real-ip` is one of the two headers
 * `getClientIp` trusts.
 */
let ipCounter = 0;
function freshIp(): string {
  ipCounter += 1;
  return `203.0.113.${ipCounter}`;
}

type ReqOptions = {
  origin?: string | null;
  ip?: string;
  body?: unknown;
  rawBody?: string;
  headers?: Record<string, string>;
};

function makeRequest(url: string, options: ReqOptions = {}): NextRequest {
  const req = new NextRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-real-ip': options.ip ?? freshIp(),
      ...(options.headers ?? {}),
    },
    body: options.rawBody ?? JSON.stringify(options.body ?? {}),
  });

  // `Origin` is a forbidden header name, so the Headers constructor in the
  // test environment drops it silently — which is exactly how every existing
  // test in this directory ended up believing it was sending one. Setting it
  // on the built request lands it for real.
  const origin = options.origin === undefined ? GOOD_ORIGIN : options.origin;
  if (origin !== null) req.headers.set('origin', origin);

  return req;
}

const validContact = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  message: 'Hello there.',
};

beforeAll(() => {
  // Force the documented in-memory path so the limiter under test is the one
  // in this repo, not a network service.
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  process.env.RESEND_API_KEY = 'test_resend_key';
  process.env.CONTACT_EMAIL = 'inbox@example.com';
  process.env.CONTACT_FROM_EMAIL = 'noreply@example.com';
  process.env.NEWSLETTER_ADMIN_API_KEY = 'test-drip-key';
});

beforeEach(() => {
  vi.clearAllMocks();
  mailer.mockResolvedValue({ ok: true, json: async () => ({ id: 'sent' }) });
  mockSql.mockResolvedValue([]);
});

// ---------------------------------------------------------------------------
// CSRF — the real validateCsrf, not a mock that returns null
// ---------------------------------------------------------------------------
describe('CSRF layer (real @/lib/csrf)', () => {
  it('rejects a POST with no Origin and no Referer', async () => {
    const res = await contactPost(
      makeRequest('http://localhost:3000/api/contact', {
        origin: null,
        body: validContact,
      })
    );

    expect(res.status).toBe(403);
    expect((await res.json()).error).toBe('Missing origin header');
    expect(mailer).not.toHaveBeenCalled();
  });

  it('rejects a POST from a foreign Origin', async () => {
    const res = await contactPost(
      makeRequest('http://localhost:3000/api/contact', {
        origin: 'https://lscaturchio-evil.vercel.app',
        body: validContact,
      })
    );

    expect(res.status).toBe(403);
    expect((await res.json()).error).toBe('Invalid origin');
    expect(mailer).not.toHaveBeenCalled();
  });

  it('guards the database route the same way', async () => {
    const res = await subscribePost(
      makeRequest('http://localhost:3000/api/newsletter/subscribe', {
        origin: 'https://evil.example',
        body: { email: 'someone@example.com' },
      })
    );

    expect(res.status).toBe(403);
    expect(mockSql).not.toHaveBeenCalled();
  });

  it('runs BEFORE Zod: a foreign Origin with an invalid body is 403, not 400', async () => {
    const res = await contactPost(
      makeRequest('http://localhost:3000/api/contact', {
        origin: 'https://evil.example',
        body: { name: '', email: 'nope', message: '' },
      })
    );

    expect(res.status).toBe(403);
  });
});

// ---------------------------------------------------------------------------
// Auth — the real validateApiKey, and the one route that declares csrf: skip
// ---------------------------------------------------------------------------
describe('auth layer (real @/lib/api-auth)', () => {
  it('rejects the drip endpoint without an API key, before touching the body', async () => {
    const res = await dripPost(
      makeRequest('http://localhost:3000/api/newsletter/drip', { rawBody: 'not json at all' })
    );

    expect(res.status).toBe(401);
    expect(mockSql).not.toHaveBeenCalled();
  });

  it('honours the declared csrf: skip — an API-key call with no Origin succeeds', async () => {
    const res = await dripPost(
      makeRequest('http://localhost:3000/api/newsletter/drip', {
        origin: null,
        headers: { 'x-api-key': 'test-drip-key' },
      })
    );

    // A missing Origin is a 403 on every other write route; this one is
    // declared `csrf: { kind: "skip" }` because its caller is a cron job.
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      data: { processed: 0, sent: 0, failed: 0, skipped: 0, dryRun: false },
      success: true,
    });
  });
});

// ---------------------------------------------------------------------------
// Zod
// ---------------------------------------------------------------------------
describe('schema layer (real Zod schemas)', () => {
  it('returns 400 with the field error for an invalid email', async () => {
    const res = await contactPost(
      makeRequest('http://localhost:3000/api/contact', {
        body: { ...validContact, email: 'not-an-email' },
      })
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid email format', success: false });
    expect(mailer).not.toHaveBeenCalled();
  });

  it('returns 400 with the field error for an over-long message', async () => {
    const res = await contactPost(
      makeRequest('http://localhost:3000/api/contact', {
        body: { ...validContact, message: 'a'.repeat(5001) },
      })
    );

    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Message is too long (max 5000 characters)');
  });

  it('stops the subscribe route before any SQL runs', async () => {
    const res = await subscribePost(
      makeRequest('http://localhost:3000/api/newsletter/subscribe', {
        body: { email: 'bad@' },
      })
    );

    expect(res.status).toBe(400);
    expect(mockSql).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Sanitisers — the real ones in src/lib/sanitize.ts
// ---------------------------------------------------------------------------
describe('sanitiser layer (real @/lib/sanitize)', () => {
  it('neutralises <script> in the body and CRLF in the subject', async () => {
    const res = await contactPost(
      makeRequest('http://localhost:3000/api/contact', {
        body: {
          name: 'Jane\r\nBcc: attacker@evil.example',
          email: 'jane@example.com',
          message: '<script>alert("xss")</script>\nsecond line',
        },
      })
    );

    expect(res.status).toBe(200);
    expect(mailer).toHaveBeenCalledTimes(1);

    const payload = JSON.parse(mailer.mock.calls[0][1].body);

    // Header injection: no bare CR or LF survives into the subject.
    expect(payload.subject).not.toMatch(/[\r\n]/);
    // Each of CR and LF becomes its own space — this is the real
    // sanitizeEmailSubject's output, not a paraphrase of it.
    expect(payload.subject).toBe('Contact Form: Jane  Bcc: attacker@evil.example');

    // XSS: the script tag is escaped, not stripped-and-forgotten.
    expect(payload.html).not.toContain('<script>');
    expect(payload.html).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    // ...and sanitizeForHtmlEmail still turns real newlines into <br>.
    expect(payload.html).toContain('<br>second line');
  });

  it('escapes an <img onerror> payload in the message', async () => {
    const res = await contactPost(
      makeRequest('http://localhost:3000/api/contact', {
        body: { ...validContact, message: '<img src=x onerror="alert(1)">' },
      })
    );

    expect(res.status).toBe(200);
    const payload = JSON.parse(mailer.mock.calls[0][1].body);
    expect(payload.html).not.toContain('<img');
    expect(payload.html).toContain('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  });
});

// ---------------------------------------------------------------------------
// Rate limit — the real withRateLimit over the real in-memory limiter
// ---------------------------------------------------------------------------
describe('rate-limit layer (real @/lib/with-rate-limit)', () => {
  it('engages after RATE_LIMITS.NEWSLETTER.limit requests from one IP', async () => {
    const ip = freshIp();
    const limit = RATE_LIMITS.NEWSLETTER.limit;

    for (let i = 0; i < limit; i += 1) {
      const ok = await contactPost(
        makeRequest('http://localhost:3000/api/contact', { ip, body: validContact })
      );
      expect(ok.status).toBe(200);
      expect(ok.headers.get('X-RateLimit-Remaining')).toBe(String(limit - i - 1));
    }

    const blocked = await contactPost(
      makeRequest('http://localhost:3000/api/contact', { ip, body: validContact })
    );

    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('Retry-After')).toBeTruthy();
    expect((await blocked.json()).error).toBe('Too many requests');
    // The mailer was reached exactly `limit` times, never on the blocked call.
    expect(mailer).toHaveBeenCalledTimes(limit);
  });

  it('runs FIRST: an exhausted bucket 429s even a request that would fail CSRF', async () => {
    const ip = freshIp();
    for (let i = 0; i < RATE_LIMITS.NEWSLETTER.limit; i += 1) {
      await contactPost(makeRequest('http://localhost:3000/api/contact', { ip, body: validContact }));
    }

    const res = await contactPost(
      makeRequest('http://localhost:3000/api/contact', {
        ip,
        origin: 'https://evil.example',
        body: validContact,
      })
    );

    expect(res.status).toBe(429);
  });
});

// ---------------------------------------------------------------------------
// Envelope
// ---------------------------------------------------------------------------
describe('envelope layer', () => {
  it('wraps a success in { data, success: true }', async () => {
    const res = await subscribePost(
      makeRequest('http://localhost:3000/api/newsletter/subscribe', {
        body: { email: 'new@example.com' },
      })
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      data: { message: 'Thanks! Check your inbox to confirm your subscription.' },
      success: true,
    });
  });

  it('wraps a failure in { error, success: false } on the same route', async () => {
    const res = await subscribePost(
      makeRequest('http://localhost:3000/api/newsletter/subscribe', {
        body: { email: 'nope' },
      })
    );

    expect(await res.json()).toEqual({ error: 'Invalid email format', success: false });
  });
});
