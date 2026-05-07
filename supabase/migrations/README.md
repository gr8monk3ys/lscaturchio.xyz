# Database Migrations

Postgres migrations for Neon. The directory is named `supabase/` for
historical reasons — Supabase was the original provider before the
move to Neon. The SQL is provider-agnostic and works against any
Postgres 14+ database.

## Layout

- `*.sql` — individual migration files, ordered by filename.
- `neon_combined_migration.sql` — the consolidated baseline applied
  by `scripts/run-neon-migration.ts`. Use this for fresh databases.

## Running migrations

### Fresh database (combined baseline)

```bash
DATABASE_URL='postgres://...' bun run scripts/run-neon-migration.ts
```

This applies `neon_combined_migration.sql` end-to-end. Idempotent
where possible (`CREATE TABLE IF NOT EXISTS`, etc.) but safest on a
fresh database.

### Single new migration (existing database)

There is no migration runner that applies one file at a time. For
production changes, paste the SQL into the Neon SQL editor and run
it manually:

1. <https://console.neon.tech> → your project → SQL Editor.
2. Paste the contents of the new `*.sql` file.
3. Run.
4. Verify with a `SELECT` against the affected tables.

For local development against a Neon branch:

```bash
psql "$DATABASE_URL" -f supabase/migrations/<your_migration>.sql
```

## Adding a new migration

1. Create `supabase/migrations/YYYYMMDD_description.sql`. Use a date
   prefix so files sort chronologically.
2. Write idempotent SQL: `CREATE TABLE IF NOT EXISTS`,
   `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, etc.
3. Run it locally first against a Neon branch or a development
   database.
4. After it lands in production, fold the SQL into
   `neon_combined_migration.sql` so the combined baseline keeps
   producing an up-to-date schema.

## Rollback

There are no down-migrations checked in. For a rollback, write the
inverse SQL ad-hoc and apply it the same way (Neon SQL editor or
`psql`). Engagement data (views, reactions, etc.) is destroyed by
`DROP TABLE`, so back up first.

## Embedding-related migrations

Several migrations adjust the `match_embeddings` function and the
`vec` column dimensions to support different embedding providers
(see `20260124_support_variable_embeddings.sql`). When swapping
providers, regenerate embeddings (`npm run generate-embeddings`)
after applying the migration so old vectors don't poison search
results.
