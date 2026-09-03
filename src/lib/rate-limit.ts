/**
 * Rate limiting: presets, client identification, in-memory limiter.
 *
 * Thin app-specific layer over `@gr8monk3ys/next-kit/rate-limit`. The kit owns
 * the window accounting (`MemoryStore`) and the IP-string parsing
 * (`normalizeIpCandidate`). This module keeps the two things that are this
 * site's own:
 *
 *   - the per-endpoint presets in `RATE_LIMITS`, and
 *   - the header-trust policy in `getClientIp`, which is deliberately narrower
 *     than the kit's `getClientId` — see the comment there.
 *
 * `rateLimiter.check` stays synchronous: `withRateLimit` calls it that way and
 * `MemoryStore.hit` is synchronous, so nothing needs to be awaited.
 */

import {
  MemoryStore,
  normalizeIpCandidate,
} from '@gr8monk3ys/next-kit/rate-limit';

export interface MemoryRateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  /** Unix-ms timestamp at which the current window expires. */
  reset: number;
}

/**
 * Process-local counters. Replaces the hand-rolled `Map` + `setInterval`
 * sweeper: `MemoryStore` drops expired keys opportunistically on write, so
 * there is no timer to keep alive and nothing to `destroy()`.
 *
 * IMPORTANT: this is in-memory, so it resets when the server restarts and does
 * not coordinate across serverless instances. `withRateLimit` prefers the
 * Redis-backed limiter when Upstash is configured and only falls back here.
 */
const store = new MemoryStore();

export const rateLimiter = {
  /**
   * Check whether a request should be rate limited.
   *
   * Buckets are keyed by identifier alone — not by (identifier, limit, window) —
   * so one client shares a single window across every endpoint, exactly as the
   * previous implementation did. The first request in a window is the one that
   * fixes the window's length.
   *
   * @param identifier - Unique identifier (usually IP address)
   * @param limit - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   */
  check(
    identifier: string,
    limit: number = 10,
    windowMs: number = 60000 // 1 minute default
  ): MemoryRateLimitResult {
    const { count, resetAt } = store.hit(identifier, windowMs);

    return {
      success: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      reset: resetAt,
    };
  },

  /**
   * Get rate limit headers for response.
   *
   * `X-RateLimit-Reset` is an ISO timestamp here, not the epoch-ms the kit's
   * own `rateLimitHeaders` emits. Changing it would change what every API route
   * on this site already returns to clients, so the format stays ours.
   */
  getHeaders(result: MemoryRateLimitResult): Record<string, string> {
    return {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.reset).toISOString(),
    };
  },
};

/**
 * Rate limit presets for different API endpoints
 */
export const RATE_LIMITS = {
  // Expensive OpenAI operations
  AI_HEAVY: { limit: 5, window: 60000 }, // 5 requests per minute
  CHAT: { limit: 3, window: 60000 }, // 3 requests per minute
  SUMMARIZE: { limit: 2, window: 60000 }, // 2 requests per minute
  RELATED_POSTS: { limit: 10, window: 60000 }, // 10 requests per minute

  // Standard API operations
  STANDARD: { limit: 30, window: 60000 }, // 30 requests per minute

  // Public read-only endpoints
  PUBLIC: { limit: 100, window: 60000 }, // 100 requests per minute

  // Newsletter operations (prevent spam)
  NEWSLETTER: { limit: 3, window: 300000 }, // 3 requests per 5 minutes

  // Admin portal sign-in (login redirect + OAuth callback)
  ADMIN_AUTH: { limit: 10, window: 300000 }, // 10 requests per 5 minutes
} as const;

/**
 * Helper to get client IP from Next.js request
 * Checks multiple headers from various CDN/proxy providers
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
