/**
 * The one API test that runs the REAL write chain.
 *
 * Every other file in this directory replaces `withRateLimit` with
 * `(handler) => handler` and stubs `validateCsrf`, so nothing there can fail
 * when a layer is dropped from a route — and `contact.test.ts` used to
 * reimplement the sanitisers inside its own mock, asserting a copy of the code
 * rather than the code. This file stubs only the two OUTBOUND side effects the
 * routes reach for — the mailer (the in-memory outbox transport in place of
 * Resend) and the database (Neon) — and lets everything between the request
 * and those sinks run for real: the in-memory rate limiter, Origin validation,
 * the spam checks, Zod, the sanitisers in `src/lib/sanitize.ts`, the mail
 * templates and delivery module, and the response envelope.
 *
 * It therefore also pins the LAYER ORDER, which is the property `withWriteRoute`
 * exists to guarantee: rate limit -> auth -> CSRF -> Zod -> handler -> envelope.
 *
 * The last section is the browser's side of the same contract: `submitWrite`
 * (src/lib/fetcher.ts), the decoder every form posts through, fed these real
 * responses rather than hand-written fixtures. A fixture is how the contact
 * form's 429 test came to mock a `{}` body the server never sends.
 */

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// The ONLY doubles: the outbound sinks.
// ---------------------------------------------------------------------------
const mockSql = vi.fn();

vi.mock('@/lib/db', () => ({
  getDb: () => mockSql,
  isDatabaseConfigured: () => true,
}));

import { POST as contactPost } from '@/app/api/contact/route';
import { POST as subscribePost } from '@/app/api/newsletter/subscribe/route';
import { POST as dripPost } from '@/app/api/newsletter/drip/route';
import { RATE_LIMIT_POLICIES } from '@/lib/rate-limit';
import { installMailTransport } from '@/lib/mail/deliver';
import { createOutbox } from '@/lib/mail/outbox';
import { submitWrite } from '@/lib/fetcher';

// The mailer. Every route that sends mail goes through deliverMail, so this
// one transport catches all of it.
const outbox = createOutbox();
let restoreTransport: () => void;
afterAll(() => restoreTransport());

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
  subject: 'Project scoping',
  message: 'Hello there.',
  // What the real form sends: an empty honeypot and the time the form was
  // open (src/lib/contact-spam.ts).
  contact_ref: '',
  elapsedMs: 30_000,
};

beforeAll(() => {
  // Force the documented in-memory path so the limiter under test is the one
  // in this repo, not a network service.
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  restoreTransport = installMailTransport(outbox);
  process.env.CONTACT_EMAIL = 'inbox@example.com';
  process.env.CONTACT_FROM_EMAIL = 'noreply@example.com';
  process.env.NEWSLETTER_ADMIN_API_KEY = 'test-drip-key';
});

beforeEach(() => {
  vi.clearAllMocks();
  outbox.clear();
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
    // The standard envelope. CSRF used to answer a bare `{ error }`, the one
    // write-route failure without `success: false`.
    expect(await res.json()).toEqual({ success: false, error: 'Missing origin header' });
    expect(outbox.sent).toHaveLength(0);
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
    expect(outbox.sent).toHaveLength(0);
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
    expect(await res.json()).toEqual({
      success: false,
      error: 'Unauthorized - valid API key required',
    });
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
    // `field` travels with the message so the form can render it beside the
    // input it is about rather than as a banner under the submit button.
    expect(await res.json()).toEqual({
      error: 'Invalid email format',
      field: 'email',
      success: false,
    });
    expect(outbox.sent).toHaveLength(0);
  });

  it('returns 400, not a logged 500, for a body that is not JSON', async () => {
    const res = await contactPost(
      makeRequest('http://localhost:3000/api/contact', { rawBody: '{' })
    );

    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Request body must be valid JSON');
    expect(outbox.sent).toHaveLength(0);
  });

  it('returns 400 for a field that is only whitespace', async () => {
    const res = await contactPost(
      makeRequest('http://localhost:3000/api/contact', {
        body: { ...validContact, message: '   \n  ' },
      })
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: 'Message is required', field: 'message' });
    expect(outbox.sent).toHaveLength(0);
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
          ...validContact,
          // The subject is reader-controlled and now leads the header line, so
          // this is where a header-injection attempt would go.
          subject: 'Audit\r\nBcc: attacker@evil.example',
          message: '<script>alert("xss")</script>\nsecond line',
        },
      })
    );

    expect(res.status).toBe(200);
    expect(outbox.sent).toHaveLength(1);

    const payload = outbox.sent[0];

    // Header injection: no bare CR or LF survives into the subject.
    expect(payload.subject).not.toMatch(/[\r\n]/);
    // Each of CR and LF becomes its own space — this is the real
    // sanitizeEmailSubject's output, not a paraphrase of it.
    expect(payload.subject).toBe('Audit  Bcc: attacker@evil.example — Jane Doe');

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
    const payload = outbox.sent[0];
    expect(payload.html).not.toContain('<img');
    expect(payload.html).toContain('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  });
});

