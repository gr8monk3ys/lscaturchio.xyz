/**
 * Sentry edge runtime configuration
 * This file configures error tracking for edge functions (middleware)
 */

import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry if DSN is configured
const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Performance Monitoring (lower rate for edge)
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 1.0,

    // Debug mode in development
    debug: process.env.NODE_ENV === "development",

    // Environment tag
    environment: process.env.NODE_ENV,
  });
}
