/**
 * Centralized logging utility
 * Replaces direct console.* calls with environment-aware logging
 * Integrates with Sentry for production error tracking
 */

import * as Sentry from '@sentry/nextjs';

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
   * Log a line that should reach production logs without alerting anyone.
   *
   * `info` prints only in development and `warn` raises a Sentry event, so
   * neither fits a count worth reading in Vercel's runtime logs, such as a
   * dropped spam submission. Printed as given, with no level prefix, so a
   * log search for the message text matches the line itself. Silent under
   * test like every other level.
   */
  notice(message: string, context?: LogContext): void {
    if (this.isTest) return;
    if (context) {
      console.info(message, context);
    } else {
      console.info(message);
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context || '');
    }

    // Send warnings to Sentry in production
    if (!this.isDevelopment && !this.isTest) {
      Sentry.captureMessage(message, {
        level: 'warning',
        tags: context ? { component: context.component, action: context.action } : undefined,
        extra: context,
      });
    }
  }

  /**
   * Log error messages
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error, context || '');
    }

    // Send errors to Sentry in production
    if (!this.isDevelopment && !this.isTest) {
      if (error instanceof Error) {
        Sentry.captureException(error, {
          tags: context ? { component: context.component, action: context.action } : undefined,
          extra: { message, ...context },
        });
      } else {
        // If not an Error object, capture as message with error details
        Sentry.captureMessage(message, {
          level: 'error',
          tags: context ? { component: context.component, action: context.action } : undefined,
          extra: { error, ...context },
        });
      }
    }
  }

  /**
   * Log debug messages (development only)
   * In production, adds Sentry breadcrumbs for debugging
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }

    // Add breadcrumbs in production for debugging context
    if (!this.isDevelopment && !this.isTest) {
      Sentry.addBreadcrumb({
        category: context?.component || 'debug',
        message,
        level: 'debug',
        data: context,
      });
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const logInfo = (message: string, context?: LogContext) =>
  logger.info(message, context);

export const logNotice = (message: string, context?: LogContext) =>
  logger.notice(message, context);

export const logWarn = (message: string, context?: LogContext) =>
  logger.warn(message, context);

export const logError = (message: string, error?: Error | unknown, context?: LogContext) =>
  logger.error(message, error, context);

export const logDebug = (message: string, context?: LogContext) =>
  logger.debug(message, context);
