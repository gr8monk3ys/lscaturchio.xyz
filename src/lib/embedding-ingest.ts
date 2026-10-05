/**
 * Ingestion side of the retrieval corpus: how `public/my-data` becomes rows in
 * the `embeddings` table. Used by `scripts/generate-embeddings.ts`; nothing at
 * request time imports this. The query side lives in `./retrieval`.
 */

import { createHash } from 'crypto';
import { getDb } from './db';
import { getEmbeddingProvider } from './embeddings';

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

/**
 * Store an embedding in the database
 */
export async function storeEmbedding(
  text: string,
  embedding: number[],
  metadata: Record<string, unknown> = {},
  contentHash: string | null = null,
) {
  const sql = getDb();
  const embeddingStr = `[${embedding.join(',')}]`;
  const metadataJson = JSON.stringify({
    ...metadata,
    provider: getEmbeddingProvider(),
    dimensions: embedding.length,
  });
  await sql`INSERT INTO embeddings (content, embedding, metadata, content_hash) VALUES (${text}, ${embeddingStr}::vector, ${metadataJson}::jsonb, ${contentHash})`;
}

/**
 * Delete embeddings for a given source.
 * Used by ingestion scripts to make reruns idempotent.
 */
export async function deleteEmbeddingsBySource(source: string): Promise<number> {
  const sql = getDb();
  const rows = await sql`DELETE FROM embeddings WHERE metadata->>'source' = ${source} RETURNING id`;
  return rows.length;
}

/**
 * Content hashes already stored for a source, for incremental re-embedding.
 * Empty when the source was never indexed (or predates content_hash).
 *
 * Scoped to the CURRENT provider: query vectors and stored vectors must share
 * an embedding space, so rows embedded by a different provider (or rows old
 * enough to predate provider metadata) must not count as "already embedded" —
 * otherwise switching providers leaves the whole index in the wrong space
 * while every source reports unchanged.
 */
export async function getSourceContentHashes(source: string): Promise<string[]> {
  const sql = getDb();
  const provider = getEmbeddingProvider();
  const rows = await sql`SELECT content_hash FROM embeddings WHERE metadata->>'source' = ${source} AND metadata->>'provider' = ${provider} AND content_hash IS NOT NULL`;
  return (rows as Array<Record<string, unknown>>)
    .map((r) => (typeof r.content_hash === 'string' ? r.content_hash : ''))
    .filter(Boolean);
}

/**
 * Compose the text actually sent to the embedding model: a Title/Type/URL
 * preamble gives a mid-document chunk topical context it otherwise lacks. The
 * raw chunk (not this) is stored as the row's `content`, so full-text search and
 * snippets stay clean.
 */
export function buildEmbeddingInput(
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
export function sourceContentHash(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

/**
 * A source can be skipped on re-index only when it is already fully embedded at
 * the current hash — i.e. it has existing chunks and every one carries `newHash`.
 * Any stale chunk (older edit) or a never-indexed source forces a re-embed.
 */
export function shouldSkipSource(existingHashes: string[], newHash: string): boolean {
  return existingHashes.length > 0 && existingHashes.every((h) => h === newHash);
}
