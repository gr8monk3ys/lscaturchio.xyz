/**
 * Canonical site URL helper.
 *
 * Centralizes the pattern that was previously duplicated across 15+ files:
 *   process.env.NEXT_PUBLIC_SITE_URL || 'https://lscaturchio.xyz'
 *
 * Import `getSiteUrl` when you need the value at call-time (e.g. inside a
 * request handler), or `SITE_URL` for module-level constants that are
 * evaluated once at startup.
 */

/**
 * Returns the canonical site URL.
 * Prefers the NEXT_PUBLIC_SITE_URL env var; falls back to the production domain.
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL
  if (raw && raw.startsWith('http')) return raw
  return 'https://lscaturchio.xyz'
}

/** Module-level constant evaluated once at import time. */
export const SITE_URL = getSiteUrl()
