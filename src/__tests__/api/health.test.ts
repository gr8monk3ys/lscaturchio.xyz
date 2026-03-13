import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Create a mock sql tagged template function
const mockSql = vi.fn()

// Mock the dependencies
vi.mock('@/lib/db', () => ({
  getDb: vi.fn(() => mockSql),
  isDatabaseConfigured: vi.fn(() => true),
}))

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}))

// Mock rate limiting to pass through for tests
vi.mock('@/lib/with-rate-limit', () => ({
  withRateLimit: (handler: Function) => handler,
  RATE_LIMITS: {
    STANDARD: { limit: 60, window: 60000 },
    PUBLIC: { limit: 100, window: 60000 },
    AI_HEAVY: { limit: 5, window: 60000 },
  },
}))

import { GET } from '@/app/api/health/route'
import { isDatabaseConfigured } from '@/lib/db'
import { logError } from '@/lib/logger'
import { NextRequest } from 'next/server'

// The handler takes no args but withRateLimit wraps it expecting NextRequest
const callGet = () => (GET as unknown as () => Promise<Response>)()

describe('Health API Route', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(isDatabaseConfigured).mockReturnValue(true)
    process.env = { ...originalEnv, DATABASE_URL: 'postgresql://test:test@localhost/test' }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('GET /api/health', () => {
    it('returns 200 with healthy status when DB is reachable and env vars set', async () => {
      mockSql.mockResolvedValue([{ slug: 'some-post' }])

      const response = await callGet()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('healthy')
      expect(data.checks.database).toBe('ok')
      expect(data.checks.environment).toBe('ok')
    })

    it('returns 503 with unhealthy status when DATABASE_URL is missing', async () => {
      delete process.env.DATABASE_URL
      mockSql.mockResolvedValue([{ slug: 'some-post' }])

      const response = await callGet()
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.status).toBe('unhealthy')
      expect(data.checks.environment).toBe('error')
    })

    it('returns 503 with unhealthy status when database query fails', async () => {
      mockSql.mockRejectedValue(new Error('Connection refused'))

      const response = await callGet()
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.status).toBe('unhealthy')
      expect(data.checks.database).toBe('error')
    })

    it('returns 503 when isDatabaseConfigured returns false', async () => {
      vi.mocked(isDatabaseConfigured).mockReturnValue(false)

      const response = await callGet()
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.status).toBe('unhealthy')
      expect(data.checks.database).toBe('error')
    })

    it('response includes timestamp, version, and checks object', async () => {
      mockSql.mockResolvedValue([{ slug: 'some-post' }])

      const response = await callGet()
      const data = await response.json()

      expect(data).toHaveProperty('timestamp')
      expect(data).toHaveProperty('version')
      expect(data).toHaveProperty('checks')
      expect(data.checks).toHaveProperty('database')
      expect(data.checks).toHaveProperty('environment')
      // Validate timestamp is a valid ISO string
      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp)
    })

    it('sets no-cache headers', async () => {
      mockSql.mockResolvedValue([{ slug: 'some-post' }])

      const response = await callGet()

      expect(response.headers.get('Cache-Control')).toBe(
        'no-cache, no-store, must-revalidate'
      )
    })

    it('returns 503 when checkDatabase throws unexpected error', async () => {
      mockSql.mockRejectedValue(new TypeError('Cannot read properties of undefined'))

      const response = await callGet()
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.status).toBe('unhealthy')
      expect(data.checks.database).toBe('error')
    })

    it('uses fallback version 0.1.0 when no version env vars are set', async () => {
      delete process.env.npm_package_version
      delete process.env.VERCEL_GIT_COMMIT_SHA
      mockSql.mockResolvedValue([{ slug: 'some-post' }])

      const response = await callGet()
      const data = await response.json()

      expect(data.version).toBe('0.1.0')
    })

    it('uses npm_package_version when available', async () => {
      process.env.npm_package_version = '2.5.0'
      mockSql.mockResolvedValue([{ slug: 'some-post' }])

      const response = await callGet()
      const data = await response.json()

      expect(data.version).toBe('2.5.0')
    })

    it('uses truncated VERCEL_GIT_COMMIT_SHA when npm_package_version is absent', async () => {
      delete process.env.npm_package_version
      process.env.VERCEL_GIT_COMMIT_SHA = 'abc1234567890'
      mockSql.mockResolvedValue([{ slug: 'some-post' }])

      const response = await callGet()
      const data = await response.json()

      expect(data.version).toBe('abc1234')
    })

    it('logs error and returns 503 when handler throws unexpectedly', async () => {
      // Force the entire handler to throw by making isDatabaseConfigured throw
      vi.mocked(isDatabaseConfigured).mockImplementation(() => {
        throw new Error('Catastrophic failure')
      })

      const response = await callGet()
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.status).toBe('unhealthy')
      expect(data.checks.database).toBe('error')
      expect(data.checks.environment).toBe('error')
      expect(logError).toHaveBeenCalledWith(
        'Health check failed',
        expect.any(Error),
        { component: 'health', action: 'GET' }
      )
    })
  })
})