// ---------------------------------------------------------------------------
// Mail — the real spam checks, templates and deliverMail; the outbox at the end
// ---------------------------------------------------------------------------
describe('mail delivery (real @/lib/mail)', () => {
  it('delivers a contact message to the inbox, replying to the sender', async () => {
    const res = await contactPost(
      makeRequest('http://localhost:3000/api/contact', { body: validContact })
    );

    expect(res.status).toBe(200);
    expect(outbox.sent).toEqual([
      expect.objectContaining({
        from: 'noreply@example.com',
        to: 'inbox@example.com',
        replyTo: 'jane@example.com',
        subject: 'Project scoping — Jane Doe',
      }),
    ]);
  });

  it('leaves the outbox empty for a submission the spam checks drop', async () => {
    const res = await contactPost(
      makeRequest('http://localhost:3000/api/contact', {
        body: { ...validContact, contact_ref: 'https://spam.example' },
      })
    );

    // Answered exactly like a real send.
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(outbox.sent).toHaveLength(0);
  });

  it('queues a welcome email for a new subscriber', async () => {
    const res = await subscribePost(
      makeRequest('http://localhost:3000/api/newsletter/subscribe', {
        body: { email: 'reader@example.com' },
      })
    );

    expect(res.status).toBe(200);
    await vi.waitFor(() => expect(outbox.sent).toHaveLength(1));
    expect(outbox.sent[0]).toMatchObject({
      from: 'newsletter@lscaturchio.xyz',
      to: 'reader@example.com',
      subject: "Welcome to Lorenzo's Newsletter!",
    });
  });
});

