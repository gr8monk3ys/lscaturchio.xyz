/**
 * Redis-based rate limiter using Upstash
 *
 * Uses sliding window algorithm for accurate rate limiting
 * that persists across serverless function invocations.
 *
 * Requires environment variables:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Cache rate limiter instances by config
const rateLimiters = new Map<string, Ratelimit>();

/**
 * Get or create a rate limiter instance for the given config
 */
export function getRedisRateLimiter(limit: number, windowMs: number): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  const key = `${limit}:${windowMs}`;

  if (!rateLimiters.has(key)) {
    const redis = new Redis({ url, token });
    const windowSeconds = Math.ceil(windowMs / 1000);

    rateLimiters.set(
      key,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
        analytics: true,
        prefix: 'ratelimit:',
      })
    );
  }

  return rateLimiters.get(key)!;
}

/**
 * Check if Redis rate limiting is available
 */
export function isRedisConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}
