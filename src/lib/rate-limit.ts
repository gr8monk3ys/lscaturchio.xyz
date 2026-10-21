/**
 * Rate limiting. One question: charge this request against policy NAME.
 *
 * ```ts
 * export const GET = withRateLimit(handleGet, "PUBLIC_READ");
 * withWriteRoute({ limit: "CONTACT", ... }, handler);
 * ```
 *
 * Everything else is this module's business, in one place:
 *
 *   - the policy table, `RATE_LIMIT_POLICIES`. A policy is a NAME, not its
 *     numbers: two policies with the same limit and window still count
 *     separately. When identity was the (limit, window) pair, the contact form
 *     shared one 3-per-5-minutes bucket with newsletter subscribe and
 *     unsubscribe, and ffee38e had to repair both stores after PUBLIC reads
 *     drained CHAT's allowance;
 *   - the bucket key, `<POLICY>:<client>`, built once in `charge` and handed to
 *     whichever store answers. No store composes a key;
 *   - client identification (`getClientIp`, this site's header-trust policy);
 *   - backend selection: Upstash when configured, with a circuit breaker that
 *     drops to a per-instance memory store when Upstash fails;
 *   - the `X-RateLimit-*` headers, and the 429, rendered through
 *     `api-response.ts` like every other error this API returns.
 *
 * `@gr8monk3ys/next-kit/rate-limit` supplies the parts that are not this
 * site's: the store port (`RateLimitStore`), the window accounting behind it
 * (`MemoryStore`, and `RedisStore` in `rate-limit-redis.ts`) and IP-string
 * parsing (`normalizeIpCandidate`).
 */

import type { NextRequest, NextResponse } from 'next/server';
import {
  MemoryStore,
  normalizeIpCandidate,
  type RateLimitStore,
  type StoreHit,
} from '@gr8monk3ys/next-kit/rate-limit';
import { ApiErrors } from './api-response';
import { logError, logWarn } from './logger';
import { getUpstashStore } from './rate-limit-redis';

const MINUTE = 60_000;

/**
 * Every policy, named for what it protects. A route picks one by name; routes
 * that name the same policy share its bucket on purpose.
 */
export const RATE_LIMIT_POLICIES = {
  // Model-backed endpoints: each request costs real money.
  /** POST /api/chat */
  CHAT: { limit: 3, windowMs: MINUTE },
  /** POST /api/summarize */
  SUMMARIZE: { limit: 2, windowMs: MINUTE },
  /** GET + POST /api/search — one query embedding per request, either verb. */
  SEARCH: { limit: 5, windowMs: MINUTE },
  /** GET /api/related-posts */
  RELATED_POSTS: { limit: 10, windowMs: MINUTE },

  // Endpoints that send email or store a person's address.
  /** POST /api/contact */
  CONTACT: { limit: 3, windowMs: 5 * MINUTE },
  /** POST /api/newsletter/subscribe */
  NEWSLETTER_SUBSCRIBE: { limit: 3, windowMs: 5 * MINUTE },
  /** POST /api/newsletter/unsubscribe */
  NEWSLETTER_UNSUBSCRIBE: { limit: 3, windowMs: 5 * MINUTE },
  /**
   * POST /api/newsletter/drip. Sends up to a batch of onboarding emails per
   * call; the scheduled caller runs about once an hour, so 30/min is far above
   * any legitimate cadence.
   */
  NEWSLETTER_DRIP: { limit: 30, windowMs: MINUTE },

  // Public writes and expensive reads.
  /** POST /api/views */
  VIEW_COUNT: { limit: 30, windowMs: MINUTE },
  /** POST /api/resume (download telemetry) */
  RESUME_DOWNLOAD: { limit: 30, windowMs: MINUTE },
  /** GET /api/og — renders an image per request. */
  OG_IMAGE: { limit: 30, windowMs: MINUTE },
  /** GET /api/github/contributions — spends GitHub GraphQL quota. */
  GITHUB_CONTRIBUTIONS: { limit: 30, windowMs: MINUTE },

  // Admin portal.
  /** GET /api/admin/auth/login and /callback */
  ADMIN_SIGN_IN: { limit: 10, windowMs: 5 * MINUTE },
  /** Admin content PUTs (posts, photos, now, links) and POST logout. */
  ADMIN_WRITE: { limit: 30, windowMs: MINUTE },
  /** GET /api/analytics — API-key protected, so not a public read. */
  ANALYTICS: { limit: 100, windowMs: MINUTE },

  /**
   * Every cheap public read of site content, sharing one per-client budget on
   * purpose: an essay page fires several of these on load, and the budget is
   * for "reads of this site", not one allowance per endpoint.
   */
  PUBLIC_READ: { limit: 100, windowMs: MINUTE },
} as const satisfies Record<string, { limit: number; windowMs: number }>;

