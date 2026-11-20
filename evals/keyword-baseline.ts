/**
 * An offline stand-in for retrieval: BM25 over `public/my-data`, chunked with
 * the same `splitIntoChunks` the real index uses.
 *
 * This is NOT the production retriever. That one is hybrid (pgvector cosine
 * plus Postgres full-text, fused with RRF) and lives in Neon, so it needs
 * DATABASE_URL — `retrieval.eval.ts` measures it. This baseline exists so that
 * something about retrieval can be checked with no database and no key: that
 * each question is findable from its own words, and that a corpus change has
 * not buried an essay the cases depend on.
 */

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { splitIntoChunks } from '@/lib/embedding-ingest';
import { corpusFileName, slugFromCorpusFileName } from '@/lib/retrieval-corpus';

const CORPUS_DIR = path.join(process.cwd(), 'public', 'my-data');

const K1 = 1.2;
const B = 0.75;

const STOPWORDS = new Set(
  (
    'a an and are as at be but by did do does for from had has have he his how i if in into ' +
    'is it its lorenzo me my no not of on or say says said so than that the their them then ' +
    'there these they this to was what when where which who whose why will with would you your ' +
    'about according actually first make makes suggest use now'
  ).split(' '),
);

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9+]+/g) ?? []).filter(
    (token) => token.length > 1 && !STOPWORDS.has(token),
  );
}

type Chunk = { slug: string | null; terms: Map<string, number>; length: number };

/** One essay's corpus document, as the indexer reads it. */
export function corpusText(slug: string): string {
  return readFileSync(path.join(CORPUS_DIR, corpusFileName(slug)), 'utf-8');
}

/** Every `.md`/`.txt` file at the top of the corpus folder, chunked as the indexer chunks it. */
function loadChunks(): Chunk[] {
  const files = readdirSync(CORPUS_DIR).filter((f) => f.endsWith('.md') || f.endsWith('.txt'));
  return files.flatMap((file) => {
    const slug = slugFromCorpusFileName(file);
    const text = readFileSync(path.join(CORPUS_DIR, file), 'utf-8');
    return splitIntoChunks(text).map((chunk) => {
      const tokens = tokenize(chunk);
      const terms = new Map<string, number>();
      for (const token of tokens) terms.set(token, (terms.get(token) ?? 0) + 1);
      return { slug, terms, length: tokens.length };
    });
  });
}

let index: { chunks: Chunk[]; df: Map<string, number>; avgLength: number } | null = null;

function getIndex() {
  if (index) return index;
  const chunks = loadChunks();
  const df = new Map<string, number>();
  for (const chunk of chunks) {
    for (const term of chunk.terms.keys()) df.set(term, (df.get(term) ?? 0) + 1);
  }
  const avgLength = chunks.reduce((sum, c) => sum + c.length, 0) / Math.max(chunks.length, 1);
  index = { chunks, df, avgLength };
  return index;
}

/** Essay slugs for `query`, best first, ranked by each essay's best chunk. */
export function keywordSearch(query: string, limit = 5): string[] {
  const { chunks, df, avgLength } = getIndex();
  const terms = Array.from(new Set(tokenize(query)));
  const n = chunks.length;

  const best = new Map<string, number>();
  for (const chunk of chunks) {
    if (!chunk.slug) continue; // about/experience/services notes belong to no essay
    let score = 0;
    for (const term of terms) {
      const tf = chunk.terms.get(term);
      if (!tf) continue;
      const docs = df.get(term) ?? 0;
      const idf = Math.log(1 + (n - docs + 0.5) / (docs + 0.5));
      score += (idf * tf * (K1 + 1)) / (tf + K1 * (1 - B + (B * chunk.length) / avgLength));
    }
    if (score > (best.get(chunk.slug) ?? 0)) best.set(chunk.slug, score);
  }

  return Array.from(best.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([slug]) => slug);
}
