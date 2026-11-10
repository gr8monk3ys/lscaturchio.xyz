/**
 * Ingestion side of the retrieval corpus: how `public/my-data` becomes rows in
 * the `embeddings` table. Used by `scripts/generate-embeddings.ts`; nothing at
 * request time imports this. The query side lives in `./retrieval`.
 */

import { createHash } from 'crypto';
import { getDb } from './db';
import { slugFromCorpusFileName } from './retrieval-corpus';

/**
 * Break text into segments on line boundaries first (so markdown structure —
 * headings, list items, blank lines — becomes a natural break point) and then
 * into sentences within each line. Unlike a bare /[^.!?]+[.!?]+/g match, this
 * retains trailing content that lacks terminal punctuation (headings, list
 * items), which otherwise never makes it into the index.
 */
function splitIntoSegments(text: string): string[] {
  const segments: string[] = [];

  for (const line of text.split(/\n+/)) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // A period between two digits is a decimal point, not a sentence end.
    // Without the (?<=\d)\.(?=\d) escape hatch, "44.5% exact match" indexes and
    // renders as two fragments — "44." and "5% exact match" — which is how
    // "89. 9%" and "23. 7MB" ended up visible in search snippets.
    const sentenceRegex = /(?:[^.!?]|(?<=\d)\.(?=\d))+(?:[.!?]+|$)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = sentenceRegex.exec(trimmedLine)) !== null) {
      const sentence = match[0].trim();
      if (sentence) segments.push(sentence);
      lastIndex = sentenceRegex.lastIndex;
      // The trailing `$` alternative can match empty at end-of-string; without
      // this the loop would not terminate.
      if (match.index === sentenceRegex.lastIndex) sentenceRegex.lastIndex++;
    }

    // Preserve any remainder after the last terminal punctuation (or the whole
    // line when it has none, e.g. a markdown heading or list item).
    const remainder = trimmedLine.slice(lastIndex).trim();
    if (remainder) segments.push(remainder);
  }

  return segments;
}

/**
 * Hard-split a segment that on its own exceeds maxChunkLength (e.g. a very long
 * unpunctuated line) on word boundaries, so no single chunk grossly overruns.
 */
