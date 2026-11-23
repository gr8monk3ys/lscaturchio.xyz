# Neon Postgres over its serverless HTTP driver

Views, reactions, the guestbook, newsletter subscribers and the chat's embeddings live in Neon Postgres, reached through `@neondatabase/serverless` in `src/lib/db.ts` with plain SQL (no ORM) so queries are cheap on Vercel's serverless functions. The site started on Supabase; the SQL is provider-agnostic Postgres 14+, which is why `supabase/migrations` keeps its name. Migrations are applied by hand or through `scripts/run-neon-migration.ts`; there is no per-file runner.
