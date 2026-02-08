/**
 * Database client using Neon serverless PostgreSQL
 *
 * Replaces the Supabase client with direct SQL via @neondatabase/serverless.
 * Uses HTTP-based queries optimized for serverless environments (Vercel).
 */

import { neon, NeonQueryFunction } from '@neondatabase/serverless'

let sql: NeonQueryFunction<false, false> | null = null

/**
 * Check if the database is properly configured
 */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

/**
 * Get or create the Neon SQL client
 * Uses tagged template literals: sql`SELECT * FROM table WHERE id = ${id}`
 */
export function getDb(): NeonQueryFunction<false, false> {
  if (!sql) {
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not configured')
    }

    sql = neon(databaseUrl)
  }
  return sql
}
