/**
 * Redis-backed rate limiter using Upstash
 *
 * The counters live in `@gr8monk3ys/next-kit/rate-limit`'s `RedisStore`
 * (INCR + PEXPIRE); this module owns only the credential lookup and the
 * per-config limiter cache.
 *
 * Requires environment variables:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */

import {
  createRateLimiter,
  RedisStore,
  type RateLimiter,
} from '@gr8monk3ys/next-kit/rate-limit';
import { Redis } from '@upstash/redis';

/**
 * Key prefix, deliberately versioned.
 *
 * The previous implementation (`@upstash/ratelimit`'s sliding window) wrote
 * `ratelimit::<identifier>:<window-index>` — it joins its own prefix with `:`
 * and appends the window index — while this store writes
 * `ratelimit:v2:<identifier>`. Those never collide, so no key is read back
 * under a type it was not written with. `v2` makes the generation change
 * legible in Redis and keeps a future prefix edit from landing on a namespace
 * that is still live; the stale keys expire on their own TTLs.
 */
const KEY_PREFIX = 'ratelimit:v2:';

// Cache rate limiter instances by config
const rateLimiters = new Map<string, RateLimiter>();

// One Redis connection for the process, shared by every limiter.
let store: RedisStore | null = null;

/**
 * Get or create a rate limiter instance for the given config.
 *
 * Returns null when Upstash is not configured, which is the caller's signal to
 * fall back to the in-memory limiter.
 */
export function getRedisRateLimiter(limit: number, windowMs: number): RateLimiter | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return null;
  }

  if (!store) {
    store = new RedisStore(new Redis({ url, token }), {
      prefix: KEY_PREFIX,
      // Throw rather than silently admitting the request, so withRateLimit can
      // catch it and degrade to the in-memory limiter — which still enforces
      // the configured limits per instance instead of failing fully open.
      onError: 'closed',
    });
  }

  const key = `${limit}:${windowMs}`;

  if (!rateLimiters.has(key)) {
    rateLimiters.set(
      key,
      createRateLimiter({
        store,
        limit,
        windowMs,
      })
    );
  }

  return rateLimiters.get(key)!;
}
