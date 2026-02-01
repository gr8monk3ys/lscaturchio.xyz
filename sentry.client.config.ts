/**
 * Sentry client-side configuration
 * This file configures error tracking and session replay for the browser
 */

import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry if DSN is configured and in production
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN && process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Performance Monitoring - 10% of transactions
    tracesSampleRate: 0.1,

    // Session Replay - capture replays only when errors occur
    replaysOnErrorSampleRate: 1.0, // Capture 100% of sessions with errors
    replaysSessionSampleRate: 0, // Don't capture any sessions without errors

    // Environment tag
    environment: process.env.NODE_ENV,

    // Integrations
    integrations: [
      Sentry.replayIntegration({
        // Mask all text for privacy
        maskAllText: true,
        // Block all media for privacy
        blockAllMedia: true,
      }),
    ],

    // Filter out common non-actionable errors
    ignoreErrors: [
      // Browser extensions
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      // Network errors
      "Failed to fetch",
      "Load failed",
      "NetworkError",
      // User aborts
      "AbortError",
      // Chrome extension errors
      /^chrome-extension:\/\//,
      // Firefox extension errors
      /^moz-extension:\/\//,
    ],

    // Remove PII before sending
    beforeSend(event) {
      if (event.user) {
        delete event.user.ip_address;
        delete event.user.email;
      }
      return event;
    },
  });
}
