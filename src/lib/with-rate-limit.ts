import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, getClientIp, RATE_LIMITS } from './rate-limit';
import { getRedisRateLimiter } from './rate-limit-redis';
import { logError } from './logger';

// Re-export RATE_LIMITS for convenient single-import usage
export { RATE_LIMITS };

type RateLimitConfig = {
  limit: number;
  window: number;
};

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

/**
 * Attempt a Redis-backed rate limit check.
 *
 * Rate limiting is a soft dependency: if Upstash is unreachable, misconfigured,
 * or its credentials have been rotated, the correct behaviour is to degrade to
 * the in-memory limiter — not to fail the request. Returning null signals the
 * caller to fall back. Both the construction and the call are guarded, since
 * an invalid URL throws synchronously inside the Redis client constructor.
 */
async function tryRedisRateLimit(
  clientIp: string,
  config: RateLimitConfig
): Promise<RateLimitResult | null> {
  try {
    const redisLimiter = getRedisRateLimiter(config.limit, config.window);
    if (!redisLimiter) {
      return null;
    }

    const redisResult = await redisLimiter.check(clientIp);
    return {
      success: redisResult.ok,
      limit: redisResult.limit,
      remaining: redisResult.remaining,
      reset: redisResult.resetAt,
    };
  } catch (error) {
    logError('Redis rate limiter unavailable, falling back to in-memory', error, {
      component: 'withRateLimit',
      action: 'redis',
    });
    return null;
  }
}

/**
 * Higher-order function to wrap API routes with rate limiting
 *
 * Uses Redis (Upstash) when configured, falls back to in-memory otherwise.
 *
 * Usage:
 * ```ts
 * export const POST = withRateLimit(
 *   async (request: NextRequest) => {
 *     // Your handler code
 *   },
 *   RATE_LIMITS.AI_HEAVY
 * );
 * ```
 */
export function withRateLimit<T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  config: RateLimitConfig = RATE_LIMITS.STANDARD
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    // Get client identifier
    const clientIp = getClientIp(request);

    // Try Redis first (persistent across deploys), fall back to in-memory
    const redisResult = await tryRedisRateLimit(clientIp, config);

    let result: RateLimitResult;
    let headers: Record<string, string>;

    if (redisResult) {
      result = redisResult;
      headers = {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.reset).toISOString(),
        'X-RateLimit-Backend': 'redis',
      };
    } else {
      result = rateLimiter.check(clientIp, config.limit, config.window);
      headers = {
        ...rateLimiter.getHeaders(result),
        'X-RateLimit-Backend': 'memory',
      };
    }

    // If rate limited, return 429
    if (!result.success) {
      const resetDate = new Date(result.reset);
      const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);

      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again after ${resetDate.toISOString()}`,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            ...headers,
            'Retry-After': retryAfter.toString(),
          },
        }
      );
    }

    // Execute the actual handler
    try {
      const response = await handler(request, ...args);

      // Add rate limit headers to successful response
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      logError('API handler error', error, {
        component: 'withRateLimit',
        action: 'handler',
      });
      // Even on error, include rate limit headers
      return NextResponse.json(
        { error: 'Internal server error' },
        {
          status: 500,
          headers,
        }
      );
    }
  };
}
