/**
 * CSRF Protection using Origin header validation
 *
 * This approach is recommended for modern browsers and works well with:
 * - Fetch API requests
 * - SPA/React applications
 * - API routes that don't use form submissions
 *
 * How it works:
 * 1. Modern browsers automatically send Origin/Referer headers
 * 2. We validate these match our allowed origins
 * 3. Cross-origin requests without proper headers are rejected
 */

import { NextRequest, NextResponse } from 'next/server';

// Get allowed origins from environment or use defaults
function getAllowedOrigins(): string[] {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const baseOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  if (siteUrl) {
    try {
      const url = new URL(siteUrl);
      baseOrigins.push(url.origin);
      // Also allow www subdomain
      if (!url.hostname.startsWith('www.')) {
        baseOrigins.push(`${url.protocol}//www.${url.hostname}`);
      }
    } catch {
      // Invalid URL, ignore
    }
  }

  // Add production domain if not already included
  if (!baseOrigins.includes('https://lscaturchio.xyz')) {
    baseOrigins.push('https://lscaturchio.xyz');
    baseOrigins.push('https://www.lscaturchio.xyz');
  }

  return baseOrigins;
}

/**
 * Validates that the request is from an allowed origin
 * Returns null if valid, or an error response if invalid
 */
export function validateCsrf(request: NextRequest): NextResponse | null {
  // Skip CSRF check for safe methods
  const method = request.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return null;
  }

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // In development, be more lenient
  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  const allowedOrigins = getAllowedOrigins();

  // Check Origin header first (most reliable)
  if (origin) {
    if (allowedOrigins.includes(origin)) {
      return null;
    }
    return NextResponse.json(
      { error: 'Invalid origin' },
      { status: 403 }
    );
  }

  // Fall back to Referer header
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (allowedOrigins.includes(refererUrl.origin)) {
        return null;
      }
    } catch {
      // Invalid referer URL
    }
    return NextResponse.json(
      { error: 'Invalid referer' },
      { status: 403 }
    );
  }

  // No origin or referer - could be:
  // 1. Same-origin request (browser doesn't send for same-origin)
  // 2. Request from a tool like curl (allowed for API flexibility)
  // 3. Malicious request without headers
  //
  // For public APIs, we allow requests without origin/referer
  // For sensitive operations, consider requiring authentication instead
  return null;
}

/**
 * Higher-order function to wrap API routes with CSRF protection
 *
 * Usage:
 * ```ts
 * const handler = async (request: NextRequest) => {
 *   // Your handler code
 * };
 *
 * export const POST = withCsrf(handler);
 * ```
 */
export function withCsrf<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const csrfError = validateCsrf(request);
    if (csrfError) {
      return csrfError;
    }
    return handler(request, ...args);
  };
}
