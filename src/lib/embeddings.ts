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
import { logError, logInfo, logWarn } from './logger';

// Configurable similarity threshold for embedding search (0-1, higher = stricter)
const EMBEDDING_MATCH_THRESHOLD = parseFloat(
  process.env.EMBEDDING_MATCH_THRESHOLD || '0.5'
);

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

/**
 * Split text into chunks for embedding
 */
export function splitIntoChunks(text: string, maxChunkLength: number = 1500): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxChunkLength) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence;
    } else {
      currentChunk += ' ' + sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
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
      // In non-production, avoid repeated noisy invalid-key failures and fall back to Ollama.
      if (!IS_PRODUCTION && isOpenAIAuthOrConfigError(error)) {
        openaiEmbeddingsDisabled = true;
        if (!hasWarnedOpenAIFallback) {
          hasWarnedOpenAIFallback = true;
          logWarn('OpenAI embeddings auth/config failed; falling back to Ollama in non-production', {
            component: 'embeddings',
            reason: getErrorMessage(error),
          });
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
    throw new Error(
      'No embedding provider available. Set a valid OPENAI_API_KEY or start Ollama server.'
    );
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
    const message = getErrorMessage(error);
    if (!IS_PRODUCTION && message.includes('No embedding provider available')) {
      // Already warned once in createEmbedding; keep non-production logs quiet.
      return [];
    }
    logError('Search similar content failed', error, { component: 'embeddings' });
    // Return empty array on error to allow graceful degradation
    return [];
  }
}

// Alias for searchSimilarContent (used by some API routes)
export const searchEmbeddings = searchSimilarContent;

/**
 * Check if embeddings are available (provider is configured)
 */
export async function isEmbeddingsAvailable(): Promise<boolean> {
  if (USE_OPENAI && !openaiEmbeddingsDisabled) return true;
  return isOllamaAvailable();
}

/**
 * Log current embedding configuration
 */
export function logEmbeddingConfig(): void {
  logInfo(`Embedding provider: ${getEmbeddingProvider()}`, {
    component: 'embeddings',
    dimensions: getProviderEmbeddingDimensions(),
    threshold: EMBEDDING_MATCH_THRESHOLD,
  });
}
