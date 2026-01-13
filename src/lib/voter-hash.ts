/**
 * Voter identification utilities for server-side vote deduplication
 *
 * Uses a hash of IP address to identify voters without storing raw IPs.
 * This provides basic spam prevention while respecting privacy.
 */

import crypto from 'crypto';
import { NextRequest } from 'next/server';

// Salt for hashing (should be set in environment for production)
const HASH_SALT = process.env.VOTER_HASH_SALT || 'lscaturchio-xyz-voter-salt-2025';

/**
 * Get client IP from various headers (handles proxies, Cloudflare, etc.)
 */
function getClientIp(request: NextRequest): string {
  // Check common proxy headers in order of reliability
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp;

  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp) return xRealIp;

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP (original client)
    return forwardedFor.split(',')[0].trim();
  }

  // Fallback for local development
  return 'localhost';
}

/**
 * Generate a privacy-preserving hash for vote deduplication
 *
 * Combines IP with salt and hashes it so we can identify repeat voters
 * without storing their actual IP address.
 */
export function getVoterHash(request: NextRequest): string {
  const ip = getClientIp(request);

  // Create a hash that's unique per voter but doesn't expose IP
  const hash = crypto
    .createHash('sha256')
    .update(`${HASH_SALT}:${ip}`)
    .digest('hex')
    .substring(0, 32); // Truncate for storage efficiency

  return hash;
}

/**
 * Check if voter hash feature is enabled
 * Can be disabled via environment variable for testing
 */
export function isVoteDeduplicationEnabled(): boolean {
  return process.env.DISABLE_VOTE_DEDUPLICATION !== 'true';
}
