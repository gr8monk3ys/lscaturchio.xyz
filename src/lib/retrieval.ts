/**
 * Retrieval over the corpus in `public/my-data`, answered in essays.
 *
 * Two questions are asked of the index, and this module is the only place that
 * knows how they are answered:
 *
 * - `relevantEssays(q)` — which essays are about this? (search, related posts)
 * - `groundingFor(q)` — what of my writing grounds an answer to this? (chat)
 *
 * Underneath both is one hybrid search: vector (cosine) and Postgres full-text
 * candidates fused with Reciprocal Rank Fusion. The index stores chunks, not
 * essays, and a lexical-only chunk has no cosine similarity at all; both facts
 * stay in here. Callers see essays ranked by the fused score — one ranking rule
 * for every surface — and a `similarity` that is 0 when an essay matched on
 * keywords alone.
 *
 * The ingestion side (chunking, storing, content hashes) is `./embedding-ingest`.
 */

import { getDb } from './db';
import { createEmbedding, isNoEmbeddingProviderError } from './embeddings';
import { logError } from './logger';
import type { EmbeddingMetadata } from '@/types/embeddings';

/** Default reciprocal-rank-fusion constant — dampens the contribution of low ranks. */
export const RRF_K = 60;

/** Slight lexical favouring, matching the hybrid-search literature for exact-term recall. */
const DEFAULT_RRF_WEIGHTS = { vector: 1, lexical: 1.1 } as const;

/** Top cosine similarity at/above which retrieval is treated as a solid grounding. */
export const STRONG_SIM = 0.55;
/** Floor below which (with no other grounding) retrieval is treated as "none". */
export const WEAK_SIM = 0.4;

export type Confidence = 'strong' | 'weak' | 'none';

// Grounding floor (0-1, higher = stricter): the top cosine similarity at/above
// which retrieval is considered "weak" grounding rather than "none". Also the
// established knob for "what counts as a match".
const EMBEDDING_MATCH_THRESHOLD = parseFloat(
  process.env.EMBEDDING_MATCH_THRESHOLD || '0.5'
);
// Vector candidates are fetched below the grounding floor so fusion + confidence
// gating have a wider pool to work with; weak/none is decided afterwards.
const RETRIEVAL_CANDIDATE_THRESHOLD = parseFloat(
  process.env.RETRIEVAL_CANDIDATE_THRESHOLD || '0.25'
);
const HYBRID_CANDIDATE_LIMIT = 12;

/** Passages chat grounds an answer on, and how many essays it points at. */
const GROUNDING_PASSAGES = 5;
const GROUNDING_CLOSEST = 3;

/** Snippets kept per essay — a preview, not a transcript. */
const MAX_SNIPPETS = 2;

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
export function reciprocalRankFusionScored<T>(
  lists: Array<RrfList<T>>,
  opts: { key: (item: T) => string; k?: number },
): Array<{ item: T; score: number }> {
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

  return Array.from(representatives.entries())
    .map(([id, item]) => ({ item, score: scores.get(id) ?? 0 }))
    .sort((a, b) => b.score - a.score);
}

