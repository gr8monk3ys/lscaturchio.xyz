import { NextResponse } from 'next/server'
import { apiSuccess } from '@/lib/api-response'
import { getDb, isDatabaseConfigured } from '@/lib/db'
import { logError } from '@/lib/logger'
import { pingRedis } from '@/lib/rate-limit-redis'

type RedisState = Awaited<ReturnType<typeof pingRedis>>

/**
 * Health check response type
 */
interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  version: string
  /**
   * Whether the Upstash store answered a PING. `.github/workflows/redis-keepalive.yml`
   * greps the raw body for `"redis":"connected"`, so this key and its values
   * are part of the contract with that workflow.
   */
  redis: RedisState
  checks: {
    database: 'ok' | 'error'
    environment: 'ok' | 'error'
    redis: 'ok' | 'error'
  }
}

/**
 * Critical environment variables that must be set for the app to function
 */
const CRITICAL_ENV_VARS = [
  'DATABASE_URL',
] as const

/**
 * Check if all critical environment variables are set
 */
function checkEnvironment(): boolean {
  for (const envVar of CRITICAL_ENV_VARS) {
    if (!process.env[envVar]) {
      return false
    }
  }
  return true
}

/**
 * Check database connectivity with a simple query
 */
async function checkDatabase(): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    return false
  }

  try {
    const sql = getDb()
    await sql`SELECT slug FROM views LIMIT 1`
    return true
  } catch {
    return false
  }
}

/**
 * GET /api/health
 * Health check endpoint for uptime monitoring services
 *
 * Returns 200 if healthy, 503 if any check fails.
 *
 * Deliberately not wrapped in `withRateLimit`: the wrapper consults Redis and
 * trips its circuit breaker on failure, and a probe of Redis must neither
 * depend on nor disturb that breaker. The endpoint reads nothing from the
 * request and its callers are a 15-minute uptime probe and a weekly keepalive.
 *
 * Redis is a soft dependency for serving traffic (rate limiting degrades to
 * in-memory), but it is reported as unhealthy here on purpose: the store
 * hibernating is a real defect that only shows up as production errors
 * otherwise, and the uptime probe treats a 503 here as an outage, which is the
 * alarm we want.
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Run checks
    const environmentOk = checkEnvironment()
    const [databaseOk, redis] = await Promise.all([checkDatabase(), pingRedis()])
    const redisOk = redis === 'connected'

    const allHealthy = environmentOk && databaseOk && redisOk

    const response: HealthCheckResponse = {
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || '0.1.0',
      redis,
      checks: {
        database: databaseOk ? 'ok' : 'error',
        environment: environmentOk ? 'ok' : 'error',
        redis: redisOk ? 'ok' : 'error',
      },
    }

    // Return appropriate status code
    const statusCode = allHealthy ? 200 : 503

    return apiSuccess(response, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    logError('Health check failed', error, { component: 'health', action: 'GET' })

    const response: HealthCheckResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || '0.1.0',
      redis: 'unavailable',
      checks: {
        database: 'error',
        environment: 'error',
        redis: 'error',
      },
    }

    return apiSuccess(response, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  }
}
