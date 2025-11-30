/**
 * Redis-based rate limiter using Upstash
 *
 * Uses Upstash Redis for distributed rate limiting across serverless functions.
 * Falls back to in-memory rate limiting if Upstash is not configured.
 *
 * Setup:
 * 1. Create a free account at https://upstash.com
 * 2. Create a Redis database
 * 3. Add to .env.local:
 *    UPSTASH_REDIS_REST_URL=your-redis-url
 *    UPSTASH_REDIS_REST_TOKEN=your-redis-token
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { rateLimiter, RATE_LIMITS, getClientIp } from './rate-limit';

// Check if Upstash is configured
const isUpstashConfigured =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// Create Redis client if configured
const redis = isUpstashConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Create rate limiters for different use cases
const createUpstashLimiter = (limit: number, window: string) => {
  if (!redis) return null;

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
    analytics: true,
    prefix: 'lscaturchio',
  });
};

// Pre-configured rate limiters
const upstashLimiters = {
  aiHeavy: createUpstashLimiter(RATE_LIMITS.AI_HEAVY.limit, '1 m'),
  standard: createUpstashLimiter(RATE_LIMITS.STANDARD.limit, '1 m'),
  public: createUpstashLimiter(RATE_LIMITS.PUBLIC.limit, '1 m'),
  newsletter: createUpstashLimiter(RATE_LIMITS.NEWSLETTER.limit, '5 m'),
};

type RateLimitType = keyof typeof upstashLimiters;

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check rate limit using Upstash Redis or fallback to in-memory
 */
export async function checkRateLimit(
  request: Request,
  type: RateLimitType = 'standard'
): Promise<RateLimitResult> {
  const ip = getClientIp(request);
  const preset = RATE_LIMITS[type.toUpperCase() as keyof typeof RATE_LIMITS] || RATE_LIMITS.STANDARD;

  // Try Upstash first
  const upstashLimiter = upstashLimiters[type];
  if (upstashLimiter) {
    const result = await upstashLimiter.limit(ip);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  }

  // Fallback to in-memory
  return rateLimiter.check(ip, preset.limit, preset.window);
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  };
}

/**
 * Helper to create rate-limited response
 */
export function rateLimitedResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...getRateLimitHeaders(result),
        'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
      },
    }
  );
}

// Export for checking if Redis is being used
export const isUsingRedis = isUpstashConfigured;