function splitOversizedSegment(segment: string, maxChunkLength: number): string[] {
  if (segment.length <= maxChunkLength) return [segment];

  const pieces: string[] = [];
  let current = '';
  for (const word of segment.split(/\s+/)) {
    // A single word longer than the whole budget can never fit on a line, so
    // hard-split it on character boundaries (e.g. a data URI or minified blob).
    if (word.length > maxChunkLength) {
      if (current) {
        pieces.push(current);
        current = '';
      }
      for (let i = 0; i < word.length; i += maxChunkLength) {
        pieces.push(word.slice(i, i + maxChunkLength));
      }
      continue;
    }
    if (current && current.length + word.length + 1 > maxChunkLength) {
      pieces.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) pieces.push(current);
  return pieces;
}

/**
 * Split text into overlapping chunks for embedding.
 *
 * - Splits on line then sentence boundaries, retaining unpunctuated trailing
 *   content (markdown headings/lists) that the previous regex-only approach
 *   silently dropped.
 * - Adds ~overlapRatio of trailing context to the start of each new chunk so a
 *   fact straddling a chunk boundary stays retrievable from both sides.
 */
export function splitIntoChunks(
  text: string,
  maxChunkLength: number = 1500,
  overlapRatio: number = 0.12,
): string[] {
  const normalized = text.trim();
  if (!normalized) return [];

  const segments = splitIntoSegments(normalized).flatMap((segment) =>
    splitOversizedSegment(segment, maxChunkLength),
  );
  if (segments.length === 0) return [];

  // Overlap beyond half a chunk is meaningless and would let a chunk grow well
  // past ~2x maxChunkLength; clamp so the size bound holds for any caller, not
  // just the default ratio.
  const clampedOverlapRatio = Math.min(Math.max(overlapRatio, 0), 0.5);
  const overlapBudget = Math.max(0, Math.floor(maxChunkLength * clampedOverlapRatio));
  const chunks: string[] = [];
  let current: string[] = [];
  let currentLength = 0;

  for (const segment of segments) {
    const segmentCost = segment.length + 1; // account for the joining space

    if (currentLength + segmentCost > maxChunkLength && current.length > 0) {
      chunks.push(current.join(' ').trim());

      // Seed the next chunk with trailing segments from this one so
      // boundary-straddling content appears in both chunks. Always carry at
      // least the final segment (the actual boundary), then add earlier ones
      // while they fit the overlap budget.
      const overlap: string[] = [];
      let overlapLength = 0;
      if (overlapBudget > 0) {
        for (let i = current.length - 1; i >= 0; i -= 1) {
          const candidate = current[i];
          const exceedsBudget = overlapLength + candidate.length + 1 > overlapBudget;
          if (overlap.length > 0 && exceedsBudget) break;
          overlap.unshift(candidate);
          overlapLength += candidate.length + 1;
          if (exceedsBudget) break;
        }
      }
      current = overlap;
      currentLength = overlapLength;
    }

    current.push(segment);
    currentLength += segmentCost;
  }

  if (current.length > 0) {
    chunks.push(current.join(' ').trim());
  }

  return chunks.filter((chunk) => chunk.length > 0);
}

// --- Indexing a source ------------------------------------------------------

/** One stored chunk: the raw text (not the embedding input), its vector, metadata. */
export interface IndexRow {
  content: string;
  embedding: number[];
  metadata: Record<string, unknown>;
  contentHash: string;
}

/**
 * Where the index lives. `neonIndexStore` is the production adapter; tests
 * pass an in-memory one.
 */
export interface IndexStore {
  /** Content hashes already stored for `source` by `provider` (see below). */
  hashesFor(source: string, provider: string): Promise<string[]>;
  /** Delete every row for `source` and insert `rows`, all or nothing. */
  replace(source: string, rows: IndexRow[]): Promise<{ removed: number }>;
  /** Insert `rows`, leaving existing rows alone. */
  append(rows: IndexRow[]): Promise<void>;
}

/**
 * The embedding model for one run. `provider` is fixed for the run and stamped
 * on every row; `embed` must throw rather than answer from another provider,
 * because vectors from two models do not share a space.
 */
export interface Embedder {
  provider: string;
  embed(text: string): Promise<number[]>;
}

export interface CorpusSource {
  /** File name in `public/my-data`; stored as `metadata.source`. */
  name: string;
  text: string;
  /** Extra row metadata (slug, url, title, ...). `title` and `url` also go in the embedding preamble. */
  metadata: Record<string, unknown>;
}

export type IndexOutcome =
  | { status: 'skipped'; chunks: number }
  | { status: 'indexed'; chunks: number; removed: number }
  | { status: 'failed'; chunk: number; chunks: number; error: unknown };

/**
 * Bring one corpus source's rows up to date.
 *
 * - `replace` mode (the default) skips a source that is already fully
 *   embedded at this content hash by this provider; otherwise it embeds every
 *   chunk first and only then swaps the source's rows in one transaction.
 * - `append` mode embeds and inserts without looking at existing rows.
 *
 * If any chunk fails to embed, nothing is written and the old rows stay. A
 * partial source stored under the new hash would look complete to the skip
 * check, so the missing chunks would never be retried.
 */
export async function indexSource(
  source: CorpusSource,
  deps: { embedder: Embedder; store: IndexStore; mode?: 'replace' | 'append' },
): Promise<IndexOutcome> {
  const { embedder, store, mode = 'replace' } = deps;
  const contentHash = sourceContentHash(source.text);
  const chunks = splitIntoChunks(source.text);

  if (mode === 'replace') {
    const existing = await store.hashesFor(source.name, embedder.provider);
    if (shouldSkipSource(existing, contentHash)) {
      return { status: 'skipped', chunks: existing.length };
    }
  }

  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  const preamble = {
    title: str(source.metadata.title),
    type: slugFromCorpusFileName(source.name) === null ? 'page' : 'blog',
    url: str(source.metadata.url),
  };

  const rows: IndexRow[] = [];
  for (let i = 0; i < chunks.length; i++) {
    try {
      const embedding = await embedder.embed(buildEmbeddingInput(preamble, chunks[i]));
      rows.push({
        content: chunks[i],
        embedding,
        contentHash,
        metadata: {
          source: source.name,
          ...source.metadata,
          chunk_index: i,
          chunk_total: chunks.length,
          provider: embedder.provider,
          dimensions: embedding.length,
        },
      });
    } catch (error) {
      return { status: 'failed', chunk: i, chunks: chunks.length, error };
    }
  }

  if (mode === 'append') {
    await store.append(rows);
    return { status: 'indexed', chunks: rows.length, removed: 0 };
  }
  const { removed } = await store.replace(source.name, rows);
  return { status: 'indexed', chunks: rows.length, removed };
}

/** The `embeddings` table in Neon. */
export function neonIndexStore(): IndexStore {
  const sql = getDb();
  const insert = (row: IndexRow) =>
    sql`INSERT INTO embeddings (content, embedding, metadata, content_hash) VALUES (${row.content}, ${`[${row.embedding.join(',')}]`}::vector, ${JSON.stringify(row.metadata)}::jsonb, ${row.contentHash})`;

  return {
    async hashesFor(source, provider) {
      // Scoped to the provider: rows from another model (or old enough to
      // predate provider metadata) live in a different vector space, so they
      // must not count as "already embedded".
      const rows = await sql`SELECT content_hash FROM embeddings WHERE metadata->>'source' = ${source} AND metadata->>'provider' = ${provider} AND content_hash IS NOT NULL`;
      return (rows as Array<Record<string, unknown>>)
        .map((r) => (typeof r.content_hash === 'string' ? r.content_hash : ''))
        .filter(Boolean);
    },
    async replace(source, rows) {
      const [deleted] = await sql.transaction([
        sql`DELETE FROM embeddings WHERE metadata->>'source' = ${source} RETURNING id`,
        ...rows.map(insert),
      ]);
      return { removed: (deleted as unknown[]).length };
    },
    async append(rows) {
      if (rows.length > 0) await sql.transaction(rows.map(insert));
    },
  };
}

/**
 * Compose the text actually sent to the embedding model: a Title/Type/URL
 * preamble gives a mid-document chunk topical context it otherwise lacks. The
 * raw chunk (not this) is stored as the row's `content`, so full-text search and
 * snippets stay clean.
 */
function buildEmbeddingInput(
  meta: { title?: string; type?: string; url?: string },
  chunk: string,
): string {
  const preamble = [
    meta.title && `Title: ${meta.title}`,
    meta.type && `Type: ${meta.type}`,
    meta.url && `URL: ${meta.url}`,
  ]
    .filter(Boolean)
    .join('\n');

  return preamble ? `${preamble}\n\n${chunk}` : chunk;
}

/** Stable content hash for per-source incremental re-embedding. */
function sourceContentHash(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

/**
 * A source can be skipped on re-index only when it is already fully embedded at
 * the current hash — i.e. it has existing chunks and every one carries `newHash`.
 * Any stale chunk (older edit) or a never-indexed source forces a re-embed.
 */
function shouldSkipSource(existingHashes: string[], newHash: string): boolean {
  return existingHashes.length > 0 && existingHashes.every((h) => h === newHash);
}
