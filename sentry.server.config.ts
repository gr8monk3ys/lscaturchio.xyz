/**
 * Sentry server-side configuration
 * This file configures error tracking for Node.js server
 */

import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry if DSN is configured
const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Debug mode in development
    debug: process.env.NODE_ENV === "development",

    // Environment tag
    environment: process.env.NODE_ENV,

    // Filter out common non-actionable errors
    ignoreErrors: [
      // Database connection errors during cold starts
      "ECONNREFUSED",
      // Rate limiting responses (expected behavior)
      "Too Many Requests",
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
