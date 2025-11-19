/**
 * Centralized logging utility
 * Replaces direct console.* calls with environment-aware logging
 * Can be extended to integrate with services like Sentry, LogRocket, etc.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  component?: string;
  action?: string;
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isTest = process.env.NODE_ENV === 'test';

  /**
   * Log informational messages
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, context || '');
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context || '');
    }
    // In production, could send to monitoring service
    // Example: Sentry.captureMessage(message, 'warning');
  }

  /**
   * Log error messages
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error, context || '');
    }

    // In production, send to error tracking service
    // Example: Sentry.captureException(error, { tags: context });

    if (!this.isDevelopment && !this.isTest) {
      // Could send to external service here
      this.sendToErrorTracking(message, error, context);
    }
  }

  /**
   * Log debug messages (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Placeholder for future error tracking integration
   */
  private sendToErrorTracking(
    message: string,
    error?: Error | unknown,
    context?: LogContext
  ): void {
    // TODO: Integrate with Sentry or similar service
    // Example implementation:
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     tags: { ...context },
    //     extra: { message }
    //   });
    // }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const logInfo = (message: string, context?: LogContext) =>
  logger.info(message, context);

export const logWarn = (message: string, context?: LogContext) =>
  logger.warn(message, context);

export const logError = (message: string, error?: Error | unknown, context?: LogContext) =>
  logger.error(message, error, context);

export const logDebug = (message: string, context?: LogContext) =>
  logger.debug(message, context);
