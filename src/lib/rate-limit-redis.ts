/**
 * The Upstash adapter for the rate-limit store port, plus the health probe.
 *
 * The counters live in `@gr8monk3ys/next-kit/rate-limit`'s `RedisStore`
 * (INCR + PEXPIRE). This module owns only the credential lookup and the one
 * shared client. It knows nothing about policies or clients: the bucket key
 * arrives fully built from `src/lib/rate-limit.ts`, the only place a key is
 * composed.
 *
 * Requires environment variables:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */

import { RedisStore, type RateLimitStore } from '@gr8monk3ys/next-kit/rate-limit';
import { Redis } from '@upstash/redis';

/**
 * Key prefix, deliberately versioned.
 *
 * `v2` keys were `ratelimit:v2:<limit>:<windowMs>:<identifier>`: a policy was
 * its numbers, so routes that happened to share numbers shared a counter. `v3`
 * keys are `ratelimit:v3:<POLICY>:<identifier>`. The generations never
 * collide, so no key is read back under a layout it was not written with, and
 * the stale `v2` keys expire on their own TTLs.
 */
const KEY_PREFIX = 'ratelimit:v3:';

// One Redis connection for the process, shared by the store and the health check.
let client: Redis | null = null;
let store: RedisStore | null = null;

function getRedisClient(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return null;
  }

  if (!client) {
    // Auto-pipelining is off on purpose. Upstash answers an over-quota
    // database with HTTP 200 and `{"error": "...temporarily rate-limited..."}`,
    // and the client's pipeline path assumes the body is an array — so the
    // real message was lost behind `TypeError: c.map is not a function`. The
    // single-command path checks `error` first and throws it verbatim. The
    // store issues its commands one at a time anyway, so nothing was batched.
    client = new Redis({ url, token, enableAutoPipelining: false });
  }

  return client;
}

/**
 * The shared rate-limit store, or null when Upstash is not configured.
 *
 * May throw: an invalid URL throws synchronously inside the Redis client
 * constructor, and `hit` throws on any Redis error (`onError: 'closed'`)
 * instead of silently admitting the request. The rate-limit module catches
 * both, trips its breaker and degrades to the in-memory store, which still
 * enforces the policy per instance instead of failing fully open.
 */
export function getUpstashStore(): RateLimitStore | null {
  const redis = getRedisClient();
  if (!redis) {
    return null;
  }

  if (!store) {
    store = new RedisStore(redis, { prefix: KEY_PREFIX, onError: 'closed' });
  }

  return store;
}

/**
 * How long the health check waits for Upstash before calling it unavailable.
 * A healthy PING answers in tens of milliseconds; a hibernated store answers
 * quickly too (with an error), so this only matters when the network is gone.
 */
export const REDIS_PING_TIMEOUT_MS = 3_000;

/**
 * Send one PING and report whether Upstash answered it.
 *
 * This exists for `/api/health`, and it is deliberately separate from the
 * rate-limit module's circuit breaker: a probe must report the store's state
 * as it is right now, not the breaker's memory of a minute ago, and a failed
 * probe must not itself trip the breaker for real traffic.
 *
 * The same command that answers the probe is what keeps the store awake:
 * Upstash hibernates a pay-as-you-go database after 60 days without a command,
 * and once asleep it answers every command with HTTP 200 and
 * `{"error":"...temporarily rate-limited"}` — the client throws that error and
 * this returns `unavailable`. That is exactly what happened to this site's
 * store in August 2026, and `.github/workflows/redis-keepalive.yml` exists so
 * it does not happen again.
 *
 * Never throws; the caller decides how loud to be.
 */
export async function pingRedis(): Promise<'connected' | 'unavailable' | 'not-configured'> {
  let redis: Redis | null;
  try {
    // An invalid URL throws synchronously inside the constructor.
    redis = getRedisClient();
  } catch {
    return 'unavailable';
  }
  if (!redis) {
    return 'not-configured';
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`Redis PING timed out after ${REDIS_PING_TIMEOUT_MS}ms`)),
        REDIS_PING_TIMEOUT_MS,
      );
    });
    const reply = await Promise.race([redis.ping(), timeout]);
    return reply === 'PONG' ? 'connected' : 'unavailable';
  } catch {
    return 'unavailable';
  } finally {
    clearTimeout(timer);
  }
}
