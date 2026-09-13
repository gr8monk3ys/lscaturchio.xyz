/**
 * Sentry edge runtime configuration
 * This file configures error tracking for edge functions (middleware)
 */

import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry if DSN is configured
const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT =
  process.env.SENTRY_ENVIRONMENT ||
  process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ||
  process.env.VERCEL_ENV ||
  process.env.NODE_ENV ||
  "development";

// Report only from deployed environments. A local `next dev` or `next start`
// with a DSN in .env.local otherwise files its own bugs — a screenshot crawler
// hitting a stale local build once produced 91 "This is a bug in Next.js"
// events — and dev-only Next internals ("destination stream closed early")
// that nobody can act on. `preview` stays on: that is a deploy.
const SENTRY_ENABLED = ["production", "preview"].includes(SENTRY_ENVIRONMENT.trim());

if (SENTRY_DSN && SENTRY_ENABLED) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Performance Monitoring (lower rate for edge)
    // No `tracesSampleRate`, for the same reason as the client and server
    // configs: `webpack.treeshake.removeTracing` in `next.config.mjs` strips
    // the SDK's tracing code from every bundle it processes, this one
    // included. Error reporting is unchanged.

    // Debug mode in development
    debug: process.env.NODE_ENV === "development",

    // Environment tag
    environment: SENTRY_ENVIRONMENT,
  });
}
