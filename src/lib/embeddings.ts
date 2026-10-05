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

import { createOllamaEmbedding, isOllamaAvailable, getEmbeddingDimensions } from './ollama';
import { logWarn } from './logger';
import { getErrorMessage, isOpenAIAuthOrConfigError } from './openai-errors';

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

/** True for the error `createEmbedding` throws when neither provider is reachable. */
export function isNoEmbeddingProviderError(error: unknown): boolean {
  return getErrorMessage(error).includes('No embedding provider available');
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
 * Check if embeddings are available (provider is configured)
 */
export async function isEmbeddingsAvailable(): Promise<boolean> {
  if (USE_OPENAI && !openaiEmbeddingsDisabled) return true;
  return isOllamaAvailable();
}