export type RateLimitPolicy = keyof typeof RATE_LIMIT_POLICIES;

export type RateLimitCharge =
  | { allowed: true; headers: Record<string, string> }
  | { allowed: false; headers: Record<string, string>; response: NextResponse };

/**
 * How long to stop asking the shared store after a failure.
 *
 * When Upstash is down — or, as happened for a month in September 2026, over
 * its free-tier quota and answering every command with an error — each
 * request otherwise pays a failed round trip and files its own Sentry event.
 * At 10% sampling that was ~9,000 events for one underlying condition. One
 * report per minute is enough to see the outage; sixty a second is not more
 * information.
 */
export const SHARED_STORE_RETRY_AFTER_MS = MINUTE;

/** The store port: Upstash and memory are the two adapters behind it. */
export type RateLimitStores = {
  /**
   * The cross-instance store, or null when none is configured. May throw,
   * either when built or on `hit`; a throw trips the breaker.
   */
  shared: () => RateLimitStore | null;
  /** Per-instance store, used when `shared` is absent or failing. */
  local: RateLimitStore;
};

/**
 * Build a limiter over a pair of stores. Production uses one instance, wired
 * below; tests build their own over adapters they control.
 */
export function createRateLimit(stores: RateLimitStores) {
  let sharedDownUntil = 0;

  async function hit(
    key: string,
    windowMs: number,
  ): Promise<StoreHit & { backend: 'redis' | 'memory' }> {
    if (Date.now() >= sharedDownUntil) {
      try {
        const shared = stores.shared();
        if (shared) {
          return { ...(await shared.hit(key, windowMs)), backend: 'redis' };
        }
      } catch (error) {
        // A soft dependency: degrade, do not fail the request. The memory
        // store still enforces the same policy per instance, so nothing opens
        // up — which is why this is a warning and not an error.
        sharedDownUntil = Date.now() + SHARED_STORE_RETRY_AFTER_MS;
        logWarn('Redis rate limiter unavailable, falling back to in-memory', {
          component: 'rate-limit',
          action: 'redis',
          retryAfterMs: SHARED_STORE_RETRY_AFTER_MS,
          cause: error instanceof Error ? error.message : String(error),
        });
      }
    }
    return { ...(await stores.local.hit(key, windowMs)), backend: 'memory' };
  }

  return {
    /** Count one request from this client against `policy`. */
    async charge(request: Request, policy: RateLimitPolicy): Promise<RateLimitCharge> {
      const { limit, windowMs } = RATE_LIMIT_POLICIES[policy];
      const { count, resetAt, backend } = await hit(`${policy}:${getClientIp(request)}`, windowMs);

      // `X-RateLimit-Reset` is an ISO timestamp, not the epoch-ms the kit's
      // own `rateLimitHeaders` emits; changing it would change what every API
      // route here already returns.
      const headers: Record<string, string> = {
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(Math.max(0, limit - count)),
        'X-RateLimit-Reset': new Date(resetAt).toISOString(),
        'X-RateLimit-Backend': backend,
      };

      if (count <= limit) {
        return { allowed: true, headers };
      }

      const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
      const response = setHeaders(ApiErrors.tooManyRequests('Too many requests', retryAfter), {
        ...headers,
        'Retry-After': String(retryAfter),
      });
      return { allowed: false, headers, response };
    },
  };
}

function setHeaders(response: NextResponse, headers: Record<string, string>): NextResponse {
  for (const [name, value] of Object.entries(headers)) {
    response.headers.set(name, value);
  }
  return response;
}

