import { createHash } from 'crypto';

/**
 * Hybrid retrieval helpers: pure, testable building blocks for fusing vector and
 * lexical search results, gauging grounding confidence, and incremental
 * re-embedding. The DB-backed `hybridSearch` (which composes these) lives
 * alongside once wired to `getDb`.
 */

/** Default reciprocal-rank-fusion constant — dampens the contribution of low ranks. */
export const RRF_K = 60;

/** Slight lexical favouring, matching the hybrid-search literature for exact-term recall. */
export const DEFAULT_RRF_WEIGHTS = { vector: 1, lexical: 1.1 } as const;

/** Top cosine similarity at/above which retrieval is treated as a solid grounding. */
export const STRONG_SIM = 0.55;
/** Floor below which (with no other grounding) retrieval is treated as "none". */
export const WEAK_SIM = 0.4;

export type Confidence = 'strong' | 'weak' | 'none';

interface RrfList<T> {
  items: T[];
  /** Relative weight of this list's contributions (default 1). */
  weight?: number;
}

/**
 * Fuse several independently-ranked result lists into one ranking using
 * Reciprocal Rank Fusion: each list contributes `weight / (k + rank)` to an
 * item's score, summed across lists. Items are deduped by `key`; the first list
 * in which a key appears supplies the representative object (so callers should
 * pass the richer list — e.g. the vector hits that carry `similarity` — first).
 */
export function reciprocalRankFusion<T>(
  lists: Array<RrfList<T>>,
  opts: { key: (item: T) => string; k?: number },
): T[] {
  const k = opts.k ?? RRF_K;
  const scores = new Map<string, number>();
  const representatives = new Map<string, T>();

  for (const { items, weight = 1 } of lists) {
    items.forEach((item, rank) => {
      const id = opts.key(item);
      scores.set(id, (scores.get(id) ?? 0) + weight / (k + rank));
      if (!representatives.has(id)) representatives.set(id, item);
    });
  }

  return [...representatives.entries()]
    .sort((a, b) => (scores.get(b[0]) ?? 0) - (scores.get(a[0]) ?? 0))
    .map(([, item]) => item);
}

/**
 * Gauge how well the retrieved set grounds an answer, from the top cosine
 * similarity. Lexical-only hits (no cosine) count as weak grounding — an exact
 * keyword match is real, just not semantically strong. Used to decide whether
 * the chat answers from context or admits it hasn't covered the topic.
 */
export function assessConfidence(
  results: Array<{ similarity?: number | null }>,
  opts: { strong?: number; weak?: number } = {},
): Confidence {
  if (results.length === 0) return 'none';

  const strong = opts.strong ?? STRONG_SIM;
  const weak = opts.weak ?? WEAK_SIM;

  const cosines = results
    .map((r) => r.similarity)
    .filter((s): s is number => typeof s === 'number');
  const top = cosines.length > 0 ? Math.max(...cosines) : 0;

  if (top >= strong) return 'strong';
  if (top >= weak || results.some((r) => r.similarity == null)) return 'weak';
  return 'none';
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
