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

function isValidIpv4(value: string): boolean {
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(value)) {
    return false;
  }

  return value.split('.').every((segment) => {
    const num = Number(segment);
    return num >= 0 && num <= 255;
  });
}

function isValidIpv6(value: string): boolean {
  return /^[a-f0-9:]+$/i.test(value) && value.includes(':');
}

function normalizeIpCandidate(value: string): string | null {
  let candidate = value.trim();
  if (!candidate) return null;

  if (candidate.toLowerCase().startsWith('for=')) {
    candidate = candidate.slice(4).trim();
  }

  candidate = candidate.replace(/^"|"$/g, '');

  if (candidate.startsWith('[') && candidate.includes(']')) {
    candidate = candidate.slice(1, candidate.indexOf(']'));
  } else if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(candidate)) {
    candidate = candidate.replace(/:\d+$/, '');
  }

  if (isValidIpv4(candidate) || isValidIpv6(candidate)) {
    return candidate;
  }

  return null;
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
  CHAT: { limit: 3, window: 60000 }, // 3 requests per minute
  SUMMARIZE: { limit: 2, window: 60000 }, // 2 requests per minute
  RELATED_POSTS: { limit: 10, window: 60000 }, // 10 requests per minute

  // Standard API operations
  STANDARD: { limit: 30, window: 60000 }, // 30 requests per minute

  // Public read-only endpoints
  PUBLIC: { limit: 100, window: 60000 }, // 100 requests per minute

  // Newsletter operations (prevent spam)
  NEWSLETTER: { limit: 3, window: 300000 }, // 3 requests per 5 minutes
} as const;

/**
 * Helper to get client IP from Next.js request
 * Checks multiple headers from various CDN/proxy providers
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;

  // Trust only platform/proxy headers that are commonly overwritten by the edge.
  // Do not use generic client-supplied headers like x-client-ip, which let
  // callers rotate the rate-limit key trivially.
  const ipHeaders = [
    'cf-connecting-ip',      // Cloudflare
    'x-real-ip',             // Nginx, Vercel
    'x-forwarded-for',       // Standard proxy header
  ];

  for (const header of ipHeaders) {
    const value = headers.get(header);
    if (value) {
      const ip = normalizeIpCandidate(value.split(',')[0] ?? value);
      if (ip) {
        return ip;
      }
    }
  }

  // Generate a fingerprint as last resort
  // This ensures each unique client gets their own bucket
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
