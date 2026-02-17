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
  const vercelUrl = process.env.VERCEL_URL;
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

  // Allow the active Vercel deployment URL (preview + production *.vercel.app)
  // See: https://vercel.com/docs/projects/environment-variables/system-environment-variables
  if (vercelUrl) {
    baseOrigins.push(`https://${vercelUrl}`);
    if (!vercelUrl.startsWith('www.')) {
      baseOrigins.push(`https://www.${vercelUrl}`);
    }
  }

  // Add production domain if not already included — use URL parsing for safe comparison
  const productionOrigin = new URL('https://lscaturchio.xyz').origin;
  const productionWwwOrigin = new URL('https://www.lscaturchio.xyz').origin;
  if (!baseOrigins.includes(productionOrigin)) {
    baseOrigins.push(productionOrigin);
    baseOrigins.push(productionWwwOrigin);
  }

  return baseOrigins;
}

function isAllowedVercelAppOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    // Ensure the hostname ends with .vercel.app and contains 'lscaturchio' as a
    // distinct segment (not as a substring of another word).
    // Valid: lscaturchio-abc123.vercel.app, lscaturchio.vercel.app
    // Invalid: lscaturchio.evil.vercel.app (would need further checks)
    return url.protocol === 'https:' &&
           url.hostname.endsWith('.vercel.app') &&
           /(?:^|-)lscaturchio(?:-|\.)/i.test(url.hostname);
  } catch {
    return false;
  }
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
    // Vercel deployments can be accessed via multiple *.vercel.app hostnames,
    // which may not match the single VERCEL_URL env var.
    if (isAllowedVercelAppOrigin(origin)) {
      return null;
    }
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
      if (refererUrl.protocol === 'https:' &&
          refererUrl.hostname.endsWith('.vercel.app') &&
          /(?:^|-)lscaturchio(?:-|\.)/i.test(refererUrl.hostname)) {
        return null;
      }
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

  // No origin or referer - reject the request.
  // Modern browsers always send Origin on cross-origin and same-origin POST/DELETE.
  // Allowing requests without both headers is a CSRF bypass vector.
  return NextResponse.json(
    { error: 'Missing origin header' },
    { status: 403 }
  );
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
export function withCsrf<T extends unknown[]>(
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