export function reciprocalRankFusion<T>(
  lists: Array<RrfList<T>>,
  opts: { key: (item: T) => string; k?: number },
): T[] {
  return reciprocalRankFusionScored(lists, opts).map(({ item }) => item);
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

// --- The index, in chunks -------------------------------------------------

interface Passage {
  id: number;
  content: string;
  metadata: EmbeddingMetadata;
  /** Cosine similarity (0-1) for vector hits; null for lexical-only hits. */
  similarity: number | null;
}

interface RankedPassage extends Passage {
  /** Fused Reciprocal Rank Fusion score, for ranking. */
  score: number;
}

function toPassages(rows: unknown, withSimilarity: boolean): Passage[] {
  return (rows as Array<Record<string, unknown>>).map((r) => ({
    id: Number(r.id),
    content: typeof r.content === 'string' ? r.content : '',
    metadata: (r.metadata ?? {}) as EmbeddingMetadata,
    similarity:
      withSimilarity && typeof r.similarity === 'number' ? r.similarity : null,
  }));
}

async function vectorCandidates(query: string, limit: number): Promise<Passage[]> {
  const embedding = await createEmbedding(query); // throws if no provider
  const sql = getDb();
  const embeddingStr = `[${embedding.join(',')}]`;
  const rows = await sql`SELECT * FROM match_embeddings(${embeddingStr}::vector, ${RETRIEVAL_CANDIDATE_THRESHOLD}, ${limit})`;
  return toPassages(rows, true);
}

async function lexicalCandidates(query: string, limit: number): Promise<Passage[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT id, content, metadata
    FROM embeddings
    WHERE content_tsv @@ websearch_to_tsquery('english', ${query})
    ORDER BY ts_rank(content_tsv, websearch_to_tsquery('english', ${query})) DESC
    LIMIT ${limit}`;
  return toPassages(rows, false);
}

/**
 * The `limit` best passages for a query, fused across both legs. Never throws:
 * each leg degrades to empty on its own, so a missing embedding provider means
 * keyword-only retrieval and a missing database means no retrieval.
 */
async function hybridSearch(query: string, limit: number): Promise<RankedPassage[]> {
  const candidateLimit = Math.max(limit, HYBRID_CANDIDATE_LIMIT);

  const [vector, lexical] = await Promise.all([
    vectorCandidates(query, candidateLimit).catch((error) => {
      if (!isNoEmbeddingProviderError(error)) {
        logError('Vector search failed', error, { component: 'retrieval' });
      }
      return [] as Passage[];
    }),
    lexicalCandidates(query, candidateLimit).catch((error) => {
      logError('Lexical search failed', error, { component: 'retrieval' });
      return [] as Passage[];
    }),
  ]);

  return reciprocalRankFusionScored<Passage>(
    [
      { items: vector, weight: DEFAULT_RRF_WEIGHTS.vector },
      { items: lexical, weight: DEFAULT_RRF_WEIGHTS.lexical },
    ],
    { key: (p) => String(p.id) },
  )
    .slice(0, limit)
    .map(({ item, score }) => ({ ...item, score }));
}

// --- Essays ---------------------------------------------------------------

export interface RelevantEssay {
  url: string;
  /** Last path segment of `url`. */
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  /**
   * Best cosine similarity across the essay's matching passages, for display.
   * 0 when the essay matched on keywords alone — never use it to rank.
   */
  similarity: number;
  /**
   * The ranking signal: the essay's best fused score, relative to the top
   * essay for this query (which is 1). Lexical-only matches score here like
   * any other.
   */
  relevance: number;
  /** Up to two presentable passages, best first; may be empty. */
  snippets: string[];
}

/**
 * Turn an embedding chunk into something worth showing a reader.
 *
 * A snippet is a chunk shown verbatim, and the corpus is chunked for retrieval
 * rather than for preview. /lab showed two consequences: a chunk beginning with
 * the post's own title, so the excerpt read "…in Production People who've
 * shipped…" with the heading fused to the body; and a chunk that was a fenced
 * code block, so the representative excerpt for a prose essay was TypeScript.
 *
 * Fixed here rather than at index time on purpose. Rechunking means
 * regenerating embeddings, and a corpus whose embeddings no longer match its
 * text is a worse defect than an ugly snippet. This is the read layer — the
 * last place the text is still text. Returns null for chunks that are mostly
 * code.
 */
function presentableSnippet(content: string, title: string): string | null {
  let text = content.trim();
  if (!text) return null;

  // Opens with a fence, or contains a whole fenced block.
  if (/^`{3}/.test(text)) return null;
  if ((text.match(/`{3}/g) || []).length >= 2) return null;

  // A leading copy of the post's own title, which the reader can already see
  // directly above the snippet.
  if (title && title !== 'Untitled' && text.toLowerCase().startsWith(title.toLowerCase())) {
    text = text.slice(title.length).replace(/^[\s:.—-]+/, '');
  }

  return text.length > 0 ? text : null;
}

/**
 * Collapse ranked passages into essays, one per URL, in rank order. Passages
 * without a URL (the about, experience and services notes) belong to no essay
 * and are skipped. The first passage seen supplies the essay's metadata.
 */
function toEssays(passages: RankedPassage[]): RelevantEssay[] {
  const byUrl = new Map<string, RelevantEssay & { score: number }>();

  for (const passage of passages) {
    const url = typeof passage.metadata?.url === 'string' ? passage.metadata.url : '';
    if (!url) continue;

    let essay = byUrl.get(url);
    if (!essay) {
      const meta = passage.metadata;
      essay = {
        url,
        slug: url.split('/').pop() || '',
        title: typeof meta.title === 'string' && meta.title ? meta.title : 'Untitled',
        description: typeof meta.description === 'string' ? meta.description : '',
        date: typeof meta.date === 'string' ? meta.date : '',
        tags: Array.isArray(meta.tags) ? meta.tags : [],
        similarity: 0,
        relevance: 0,
        score: 0,
        snippets: [],
      };
      byUrl.set(url, essay);
    }

    essay.similarity = Math.max(essay.similarity, passage.similarity ?? 0);
    essay.score = Math.max(essay.score, passage.score);

    const snippet = presentableSnippet(passage.content, essay.title);
    if (snippet && essay.snippets.length < MAX_SNIPPETS && !essay.snippets.includes(snippet)) {
      essay.snippets.push(snippet);
    }
  }

  const essays = Array.from(byUrl.values()).sort((a, b) => b.score - a.score);
  const top = essays[0]?.score ?? 0;
  return essays.map(({ score, ...essay }) => ({
    ...essay,
    relevance: top > 0 ? score / top : 0,
  }));
}

/**
 * Essays relevant to `query`, best first, one entry per essay.
 *
 * `limit` bounds the passages ranked, so at most `limit` essays come back —
 * fewer when one essay holds several of the best passages. Never throws; an
 * unreachable index or provider yields fewer (or no) essays.
 */
export async function relevantEssays(
  query: string,
  { limit }: { limit: number },
): Promise<RelevantEssay[]> {
  return toEssays(await hybridSearch(query, limit));
}

// --- Grounding for chat ---------------------------------------------------

export interface Grounding {
  /** Text of the best-matching passages, essays and other notes alike. */
  context: string;
  /** How well the corpus grounds the question. */
  confidence: Confidence;
  /** Closest essays to point the reader at, one per essay. */
  closest: Array<{ title: string; url: string }>;
}

/**
 * What of the corpus grounds an answer to `query`. Unlike `relevantEssays`, the
 * context draws on every source — the about and experience notes answer most
 * biographical questions and belong to no essay. Never throws.
 */
export async function groundingFor(query: string): Promise<Grounding> {
  const passages = await hybridSearch(query, GROUNDING_PASSAGES);

  return {
    context: passages.map((p) => p.content).join('\n\n'),
    confidence: assessConfidence(passages, {
      weak: EMBEDDING_MATCH_THRESHOLD,
      strong: STRONG_SIM,
    }),
    closest: toEssays(passages)
      .slice(0, GROUNDING_CLOSEST)
      .map(({ title, url }) => ({ title, url })),
  };
}
