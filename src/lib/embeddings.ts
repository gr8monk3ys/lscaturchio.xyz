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
import { getErrorMessage } from './openai-errors';
import { disableOpenAIOnAuthError, getOpenAIClient, isOpenAIEnabled } from './ai-provider';

const NO_EMBEDDING_PROVIDER_ERROR =
  'No embedding provider available. Set a valid OPENAI_API_KEY or start Ollama server.';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

let hasWarnedNoProvider = false;

/** True for the error `createEmbedding` throws when neither provider is reachable. */
export function isNoEmbeddingProviderError(error: unknown): boolean {
  return getErrorMessage(error).includes('No embedding provider available');
}

/**
 * Create an embedding vector from text
 * Uses OpenAI if API key is set, otherwise Ollama
 */
export async function createEmbedding(text: string): Promise<number[]> {
  const client = await getOpenAIClient();
  if (client) {
    try {
      const response = await client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        dimensions: 768,
      });
      return response.data[0].embedding;
    } catch (error) {
      // An auth/config failure turns OpenAI off everywhere; fall back to Ollama.
      if (!disableOpenAIOnAuthError(error)) throw error;
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
          openaiConfigured: !!process.env.OPENAI_API_KEY,
          openaiDisabled: !!process.env.OPENAI_API_KEY && !isOpenAIEnabled(),
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
  if (isOpenAIEnabled()) {
    return 768; // OpenAI text-embedding-3-small with dimensions=768
  }
  return getEmbeddingDimensions(); // Ollama model dimensions
}

/**
 * Get the current embedding provider name
 */
export function getEmbeddingProvider(): string {
  return isOpenAIEnabled() ? 'openai' : 'ollama';
}

/**
 * Check if embeddings are available (provider is configured)
 */
export async function isEmbeddingsAvailable(): Promise<boolean> {
  if (isOpenAIEnabled()) return true;
  return isOllamaAvailable();
}
