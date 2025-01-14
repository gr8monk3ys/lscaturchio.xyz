import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Sentry before any imports
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  addBreadcrumb: vi.fn(),
}))

// We need to test the Logger class with different NODE_ENV values
// So we'll use dynamic imports and mock process.env

describe('Logger', () => {
  const originalEnv = process.env.NODE_ENV

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.stubEnv('NODE_ENV', originalEnv as string)
    vi.resetModules()
  })

  describe('in development environment', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'development')
      vi.resetModules()
    })

    it('should log info messages with context', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      // Dynamic import to get fresh module with new NODE_ENV
      const { logger } = await import('@/lib/logger')

      const context = { component: 'TestComponent', action: 'test' }
      logger.info('Test info message', context)

      expect(consoleSpy).toHaveBeenCalledWith('[INFO] Test info message', context)
    })

    it('should log info messages without context', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const { logger } = await import('@/lib/logger')

      logger.info('Test info message')

      expect(consoleSpy).toHaveBeenCalledWith('[INFO] Test info message', '')
    })

    it('should log warn messages with context', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { logger } = await import('@/lib/logger')

      const context = { component: 'TestComponent', action: 'warning' }
      logger.warn('Test warning message', context)

      expect(consoleSpy).toHaveBeenCalledWith('[WARN] Test warning message', context)
    })

    it('should log warn messages without context', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { logger } = await import('@/lib/logger')

      logger.warn('Test warning message')

      expect(consoleSpy).toHaveBeenCalledWith('[WARN] Test warning message', '')
    })

    it('should log error messages with error object and context', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { logger } = await import('@/lib/logger')

      const error = new Error('Test error')
      const context = { component: 'TestComponent', action: 'error' }
      logger.error('Test error message', error, context)

      expect(consoleSpy).toHaveBeenCalledWith('[ERROR] Test error message', error, context)
    })

    it('should log error messages with only error object', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { logger } = await import('@/lib/logger')

      const error = new Error('Test error')
      logger.error('Test error message', error)

      expect(consoleSpy).toHaveBeenCalledWith('[ERROR] Test error message', error, '')
    })

    it('should log error messages without error or context', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { logger } = await import('@/lib/logger')

      logger.error('Test error message')

      expect(consoleSpy).toHaveBeenCalledWith('[ERROR] Test error message', undefined, '')
    })

    it('should log debug messages with context', async () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})

      const { logger } = await import('@/lib/logger')

      const context = { component: 'TestComponent', action: 'debug' }
      logger.debug('Test debug message', context)

      expect(consoleSpy).toHaveBeenCalledWith('[DEBUG] Test debug message', context)
    })

    it('should log debug messages without context', async () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})

      const { logger } = await import('@/lib/logger')

      logger.debug('Test debug message')

      expect(consoleSpy).toHaveBeenCalledWith('[DEBUG] Test debug message', '')
    })

    it('should handle custom context properties', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const { logger } = await import('@/lib/logger')

      const context = {
        component: 'TestComponent',
        action: 'test',
        customField: 'customValue',
        nestedData: { key: 'value' }
      }
      logger.info('Test with custom context', context)

      expect(consoleSpy).toHaveBeenCalledWith('[INFO] Test with custom context', context)
    })
  })

  describe('in test environment', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'test')
      vi.resetModules()
    })

    it('should not log info messages', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const { logger } = await import('@/lib/logger')

      logger.info('Test info message')

      expect(consoleSpy).not.toHaveBeenCalled()
    })

    it('should not log warn messages', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { logger } = await import('@/lib/logger')

      logger.warn('Test warning message')

      expect(consoleSpy).not.toHaveBeenCalled()
    })

    it('should not log error messages to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { logger } = await import('@/lib/logger')

      logger.error('Test error message', new Error('Test'))

      expect(consoleSpy).not.toHaveBeenCalled()
    })

    it('should not log debug messages', async () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})

      const { logger } = await import('@/lib/logger')

      logger.debug('Test debug message')

      expect(consoleSpy).not.toHaveBeenCalled()
    })

    it('should not call sendToErrorTracking in test environment', async () => {
      // In test environment, sendToErrorTracking should not be called
      // because the condition is (!isDevelopment && !isTest)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { logger } = await import('@/lib/logger')

      // This should not throw or cause side effects
      logger.error('Test error', new Error('Test'), { component: 'Test' })

      expect(consoleSpy).not.toHaveBeenCalled()
    })
  })

  describe('in production environment', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'production')
      vi.resetModules()
    })

    it('should not log info messages to console', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const { logger } = await import('@/lib/logger')

      logger.info('Test info message')

      expect(consoleSpy).not.toHaveBeenCalled()
    })

    it('should not log warn messages to console but should send to Sentry', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const Sentry = await import('@sentry/nextjs')

      const { logger } = await import('@/lib/logger')

      const context = { component: 'TestComponent', action: 'test' }
      logger.warn('Test warning message', context)

      expect(consoleSpy).not.toHaveBeenCalled()
      expect(Sentry.captureMessage).toHaveBeenCalledWith('Test warning message', {
        level: 'warning',
        tags: { component: 'TestComponent', action: 'test' },
        extra: context,
      })
    })

    it('should not log error messages to console but should send to Sentry', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const Sentry = await import('@sentry/nextjs')

      const { logger } = await import('@/lib/logger')

      const error = new Error('Production error')
      const context = { component: 'ProductionComponent' }

      logger.error('Production error message', error, context)

      expect(consoleSpy).not.toHaveBeenCalled()
      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        tags: { component: 'ProductionComponent', action: undefined },
        extra: { message: 'Production error message', ...context },
      })
    })

    it('should send non-Error objects to Sentry as messages', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const Sentry = await import('@sentry/nextjs')

      const { logger } = await import('@/lib/logger')

      logger.error('Error with string', 'string error')

      expect(consoleSpy).not.toHaveBeenCalled()
      expect(Sentry.captureMessage).toHaveBeenCalledWith('Error with string', {
        level: 'error',
        tags: undefined,
        extra: { error: 'string error' },
      })
    })

    it('should not log debug messages to console but should add Sentry breadcrumb', async () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
      const Sentry = await import('@sentry/nextjs')

      const { logger } = await import('@/lib/logger')

      const context = { component: 'DebugComponent' }
      logger.debug('Test debug message', context)

      expect(consoleSpy).not.toHaveBeenCalled()
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'DebugComponent',
        message: 'Test debug message',
        level: 'debug',
        data: context,
      })
    })
  })

  describe('convenience functions', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'development')
      vi.resetModules()
    })

    it('logInfo should call logger.info', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const { logInfo } = await import('@/lib/logger')

      const context = { component: 'Test' }
      logInfo('Test message', context)

      expect(consoleSpy).toHaveBeenCalledWith('[INFO] Test message', context)
    })

    it('logInfo should work without context', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const { logInfo } = await import('@/lib/logger')

      logInfo('Test message')

      expect(consoleSpy).toHaveBeenCalledWith('[INFO] Test message', '')
    })

    it('logWarn should call logger.warn', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { logWarn } = await import('@/lib/logger')

      const context = { component: 'Test' }
      logWarn('Test warning', context)

      expect(consoleSpy).toHaveBeenCalledWith('[WARN] Test warning', context)
    })

    it('logWarn should work without context', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { logWarn } = await import('@/lib/logger')

      logWarn('Test warning')

      expect(consoleSpy).toHaveBeenCalledWith('[WARN] Test warning', '')
    })

    it('logError should call logger.error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { logError } = await import('@/lib/logger')

      const error = new Error('Test error')
      const context = { component: 'Test' }
      logError('Test error message', error, context)

      expect(consoleSpy).toHaveBeenCalledWith('[ERROR] Test error message', error, context)
    })

    it('logError should work with only message', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { logError } = await import('@/lib/logger')

      logError('Test error message')

      expect(consoleSpy).toHaveBeenCalledWith('[ERROR] Test error message', undefined, '')
    })

    it('logError should work with message and error only', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { logError } = await import('@/lib/logger')

      const error = new Error('Test error')
      logError('Test error message', error)

      expect(consoleSpy).toHaveBeenCalledWith('[ERROR] Test error message', error, '')
    })

    it('logDebug should call logger.debug', async () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})

      const { logDebug } = await import('@/lib/logger')

      const context = { component: 'Test' }
      logDebug('Test debug', context)

      expect(consoleSpy).toHaveBeenCalledWith('[DEBUG] Test debug', context)
    })

    it('logDebug should work without context', async () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})

      const { logDebug } = await import('@/lib/logger')

      logDebug('Test debug')

      expect(consoleSpy).toHaveBeenCalledWith('[DEBUG] Test debug', '')
    })
  })

  describe('Sentry integration (production path)', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'production')
      vi.resetModules()
    })

    it('should send errors with full context to Sentry', async () => {
      const Sentry = await import('@sentry/nextjs')
      const { logger } = await import('@/lib/logger')

      const error = new Error('Production error')
      const context = { component: 'ProductionComponent', action: 'criticalAction' }

      logger.error('Critical error in production', error, context)

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        tags: { component: 'ProductionComponent', action: 'criticalAction' },
        extra: { message: 'Critical error in production', ...context },
      })
    })

    it('should handle undefined error by sending as message', async () => {
      const Sentry = await import('@sentry/nextjs')
      const { logger } = await import('@/lib/logger')

      const context = { component: 'Test' }
      logger.error('Error without error object', undefined, context)

      expect(Sentry.captureMessage).toHaveBeenCalledWith('Error without error object', {
        level: 'error',
        tags: { component: 'Test', action: undefined },
        extra: { error: undefined, ...context },
      })
    })

    it('should handle undefined context', async () => {
      const Sentry = await import('@sentry/nextjs')
      const { logger } = await import('@/lib/logger')

      const error = new Error('Test error')
      logger.error('Error without context', error)

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        tags: undefined,
        extra: { message: 'Error without context' },
      })
    })

    it('should handle minimal parameters', async () => {
      const Sentry = await import('@sentry/nextjs')
      const { logger } = await import('@/lib/logger')

      logger.error('Error with no additional params')

      expect(Sentry.captureMessage).toHaveBeenCalledWith('Error with no additional params', {
        level: 'error',
        tags: undefined,
        extra: { error: undefined },
      })
    })

    it('should add breadcrumbs for debug messages in production', async () => {
      const Sentry = await import('@sentry/nextjs')
      const { logger } = await import('@/lib/logger')

      logger.debug('Debug breadcrumb without context')

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'debug',
        message: 'Debug breadcrumb without context',
        level: 'debug',
        data: undefined,
      })
    })
  })

  describe('logger singleton', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'development')
      vi.resetModules()
    })

    it('should export the same logger instance', async () => {
      const module1 = await import('@/lib/logger')
      const module2 = await import('@/lib/logger')

      expect(module1.logger).toBe(module2.logger)
    })

    it('convenience functions should use the same logger instance', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const { logger, logInfo } = await import('@/lib/logger')

      // Both should produce the same output format
      logger.info('Direct call')
      logInfo('Function call')

      expect(consoleSpy).toHaveBeenCalledTimes(2)
      expect(consoleSpy).toHaveBeenNthCalledWith(1, '[INFO] Direct call', '')
      expect(consoleSpy).toHaveBeenNthCalledWith(2, '[INFO] Function call', '')
    })
  })
})
