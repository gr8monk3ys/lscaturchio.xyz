import { NextResponse } from 'next/server'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import { logError } from '@/lib/logger'

/**
 * Health check response type
 */
interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  version: string
  checks: {
    database: 'ok' | 'error'
    environment: 'ok' | 'error'
  }
}

/**
 * Critical environment variables that must be set for the app to function
 */
const CRITICAL_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'OPENAI_API_KEY',
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
  if (!isSupabaseConfigured()) {
    return false
  }

  try {
    const supabase = getSupabase()
    // Simple query to check database connectivity
    const { error } = await supabase
      .from('views')
      .select('slug')
      .limit(1)

    return !error
  } catch {
    return false
  }
}

/**
 * GET /api/health
 * Health check endpoint for uptime monitoring services
 *
 * Returns 200 if healthy, 503 if any check fails
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Run checks
    const environmentOk = checkEnvironment()
    const databaseOk = await checkDatabase()

    const allHealthy = environmentOk && databaseOk

    const response: HealthCheckResponse = {
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || '0.1.0',
      checks: {
        database: databaseOk ? 'ok' : 'error',
        environment: environmentOk ? 'ok' : 'error',
      },
    }

    // Return appropriate status code
    const statusCode = allHealthy ? 200 : 503

    return NextResponse.json(response, {
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
      checks: {
        database: 'error',
        environment: 'error',
      },
    }

    return NextResponse.json(response, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  }
}
