import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, getClientIp, RATE_LIMITS } from './rate-limit';

type RateLimitConfig = {
  limit: number;
  window: number;
};

/**
 * Higher-order function to wrap API routes with rate limiting
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
export function withRateLimit<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  config: RateLimitConfig = RATE_LIMITS.STANDARD
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    // Get client identifier
    const clientIp = getClientIp(request);

    // Check rate limit
    const result = rateLimiter.check(clientIp, config.limit, config.window);

    // Add rate limit headers to all responses
    const headers = rateLimiter.getHeaders(result);

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
