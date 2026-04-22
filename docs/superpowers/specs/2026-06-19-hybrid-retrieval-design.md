# Hybrid Retrieval Overhaul — Design

**Date:** 2026-06-19
**Status:** Approved (Approach A)
**Sub-project 1 of 4** (kentcdodds.com-inspired roadmap: retrieval → rot-resistance → reader-wins → MCP)

## Problem

The chat RAG and `/api/search` both retrieve via pure vector cosine similarity
(`searchSimilarContent` → `match_embeddings`). Two weaknesses:

1. **Exact-term recall.** Pure embeddings reliably miss queries that hinge on an
   exact token — library names, acronyms (`RAG`, `pgvector`), proper nouns — when
   the surrounding prose is only loosely similar.
2. **No confidence signal.** When retrieval is weak or empty, the chat silently
   omits the semantic block and answers from the model's general knowledge. There
   is no "I haven't written about that" behavior, so the bot can confabulate
   off-corpus. (Decision: the assistant should be **strictly grounded** — a guide
   to Lorenzo's writing, not a general chatbot.)

Two cost/quality issues in indexing, fixed alongside:

3. Re-embedding re-runs **every chunk every time** (500ms/chunk), even unchanged files.
4. Chunks are embedded **raw**, so a mid-document chunk lacks topical context.

## Approach (A — single-table hybrid in Neon)

Everything stays in the one Neon Postgres database. No new infra (rejected the
Cloudflare Vectorize + D1 model as against the local-first ethos).

### Data flow

```
query
  ├─▶ vectorSearch(q)   — needs an embedding provider (cosine via match_embeddings)
  └─▶ lexicalSearch(q)  — DB-only Postgres FTS; works with NO embedding provider
        │  (run in parallel; each degrades to [] on failure)
        ▼
   reciprocalRankFusion([vector, lexical], {k, weights})   ← pure, unit-tested
        ▼
   dedupe by source/url  →  assessConfidence(best cosine sim)  →  { results, confidence }
        ▼
   consumers: chat (gates the prompt) · /api/search (ranks + labels)
```

Property worth keeping: **lexical search needs no embedding provider**, so if
Ollama/OpenAI are unavailable, retrieval degrades to keyword-only instead of empty.

## Components

### 1. Schema migration — `supabase/migrations/<date>_hybrid_search.sql`
- `ALTER TABLE embeddings ADD COLUMN content_tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;`
- `CREATE INDEX ... USING gin (content_tsv);`
- `ALTER TABLE embeddings ADD COLUMN content_hash text;` (incremental re-embed)
- Vector column, HNSW index, and `match_embeddings` are left untouched.
- Idempotent (`IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS`); appended to
  `neon_combined_migration.sql` as well so a fresh DB gets it.

### 2. New module — `src/lib/retrieval.ts`
Keeps the already-large `embeddings.ts` focused on provider/embed/store.

- `reciprocalRankFusion(lists, opts)` — **pure**. Sums `weight / (k + rank)`
  across ranked lists, dedupes by a key fn, returns items sorted by fused score.
  Defaults `k = 60`, weights `{ vector: 1, lexical: 1.1 }` (slight lexical favor).
- `assessConfidence(results)` → `'strong' | 'weak' | 'none'`, gated on the
  **raw top cosine `similarity`** (0–1, interpretable) — NOT the RRF score (RRF
  ranks; cosine gates — clean separation). `strong` ≥ `STRONG_SIM` (~0.5);
  `weak` ≥ the existing loose match threshold; otherwise `none`.
- `hybridSearch(query, limit)` — runs `vectorSearch` + `lexicalSearch` in
  parallel, fuses, dedupes by `metadata.url || metadata.source`, returns rows
  ranked by fused score. Each row: `{ id, content, metadata, similarity, score }`
  (`similarity` = cosine for vector hits, `null` for lexical-only; `score` = fused).
- `lexicalSearch(query, limit)` — `websearch_to_tsquery('english', q)` against
  `content_tsv`, `ts_rank` ordering. Returns rows shaped like the vector path
  (no `similarity`). Empty/garbage queries → `[]` (websearch_to_tsquery is lenient).

`searchSimilarContent` / `searchEmbeddings` in `embeddings.ts` become thin
wrappers delegating to `hybridSearch`, so existing consumers keep working and
both improve transparently.

### 3. Indexing — `scripts/generate-embeddings.ts` + helpers in `embeddings.ts`
- **Preamble:** `buildEmbeddingInput(meta, chunk)` → `Title: …\nType: …\nURL: …\n\n{chunk}`.
  Embed that; **store `content` = the raw chunk** (FTS matches real prose, snippets stay clean).
- **Per-source incremental:** `content_hash = sha256(file processed content)`.
  On re-run, if all existing rows for a `source` carry the current hash, skip the
  whole file. Changed/new files: delete-by-source + re-embed (today's behavior).
  Pure helper `sourceContentHash(text)` + `shouldSkipSource(existingHashes, newHash)`
  are unit-tested. (Per-chunk hashing is a deliberate future refinement.)

### 4. Consumers
- **Chat** (`src/lib/chat/context.ts`, `src/app/api/chat/route.ts`):
  use `hybridSearch`; thread `confidence` into the system prompt. Strictly-grounded
  instruction: *"Answer only from the provided context. If it's empty or doesn't
  cover the question, say you haven't written about it and point to the closest
  related notes below — do not answer from general knowledge."* When
  `confidence === 'none'`, still pass the closest few `{title, url}` as pointers.
- **Search** (`src/app/api/search/route.ts`): rank by fused `score` (not raw
  cosine); expose a `confident`/`noCloseMatches` flag. No UI overhaul.

## Testing (TDD)
- Units (pure, RED first): `reciprocalRankFusion` (order/weights/dedupe/empty
  lists), `assessConfidence` (strong/weak/none boundaries), `buildEmbeddingInput`
  (preamble shape), `sourceContentHash` + `shouldSkipSource`.
- Integration: mock `getDb` returning vector rows + FTS rows → assert fuse+dedupe
  + ranking; chat-context test asserts the refusal instruction + closest-notes
  appear when confidence is `none`.

## Ops (run by Lorenzo against live Neon — not automated here)
1. Apply the migration: `tsx scripts/run-neon-migration.ts <file>`.
2. One-time full re-embed: `npm run generate-embeddings` (populates
   preamble-embeddings + `content_hash`; `content_tsv` auto-generates).
3. Update `docs/operations.md` (hybrid search + re-embed note) per the Documentation Rule.

## Error handling / degradation
FTS-fails → vector-only; vector-fails or no provider → lexical-only; both fail → `[]`.
All paths return empty arrays rather than throwing, matching existing behavior.

## Out of scope (deliberately)
Per-chunk hashing, embed-batch bisection, transcript indexing, the MCP surface
(sub-project #4). RRF weights/thresholds ship as tunable constants, not config UI.
