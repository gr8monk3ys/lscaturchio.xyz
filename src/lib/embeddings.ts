/**
 * Embeddings library with support for multiple providers
 *
 * Supports:
 * - Ollama (default, free, local) - uses nomic-embed-text model
 * - OpenAI (optional) - uses text-embedding-3-small (768 dimensions)
 *
 * Provider selection:
 * - If OPENAI_API_KEY is set, uses OpenAI
 * - Otherwise, uses Ollama (must be running locally)
 */

import { getDb } from './db';
import { createOllamaEmbedding, isOllamaAvailable, getEmbeddingDimensions } from './ollama';
import { logError, logWarn } from './logger';

// Configurable similarity threshold for embedding search (0-1, higher = stricter)
const EMBEDDING_MATCH_THRESHOLD = parseFloat(
  process.env.EMBEDDING_MATCH_THRESHOLD || '0.5'
);
const NO_EMBEDDING_PROVIDER_ERROR =
  'No embedding provider available. Set a valid OPENAI_API_KEY or start Ollama server.';

// Determine which provider to use
const USE_OPENAI = !!process.env.OPENAI_API_KEY;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Lazy OpenAI initialization (only if API key is set)
let openaiClient: import('openai').default | null = null;
let openaiEmbeddingsDisabled = false;
let hasWarnedOpenAIFallback = false;
let hasWarnedNoProvider = false;

async function getOpenAI() {
  if (!openaiClient && USE_OPENAI) {
    const OpenAI = (await import('openai')).default;
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      timeout: 30000,
      maxRetries: 1,
    });
  }
  return openaiClient;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function getErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const status = (error as { status?: unknown }).status;
  return typeof status === 'number' ? status : undefined;
}

function isOpenAIAuthOrConfigError(error: unknown): boolean {
  const status = getErrorStatus(error);
  if (status === 401 || status === 403) return true;

  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes('incorrect api key') ||
    message.includes('invalid api key') ||
    message.includes('api key not found') ||
    message.includes('authentication') ||
    message.includes('unauthorized') ||
    message.includes('forbidden')
  );
}

function isNoEmbeddingProviderError(error: unknown): boolean {
  return getErrorMessage(error).includes('No embedding provider available');
}

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

    const sentenceRegex = /[^.!?]+[.!?]+/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = sentenceRegex.exec(trimmedLine)) !== null) {
      const sentence = match[0].trim();
      if (sentence) segments.push(sentence);
      lastIndex = sentenceRegex.lastIndex;
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
 * Create an embedding vector from text
 * Uses OpenAI if API key is set, otherwise Ollama
 */
export async function createEmbedding(text: string): Promise<number[]> {
  if (USE_OPENAI && !openaiEmbeddingsDisabled) {
    const client = await getOpenAI();
    if (!client) throw new Error('OpenAI client not initialized');

    try {
      const response = await client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        dimensions: 768,
      });
      return response.data[0].embedding;
    } catch (error) {
      // Disable OpenAI embeddings on auth/config failures and fall back to Ollama.
      if (isOpenAIAuthOrConfigError(error)) {
        openaiEmbeddingsDisabled = true;
        if (!hasWarnedOpenAIFallback) {
          hasWarnedOpenAIFallback = true;
          if (!IS_PRODUCTION) {
            logWarn('OpenAI embeddings auth/config failed; falling back to Ollama', {
              component: 'embeddings',
              reason: getErrorMessage(error),
            });
          }
        }
      } else {
        throw error;
      }
    }
  }

  // Use Ollama
  const available = await isOllamaAvailable();
  if (!available) {
    if (!IS_PRODUCTION && !hasWarnedNoProvider) {
      hasWarnedNoProvider = true;
      logWarn(
        'No embedding provider available in non-production; semantic search will return empty results',
        {
          component: 'embeddings',
          openaiConfigured: USE_OPENAI,
          openaiDisabled: openaiEmbeddingsDisabled,
        }
      );
    }
    throw new Error(NO_EMBEDDING_PROVIDER_ERROR);
  }

  return createOllamaEmbedding(text);
}

/**
 * Get the embedding dimensions for the current provider
 */
export function getProviderEmbeddingDimensions(): number {
  if (USE_OPENAI && !openaiEmbeddingsDisabled) {
    return 768; // OpenAI text-embedding-3-small with dimensions=768
  }
  return getEmbeddingDimensions(); // Ollama model dimensions
}

/**
 * Get the current embedding provider name
 */
export function getEmbeddingProvider(): string {
  return USE_OPENAI && !openaiEmbeddingsDisabled ? 'openai' : 'ollama';
}

/**
 * Store an embedding in the database
 */
export async function storeEmbedding(
  text: string,
  embedding: number[],
  metadata: Record<string, unknown> = {}
) {
  const sql = getDb();
  const embeddingStr = `[${embedding.join(',')}]`;
  const metadataJson = JSON.stringify({
    ...metadata,
    provider: getEmbeddingProvider(),
    dimensions: embedding.length,
  });
  await sql`INSERT INTO embeddings (content, embedding, metadata) VALUES (${text}, ${embeddingStr}::vector, ${metadataJson}::jsonb)`;
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
 * Search for similar content using vector similarity
 */
export async function searchSimilarContent(query: string, limit: number = 5) {
  try {
    const embedding = await createEmbedding(query);
    const sql = getDb();
    const embeddingStr = `[${embedding.join(',')}]`;

    const rows = await sql`SELECT * FROM match_embeddings(${embeddingStr}::vector, ${EMBEDDING_MATCH_THRESHOLD}, ${limit})`;

    return rows;
  } catch (error) {
    if (isNoEmbeddingProviderError(error)) {
      // Expected when providers are unavailable; degrade gracefully without Sentry noise.
      return [];
    }
    logError('Search similar content failed', error, { component: 'embeddings' });
    // Return empty array on error to allow graceful degradation
    return [];
  }
}

// Alias for searchSimilarContent (used by some API routes)
export async function searchEmbeddings(query: string, limit: number = 5) {
  return searchSimilarContent(query, limit);
}

/**
 * Check if embeddings are available (provider is configured)
 */
export async function isEmbeddingsAvailable(): Promise<boolean> {
  if (USE_OPENAI && !openaiEmbeddingsDisabled) return true;
  return isOllamaAvailable();
}