const limiter = createRateLimit({ shared: getUpstashStore, local: new MemoryStore() });

/**
 * Wrap a route handler so every request is charged against `policy` first.
 *
 * Over the limit, the handler never runs and the caller gets the standard 429.
 * Otherwise the handler's response carries the rate-limit headers; a handler
 * that throws is logged and answered with the standard 500, headers included.
 */
export function withRateLimit<T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  policy: RateLimitPolicy,
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const charge = await limiter.charge(request, policy);
    if (!charge.allowed) {
      return charge.response;
    }

    let response: NextResponse;
    try {
      response = await handler(request, ...args);
    } catch (error) {
      logError('API handler error', error, {
        component: 'rate-limit',
        action: 'handler',
        policy,
      });
      response = ApiErrors.internalError();
    }
    return setHeaders(response, charge.headers);
  };
}

/**
 * The client a bucket belongs to.
 *
 * This is NOT the kit's `getClientId`. In next-kit v0.1.1 that helper trusted
 * `cf-connecting-ip` unconditionally — fully client-controlled on a Vercel
 * deployment like this one, and a free way to rotate a bucket past the limits
 * protecting the OpenAI-backed endpoints. v0.1.2 (pinned here) fixed that:
 * platform headers are read only when declared, defaulting to `x-real-ip` then
 * the right-most `x-forwarded-for` hop. This function still stays local because
 * it encodes this site's own header order; only the IP *parsing*
 * (`normalizeIpCandidate`) comes from the kit.
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;

  // Trust only headers the hosting platform (Vercel) sets and overwrites on
  // every request, so a client cannot rotate its rate-limit bucket by forging
  // them. We deliberately do NOT trust cf-connecting-ip: this app is not behind
  // Cloudflare, so that header is fully client-controlled here and would let a
  // caller bypass the limits protecting the OpenAI-backed endpoints.
  const trustedIpHeaders = [
    'x-vercel-forwarded-for', // Vercel: real client IP, single value, spoof-resistant
    'x-real-ip',              // Vercel/Nginx: real client IP, single value
  ];

  for (const header of trustedIpHeaders) {
    const value = headers.get(header);
    if (value) {
      const ip = normalizeIpCandidate(value.split(',')[0] ?? value);
      if (ip) {
        return ip;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // EVERYTHING BELOW IS CLIENT-ROTATABLE AND IS NOT A TRUST BOUNDARY.
  //
  // Both remaining fallbacks read values the caller supplies verbatim: the
  // left-most x-forwarded-for entry, and the user-agent/accept-* fingerprint.
  // A caller that varies either one mints a fresh rate-limit bucket per request,
  // so on their own they enforce nothing. They exist only so local `next dev`
  // and any non-Vercel host still bucket requests somehow.
  //
  // They are unreachable in production: Vercel sets x-vercel-forwarded-for and
  // x-real-ip on every request and overwrites any client-supplied copy, so the
  // trusted loop above always returns first. Do not copy this shape into code
  // that runs where those platform headers are absent — there, the right-most
  // x-forwarded-for hop (the one your own edge appended) is the only defensible
  // key, which is what @gr8monk3ys/next-kit's `getClientId` defaults to.
  // ---------------------------------------------------------------------------

  // Left-most x-forwarded-for: the originating client per convention, spoofable.
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ip = normalizeIpCandidate(forwardedFor.split(',')[0] ?? forwardedFor);
    if (ip) {
      return ip;
    }
  }

  // Browser fingerprint as last resort, so each unique client gets its own
  // bucket when no IP header is available at all. Trivially varied by the
  // caller; see the boundary note above.
  const userAgent = headers.get('user-agent') || '';
  const acceptLanguage = headers.get('accept-language') || '';
  const acceptEncoding = headers.get('accept-encoding') || '';

  // Create a simple hash of browser fingerprint
  const fingerprint = `${userAgent}:${acceptLanguage}:${acceptEncoding}`;
  const hash = fingerprint.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0) | 0;
  }, 0);

  return `fingerprint:${Math.abs(hash).toString(36)}`;
}
