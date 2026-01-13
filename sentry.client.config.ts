/**
 * Sentry client-side configuration
 * This file configures error tracking for the browser
 */

import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry if DSN is configured
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Session Replay (captures 10% of sessions, 100% on error)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Debug mode in development
    debug: process.env.NODE_ENV === "development",

    // Environment tag
    environment: process.env.NODE_ENV,

    // Filter out common non-actionable errors
    ignoreErrors: [
      // Browser extensions
      /^chrome-extension:\/\//,
      /^moz-extension:\/\//,
      // Network errors that happen during navigation
      "Failed to fetch",
      "Load failed",
      "NetworkError",
      // React hydration warnings (not actual errors)
      "Hydration failed",
      "Text content does not match",
    ],

    // Only send errors from our domain
    allowUrls: [
      /https?:\/\/(www\.)?lscaturchio\.xyz/,
      /https?:\/\/localhost/,
    ],

    // Add user context before sending
    beforeSend(event) {
      // Remove PII from errors
      if (event.user) {
        delete event.user.ip_address;
        delete event.user.email;
      }
      return event;
    },

    integrations: [
      Sentry.replayIntegration({
        // Mask all text to protect privacy
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  });
}
