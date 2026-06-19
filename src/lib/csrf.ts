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

  // Trust only the exact hostnames Vercel injects for THIS deployment — never a
  // name *prefix*. An attacker can register `lscaturchio-<anything>.vercel.app`
  // on Vercel's global project namespace, so the previous `^lscaturchio(?:-|\.)`
  // prefix match accepted attacker-controlled origins (a CSRF bypass).
  // VERCEL_URL is the per-deploy URL, VERCEL_BRANCH_URL the stable branch alias,
  // VERCEL_PROJECT_PRODUCTION_URL the production domain.
  // See: https://vercel.com/docs/projects/environment-variables/system-environment-variables
  const vercelHosts = [
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ];
  for (const host of vercelHosts) {
    if (!host) continue;
    baseOrigins.push(`https://${host}`);
    if (!host.startsWith('www.')) {
      baseOrigins.push(`https://www.${host}`);
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
      // Same allowlist as the Origin check so the two paths can never drift.
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
