/**
 * API Authentication Utilities
 *
 * Provides secure, timing-safe authentication helpers for API routes.
 */

import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { logError } from './logger';

/**
 * Timing-safe string comparison to prevent timing attacks
 *
 * Uses crypto.timingSafeEqual for constant-time comparison,
 * preventing attackers from deducing key validity based on response time.
 */
export function safeCompare(a: string | null, b: string): boolean {
  if (!a) return false;
  try {
    const encoder = new TextEncoder();
    const bufA = encoder.encode(a);
    const bufB = encoder.encode(b);
    // Ensure constant-time comparison even with different lengths
    if (bufA.length !== bufB.length) {
      crypto.timingSafeEqual(bufA, bufA); // Constant time operation
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Options for API key validation
 */
export interface ValidateApiKeyOptions {
  /** Environment variable name for the API key (default: ANALYTICS_API_KEY) */
  envKey?: string;
  /** Component name for logging (default: 'api') */
  component?: string;
  /** Action name for logging (default: 'validateApiKey') */
  action?: string;
}

/**
 * Validate API key from request headers
 *
 * Returns null if authentication succeeds, or a NextResponse error if it fails.
 * In development mode, allows access without a key if the env var is not configured.
 *
 * @example
 * ```ts
 * const authError = validateApiKey(request);
 * if (authError) return authError;
 * // Proceed with authenticated handler
 * ```
 *
 * @example
 * ```ts
 * // Use custom env var
 * const authError = validateApiKey(request, { envKey: 'ADMIN_API_KEY' });
 * ```
 */
export function validateApiKey(
  request: NextRequest,
  options: ValidateApiKeyOptions = {}
): NextResponse | null {
  const {
    envKey = 'ANALYTICS_API_KEY',
    component = 'api',
    action = 'validateApiKey',
  } = options;

  const apiKey = process.env[envKey];

  // In production, require API key for security
  if (!apiKey) {
    if (process.env.NODE_ENV === 'production') {
      logError(`${envKey} not configured in production`, null, {
        component,
        action,
      });
      return NextResponse.json(
        { error: 'Unauthorized - API key required' },
        { status: 401 }
      );
    }
    // Development mode: allow access without key
    return null;
  }

  const providedKey = request.headers.get('x-api-key');
  if (!safeCompare(providedKey, apiKey)) {
    return NextResponse.json(
      { error: 'Unauthorized - valid API key required' },
      { status: 401 }
    );
  }

  return null;
}