// ---------------------------------------------------------------------------
// Rate limit — the real withRateLimit over the real in-memory store
// ---------------------------------------------------------------------------
describe('rate-limit layer (real @/lib/rate-limit)', () => {
  it('engages after the CONTACT policy limit from one IP', async () => {
    const ip = freshIp();
    const { limit } = RATE_LIMIT_POLICIES.CONTACT;

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
    // The standard error envelope, like every other failure on this route.
    expect(await blocked.json()).toEqual({
      success: false,
      error: 'Too many requests',
      retryAfter: expect.any(Number),
    });
    // The mailer was reached exactly `limit` times, never on the blocked call.
    expect(outbox.sent).toHaveLength(limit);
  });

  it('does not spend the newsletter signup allowance on contact messages', async () => {
    // Both policies are 3 per 5 minutes. They used to be one bucket.
    const ip = freshIp();
    for (let i = 0; i <= RATE_LIMIT_POLICIES.CONTACT.limit; i += 1) {
      await contactPost(makeRequest('http://localhost:3000/api/contact', { ip, body: validContact }));
    }

    const res = await subscribePost(
      makeRequest('http://localhost:3000/api/newsletter/subscribe', {
        ip,
        body: { email: 'reader@example.com' },
      })
    );

    expect(res.status).toBe(200);
  });

  it('runs FIRST: an exhausted bucket 429s even a request that would fail CSRF', async () => {
    const ip = freshIp();
    for (let i = 0; i < RATE_LIMIT_POLICIES.CONTACT.limit; i += 1) {
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

    // `field` travels with the message so the form can render it beside the
    // input it is about rather than as a banner under the submit button.
    expect(await res.json()).toEqual({
      error: 'Invalid email format',
      field: 'email',
      success: false,
    });
  });
});

// ---------------------------------------------------------------------------
// The browser's decoder, over the real chain
// ---------------------------------------------------------------------------
describe('submitWrite: every layer decodes to its own kind (real routes)', () => {
  const ROUTES: Record<string, (req: NextRequest) => Promise<Response>> = {
    '/api/contact': contactPost,
    '/api/newsletter/subscribe': subscribePost,
    '/api/newsletter/drip': dripPost,
  };

  /**
   * `fetch` as a browser on `origin` would make it: the request submitWrite
   * builds, handed to the real route handler. The browser, not the page,
   * attaches Origin, which is why it is a parameter here.
   */
  function browser(options: Pick<ReqOptions, 'origin' | 'ip'> = {}): void {
    vi.stubGlobal('fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
      const path = String(input);
      const route = ROUTES[path];
      if (!route) throw new Error(`no route stubbed for ${path}`);
      return route(
        makeRequest(`http://localhost:3000${path}`, {
          ...options,
          rawBody: String(init?.body),
          headers: init?.headers as Record<string, string>,
        })
      );
    });
  }

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('a success is ok, with the envelope unwrapped', async () => {
    browser();
    expect(
      await submitWrite('/api/newsletter/subscribe', { email: 'reader@example.com' })
    ).toEqual({
      kind: 'ok',
      data: { message: 'Thanks! Check your inbox to confirm your subscription.' },
    });
  });

  it("a CSRF 403 is refused, with the layer's reason", async () => {
    browser({ origin: 'https://evil.example' });
    expect(await submitWrite('/api/contact', validContact)).toEqual({
      kind: 'refused',
      status: 403,
      message: 'Invalid origin',
    });
  });

  it('an API-key 401 is refused', async () => {
    browser();
    expect(await submitWrite('/api/newsletter/drip', {})).toEqual({
      kind: 'refused',
      status: 401,
      message: 'Unauthorized - valid API key required',
    });
  });

  it('a Zod 400 is invalid-field, naming the field', async () => {
    browser();
    expect(await submitWrite('/api/contact', { ...validContact, email: 'not-an-email' })).toEqual({
      kind: 'invalid-field',
      field: 'email',
      message: 'Invalid email format',
    });
  });

  it('a 429 is rate-limited, with the wait in seconds', async () => {
    const ip = freshIp();
    browser({ ip });
    for (let i = 0; i < RATE_LIMIT_POLICIES.CONTACT.limit; i += 1) {
      expect((await submitWrite('/api/contact', validContact)).kind).toBe('ok');
    }

    const result = await submitWrite('/api/contact', validContact);

    expect(result).toEqual({
      kind: 'rate-limited',
      retryAfter: expect.any(Number),
      message: 'Too many requests',
    });
    const windowSeconds = RATE_LIMIT_POLICIES.CONTACT.windowMs / 1000;
    expect(result.kind === 'rate-limited' && result.retryAfter).toBeGreaterThan(0);
    expect(result.kind === 'rate-limited' && result.retryAfter).toBeLessThanOrEqual(windowSeconds);
  });

  it("a handler writeError.internal is server-error, with the handler's sentence", async () => {
    browser();
    outbox.respondWith({ status: 'failed', reason: 'provider outage' });
    expect(await submitWrite('/api/contact', validContact)).toEqual({
      kind: 'server-error',
      status: 500,
      message: 'Failed to send message. Please try again later.',
    });
  });

  it('a 5xx that is not JSON is still server-error, not a network failure', async () => {
    // What a gateway answers when the function behind it dies: HTML, no envelope.
    vi.stubGlobal(
      'fetch',
      async () =>
        new Response('<html><body>502 Bad Gateway</body></html>', {
          status: 502,
          headers: { 'content-type': 'text/html' },
        })
    );
    expect(await submitWrite('/api/contact', validContact)).toEqual({
      kind: 'server-error',
      status: 502,
      message: null,
    });
  });

  it('a platform 429 with no envelope still reads the Retry-After header', async () => {
    vi.stubGlobal(
      'fetch',
      async () =>
        new Response('Too Many Requests', { status: 429, headers: { 'retry-after': '42' } })
    );
    expect(await submitWrite('/api/contact', validContact)).toEqual({
      kind: 'rate-limited',
      retryAfter: 42,
      message: null,
    });
  });

  it('a request that cannot leave is network/unreachable', async () => {
    vi.stubGlobal('fetch', async () => {
      throw new TypeError('Failed to fetch');
    });
    expect(await submitWrite('/api/contact', validContact)).toEqual({
      kind: 'network',
      cause: 'unreachable',
    });
  });

  it('a send that never answers is network/timeout after 20s', async () => {
    // BotID's fetch wrapper can wait on its challenge forever, before the
    // request exists for an AbortSignal to cancel.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    vi.stubGlobal('fetch', () => new Promise<Response>(() => {}));

    let settled: unknown = 'pending';
    void submitWrite('/api/contact', validContact).then((result) => {
      settled = result;
    });

    await vi.advanceTimersByTimeAsync(19_999);
    expect(settled).toBe('pending');
    await vi.advanceTimersByTimeAsync(1);
    expect(settled).toEqual({ kind: 'network', cause: 'timeout' });
  });

  it('timeoutMs: null waits for as long as the server takes', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    let answer!: (response: Response) => void;
    vi.stubGlobal('fetch', () => new Promise<Response>((resolve) => (answer = resolve)));

    const pending = submitWrite('/api/chat', {}, { timeoutMs: null });
    await vi.advanceTimersByTimeAsync(120_000);
    answer(new Response(JSON.stringify({ data: { answer: 'late' }, success: true }), { status: 200 }));

    expect(await pending).toEqual({ kind: 'ok', data: { answer: 'late' } });
  });
});
