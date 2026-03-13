import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockNeon = vi.fn().mockReturnValue(vi.fn())

vi.mock('@neondatabase/serverless', () => ({
  neon: mockNeon,
}))

describe('Database Client', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('isDatabaseConfigured', () => {
    it('returns true when DATABASE_URL is set', async () => {
      process.env.DATABASE_URL = 'postgresql://test'

      const { isDatabaseConfigured } = await import('@/lib/db')

      expect(isDatabaseConfigured()).toBe(true)
    })

    it('returns false when DATABASE_URL is not set', async () => {
      delete process.env.DATABASE_URL

      const { isDatabaseConfigured } = await import('@/lib/db')

      expect(isDatabaseConfigured()).toBe(false)
    })

    it('returns false when DATABASE_URL is empty string', async () => {
      process.env.DATABASE_URL = ''

      const { isDatabaseConfigured } = await import('@/lib/db')

      expect(isDatabaseConfigured()).toBe(false)
    })
  })

  describe('getDb', () => {
    it('returns a function when DATABASE_URL is configured', async () => {
      process.env.DATABASE_URL = 'postgresql://test'

      const { getDb } = await import('@/lib/db')
      const result = getDb()

      expect(typeof result).toBe('function')
    })

    it('throws Error when DATABASE_URL is not configured', async () => {
      delete process.env.DATABASE_URL

      const { getDb } = await import('@/lib/db')

      expect(() => getDb()).toThrow('DATABASE_URL is not configured')
    })

    it('returns the same instance on subsequent calls (singleton)', async () => {
      process.env.DATABASE_URL = 'postgresql://test'

      const { getDb } = await import('@/lib/db')

      const first = getDb()
      const second = getDb()

      expect(first).toBe(second)
    })

    it('calls neon() with the DATABASE_URL value', async () => {
      process.env.DATABASE_URL = 'postgresql://test:5432/mydb'

      const { getDb } = await import('@/lib/db')
      getDb()

      expect(mockNeon).toHaveBeenCalledWith('postgresql://test:5432/mydb')
    })
  })
})
