/**
 * Environment variable validation and access
 * Provides type-safe access to environment variables with validation
 */

interface EnvConfig {
  // Required for core functionality
  NEXT_PUBLIC_SUPABASE_URL?: string;
  SUPABASE_SERVICE_KEY?: string;
  OPENAI_API_KEY?: string;

  // Optional but recommended
  RESEND_API_KEY?: string;
  GITHUB_TOKEN?: string;

  // Optional Redis rate limiting
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;

  // Optional analytics
  NEXT_PUBLIC_SITE_URL?: string;
  ANALYTICS_API_KEY?: string;

  // Optional Giscus comments
  NEXT_PUBLIC_GISCUS_REPO_ID?: string;
  NEXT_PUBLIC_GISCUS_CATEGORY_ID?: string;
}

interface ValidationResult {
  isValid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Validates required environment variables
 * Call this at app startup to catch configuration issues early
 */
export function validateEnv(): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check for Supabase (required for engagement tracking)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    warnings.push('NEXT_PUBLIC_SUPABASE_URL not set - engagement tracking disabled');
  }
  if (!process.env.SUPABASE_SERVICE_KEY) {
    warnings.push('SUPABASE_SERVICE_KEY not set - database writes disabled');
  }

  // Check for OpenAI (required for AI chat)
  if (!process.env.OPENAI_API_KEY) {
    warnings.push('OPENAI_API_KEY not set - AI chat disabled');
  }

  // Optional but recommended
  if (!process.env.RESEND_API_KEY) {
    warnings.push('RESEND_API_KEY not set - contact form will log to console');
  }

  if (!process.env.GITHUB_TOKEN) {
    warnings.push('GITHUB_TOKEN not set - using mock contribution data');
  }

  // Check Redis configuration consistency
  const hasRedisUrl = !!process.env.UPSTASH_REDIS_REST_URL;
  const hasRedisToken = !!process.env.UPSTASH_REDIS_REST_TOKEN;
  if (hasRedisUrl !== hasRedisToken) {
    warnings.push('Incomplete Redis config - need both UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Get a required environment variable or throw
 */
export function requireEnv(key: keyof EnvConfig): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get an optional environment variable with a default
 */
export function getEnv(key: keyof EnvConfig, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

/**
 * Check if an environment variable is set
 */
export function hasEnv(key: keyof EnvConfig): boolean {
  return !!process.env[key];
}

/**
 * Log environment validation results (for development)
 */
export function logEnvStatus(): void {
  if (process.env.NODE_ENV !== 'development') return;

  const result = validateEnv();

  if (result.warnings.length > 0) {
    console.log('\n📋 Environment Configuration:');
    result.warnings.forEach(warning => {
      console.log(`  ⚠️  ${warning}`);
    });
    console.log('');
  }
}
