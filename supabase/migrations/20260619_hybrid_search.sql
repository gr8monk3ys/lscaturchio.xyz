-- Hybrid search: Postgres full-text search alongside pgvector, plus a
-- per-source content hash for incremental re-embedding.
-- See docs/superpowers/specs/2026-06-19-hybrid-retrieval-design.md
--
-- Idempotent: safe to re-run. After applying, re-run `npm run generate-embeddings`
-- once so existing rows pick up content_hash (content_tsv is generated and
-- backfills automatically).

-- Full-text search vector, generated from content so it is always in sync with
-- the stored chunk text (no application bookkeeping).
ALTER TABLE embeddings
  ADD COLUMN IF NOT EXISTS content_tsv tsvector
  GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;

CREATE INDEX IF NOT EXISTS embeddings_content_tsv_idx
  ON embeddings USING gin (content_tsv);

-- Per-source content hash so re-embedding can skip files that have not changed.
ALTER TABLE embeddings
  ADD COLUMN IF NOT EXISTS content_hash text;
