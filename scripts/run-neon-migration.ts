/**
 * Run the combined Neon migration using @neondatabase/serverless
 * Usage: DATABASE_URL=... bun run scripts/run-neon-migration.ts
 */

import { neon } from '@neondatabase/serverless'
import fs from 'fs'
import path from 'path'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required')
  process.exit(1)
}

const sql = neon(DATABASE_URL)

const migrationPath = path.join(
  process.cwd(),
  'supabase/migrations/neon_combined_migration.sql'
)

const migrationSql = fs.readFileSync(migrationPath, 'utf-8')

// Split into individual statements (split on semicolons not inside $$ blocks)
function splitStatements(sqlContent: string): string[] {
  const statements: string[] = []
  let current = ''
  let inDollarQuote = false

  const lines = sqlContent.split('\n')
  for (const line of lines) {
    // Skip pure comment lines
    if (line.trim().startsWith('--') && !inDollarQuote) {
      current += line + '\n'
      continue
    }

    // Track $$ blocks
    const dollarCount = (line.match(/\$\$/g) || []).length
    if (dollarCount % 2 !== 0) {
      inDollarQuote = !inDollarQuote
    }

    current += line + '\n'

    // If line ends with semicolon and we're not in a $$ block, it's end of statement
    if (line.trim().endsWith(';') && !inDollarQuote) {
      const trimmed = current.trim()
      // Only add non-empty, non-comment-only statements
      const withoutComments = trimmed
        .split('\n')
        .filter((l) => !l.trim().startsWith('--'))
        .join('\n')
        .trim()
      if (withoutComments.length > 0) {
        statements.push(trimmed)
      }
      current = ''
    }
  }

  return statements
}

async function main() {
  console.log('Running Neon migration...\n')

  const statements = splitStatements(migrationSql)
  console.log(`Found ${statements.length} SQL statements to execute\n`)

  let success = 0
  let failed = 0

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]
    // Get first non-comment line for display
    const displayLine =
      stmt
        .split('\n')
        .find((l) => l.trim() && !l.trim().startsWith('--'))
        ?.trim()
        .slice(0, 80) || '(empty)'

    try {
      await sql.query(stmt)
      console.log(`  [${i + 1}/${statements.length}] OK: ${displayLine}`)
      success++
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error)
      // "already exists" errors are fine for IF NOT EXISTS statements
      if (msg.includes('already exists')) {
        console.log(`  [${i + 1}/${statements.length}] SKIP (already exists): ${displayLine}`)
        success++
      } else {
        console.error(`  [${i + 1}/${statements.length}] FAIL: ${displayLine}`)
        console.error(`    Error: ${msg}\n`)
        failed++
      }
    }
  }

  console.log(`\nMigration complete: ${success} succeeded, ${failed} failed`)

  if (failed > 0) {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
