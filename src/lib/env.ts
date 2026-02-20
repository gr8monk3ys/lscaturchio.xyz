/**
 * Environment variable validation and access using @t3-oss/env-nextjs
 *
 * This module provides runtime validation of environment variables.
 * Invalid or missing required environment variables will throw errors
 * at build time or server startup, preventing deployment with broken config.
 *
 * Usage:
 *   import { env } from '@/lib/env'
 *   const apiKey = env.OPENAI_API_KEY
 */

import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  /**
   * Server-side environment variables schema.
   * These are only available on the server and will throw if accessed on the client.
   */
  server: {
    // Node environment
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    // ============================================
    // REQUIRED - Core Services
    // ============================================

    // Neon PostgreSQL connection string (optional, gracefully degraded in db.ts)
    DATABASE_URL: z.string().min(1).optional(),

    // ============================================
    // AI Providers (at least one required for AI chat)
    // ============================================

    // OpenAI API Key (optional if using Ollama)
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_CHAT_MODEL: z.string().optional(),
    OPENAI_FALLBACK_CHAT_MODEL: z.string().optional(),

    // Ollama configuration (optional, for local AI)
    OLLAMA_BASE_URL: z.string().url().optional(),
    OLLAMA_EMBED_MODEL: z.string().optional(),
    OLLAMA_CHAT_MODEL: z.string().optional(),

    // ============================================
    // OPTIONAL - Enhanced Features
    // ============================================

    // GitHub Personal Access Token (for contribution graph)
    GITHUB_TOKEN: z.string().optional(),

    // Resend API Key (for contact form and newsletter)
    RESEND_API_KEY: z.string().optional(),

    // Contact Form Email Configuration
    CONTACT_EMAIL: z.string().email().optional().default('lorenzo@lscaturchio.xyz'),
    CONTACT_FROM_EMAIL: z.string().email().optional().default('contact@lscaturchio.xyz'),
    NEWSLETTER_FROM_EMAIL: z.string().email().optional().default('newsletter@lscaturchio.xyz'),
    RESUME_URL: z.string().url().optional(),

    // Embedding Search Threshold (0-1, higher = stricter matching)
    EMBEDDING_MATCH_THRESHOLD: z
      .string()
      .optional()
      .transform((val) => (val ? parseFloat(val) : 0.5))
      .pipe(z.number().min(0).max(1)),

    // Analytics API Key (for protected endpoints)
    ANALYTICS_API_KEY: z.string().optional(),

    // Upstash Redis (for persistent rate limiting)
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

    // Sentry Error Tracking
    SENTRY_DSN: z.string().url().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),
    SENTRY_AUTH_TOKEN: z.string().optional(),
  },

  /**
   * Client-side environment variables schema.
   * These are exposed to the browser and must be prefixed with NEXT_PUBLIC_.
   */
  client: {
    // Site URL (for canonical URLs, Open Graph, etc.)
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),

    // Sentry DSN (for client-side error tracking)
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

    // Giscus Comments Configuration
    NEXT_PUBLIC_GISCUS_REPO_ID: z.string().optional(),
    NEXT_PUBLIC_GISCUS_CATEGORY_ID: z.string().optional(),
  },

  /**
   * Runtime environment mapping.
   * Map environment variables to the schema keys.
   */
  runtimeEnv: {
    // Node environment
    NODE_ENV: process.env.NODE_ENV,

    // Server-side variables
    DATABASE_URL: process.env.DATABASE_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_CHAT_MODEL: process.env.OPENAI_CHAT_MODEL,
    OPENAI_FALLBACK_CHAT_MODEL: process.env.OPENAI_FALLBACK_CHAT_MODEL,
    OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
    OLLAMA_EMBED_MODEL: process.env.OLLAMA_EMBED_MODEL,
    OLLAMA_CHAT_MODEL: process.env.OLLAMA_CHAT_MODEL,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CONTACT_EMAIL: process.env.CONTACT_EMAIL,
    CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
    NEWSLETTER_FROM_EMAIL: process.env.NEWSLETTER_FROM_EMAIL,
    RESUME_URL: process.env.RESUME_URL,
    EMBEDDING_MATCH_THRESHOLD: process.env.EMBEDDING_MATCH_THRESHOLD,
    ANALYTICS_API_KEY: process.env.ANALYTICS_API_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,

    // Client-side variables
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_GISCUS_REPO_ID: process.env.NEXT_PUBLIC_GISCUS_REPO_ID,
    NEXT_PUBLIC_GISCUS_CATEGORY_ID: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
  },

  /**
   * Skip validation in certain environments.
   * Useful for Docker builds where env vars are injected at runtime.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR=''` will be treated as if SOME_VAR was not set.
   */
  emptyStringAsUndefined: true,
})

// ============================================
// Helper Functions (backwards compatibility)
// ============================================

/**
 * Check if an environment variable is set
 * @deprecated Use `env.VARIABLE_NAME` directly instead
 */
export function hasEnv(key: keyof typeof env): boolean {
  return env[key] !== undefined && env[key] !== null && env[key] !== ''
}

/**
 * Get an optional environment variable with a default
 * @deprecated Use `env.VARIABLE_NAME ?? defaultValue` instead
 */
export function getEnv<K extends keyof typeof env>(
  key: K,
  defaultValue: NonNullable<(typeof env)[K]>
): NonNullable<(typeof env)[K]> {
  return (env[key] ?? defaultValue) as NonNullable<(typeof env)[K]>
}

/**
 * Validate that required environment variables are set
 * This is now handled automatically by @t3-oss/env-nextjs
 * @deprecated Validation happens at import time
 */
export function validateEnv(): { isValid: boolean; missing: string[]; warnings: string[] } {
  // Validation is now automatic - this is kept for backwards compatibility
  return {
    isValid: true,
    missing: [],
    warnings: [],
  }
}

/**
 * Log environment validation results
 * @deprecated Validation errors are now thrown automatically
 */
export function logEnvStatus(): void {
  // Validation is now automatic at import time
  if (process.env.NODE_ENV === 'development') {
    console.log('[env] Environment variables validated successfully')
  }
}
