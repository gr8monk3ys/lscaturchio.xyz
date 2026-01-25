/**
 * Embeddings library with support for multiple providers
 *
 * Supports:
 * - Ollama (default, free, local) - uses nomic-embed-text model
 * - OpenAI (optional) - uses text-embedding-ada-002
 *
 * Provider selection:
 * - If OPENAI_API_KEY is set, uses OpenAI
 * - Otherwise, uses Ollama (must be running locally)
 */

import { getSupabase } from './supabase';
import { createOllamaEmbedding, isOllamaAvailable, getEmbeddingDimensions } from './ollama';
import { logError, logInfo } from './logger';

// Configurable similarity threshold for embedding search (0-1, higher = stricter)
const EMBEDDING_MATCH_THRESHOLD = parseFloat(
  process.env.EMBEDDING_MATCH_THRESHOLD || '0.5'
);

// Determine which provider to use
const USE_OPENAI = !!process.env.OPENAI_API_KEY;

// Lazy OpenAI initialization (only if API key is set)
let openaiClient: import('openai').default | null = null;

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
  if (USE_OPENAI) {
    const client = await getOpenAI();
    if (!client) throw new Error('OpenAI client not initialized');

    const response = await client.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    return response.data[0].embedding;
  }

  // Use Ollama
  const available = await isOllamaAvailable();
  if (!available) {
    throw new Error(
      'No embedding provider available. Either set OPENAI_API_KEY or start Ollama server.'
    );
  }

  return createOllamaEmbedding(text);
}

/**
 * Get the embedding dimensions for the current provider
 */
export function getProviderEmbeddingDimensions(): number {
  if (USE_OPENAI) {
    return 1536; // OpenAI ada-002
  }
  return getEmbeddingDimensions(); // Ollama model dimensions
}

/**
 * Get the current embedding provider name
 */
export function getEmbeddingProvider(): string {
  return USE_OPENAI ? 'openai' : 'ollama';
}

/**
 * Store an embedding in Supabase
 */
export async function storeEmbedding(
  text: string,
  embedding: number[],
  metadata: Record<string, unknown> = {}
) {
  const client = getSupabase();
  const { error } = await client.from('embeddings').insert({
    content: text,
    embedding,
    metadata: {
      ...metadata,
      provider: getEmbeddingProvider(),
      dimensions: embedding.length,
    },
  });

  if (error) throw error;
}

/**
 * Search for similar content using vector similarity
 */
export async function searchSimilarContent(query: string, limit: number = 5) {
  try {
    const embedding = await createEmbedding(query);
    const client = getSupabase();

    const { data, error } = await client.rpc('match_embeddings', {
      query_embedding: embedding,
      match_threshold: EMBEDDING_MATCH_THRESHOLD,
      match_count: limit,
    });

    if (error) {
      logError('Embedding search failed', error, { component: 'embeddings' });
      throw error;
    }

    return data || [];
  } catch (error) {
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
  if (USE_OPENAI) return true;
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
