/**
 * Simple in-memory rate limiter for API routes
 *
 * IMPORTANT: This uses in-memory storage, so it will reset when the server restarts.
 * For production at scale, consider upgrading to Redis (@upstash/ratelimit).
 *
 * However, this is sufficient for:
 * - Preventing basic abuse
 * - Protecting against accidental infinite loops
 * - Limiting expensive API calls (OpenAI)
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    Array.from(this.requests.entries()).forEach(([key, entry]) => {
      if (entry.resetTime < now) {
        this.requests.delete(key);
      }
    });
  }

  /**
   * Check if a request should be rate limited
   * @param identifier - Unique identifier (usually IP address)
   * @param limit - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns { success: boolean, limit: number, remaining: number, reset: number }
   */
  check(
    identifier: string,
    limit: number = 10,
    windowMs: number = 60000 // 1 minute default
  ): {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  } {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    // No previous requests or window expired
    if (!entry || entry.resetTime < now) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: now + windowMs,
      };
    }

    // Within the time window
    if (entry.count < limit) {
      entry.count++;
      return {
        success: true,
        limit,
        remaining: limit - entry.count,
        reset: entry.resetTime,
      };
    }

    // Rate limit exceeded
    return {
      success: false,
      limit,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  /**
   * Get rate limit headers for response
   */
  getHeaders(result: ReturnType<typeof this.check>): Record<string, string> {
    return {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.reset).toISOString(),
    };
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

export { rateLimiter };

/**
 * Rate limit presets for different API endpoints
 */
export const RATE_LIMITS = {
  // Expensive OpenAI operations
  AI_HEAVY: { limit: 5, window: 60000 }, // 5 requests per minute

  // Standard API operations
  STANDARD: { limit: 30, window: 60000 }, // 30 requests per minute

  // Public read-only endpoints
  PUBLIC: { limit: 100, window: 60000 }, // 100 requests per minute

  // Newsletter operations (prevent spam)
  NEWSLETTER: { limit: 3, window: 300000 }, // 3 requests per 5 minutes
} as const;

/**
 * Helper to get client IP from Next.js request
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;

  // Try various headers that might contain the real IP
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to 'unknown' if we can't determine IP
  // In production with proper infrastructure, this shouldn't happen
  return 'unknown';
}
