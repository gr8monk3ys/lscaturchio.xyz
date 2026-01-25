/**
 * Ollama client for local open source LLM inference
 *
 * Ollama runs locally and supports many models like Llama, Mistral, etc.
 * Install: https://ollama.ai/download
 *
 * Required models:
 *   ollama pull nomic-embed-text  # For embeddings (384 dimensions)
 *   ollama pull llama3.2          # For chat (or mistral, gemma2, etc.)
 */

import { logError, logInfo } from './logger';

// Default Ollama server URL (can be overridden via env)
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

// Default models (can be overridden via env)
const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';
const OLLAMA_CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL || 'llama3.2';

interface OllamaEmbeddingResponse {
  embedding: number[];
}

interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OllamaChatResponse {
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

/**
 * Check if Ollama server is running
 */
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Create an embedding using Ollama
 * Uses nomic-embed-text model by default (384 dimensions)
 */
export async function createOllamaEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_EMBED_MODEL,
      prompt: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama embedding failed: ${error}`);
  }

  const data: OllamaEmbeddingResponse = await response.json();
  return data.embedding;
}

/**
 * Generate a chat completion using Ollama
 */
export async function createOllamaChatCompletion(
  messages: OllamaChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  const model = options.model || OLLAMA_CHAT_MODEL;

  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: {
        temperature: options.temperature ?? 0.4,
        num_predict: options.maxTokens ?? 1000,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama chat failed: ${error}`);
  }

  const data: OllamaChatResponse = await response.json();
  return data.message.content;
}

/**
 * Pull a model if not already available
 */
export async function pullModel(model: string): Promise<void> {
  logInfo(`Pulling Ollama model: ${model}`, { component: 'ollama' });

  const response = await fetch(`${OLLAMA_BASE_URL}/api/pull`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: model, stream: false }),
  });

  if (!response.ok) {
    const error = await response.text();
    logError(`Failed to pull model ${model}`, new Error(error), { component: 'ollama' });
    throw new Error(`Failed to pull model: ${error}`);
  }

  logInfo(`Successfully pulled model: ${model}`, { component: 'ollama' });
}

/**
 * List available models
 */
export async function listModels(): Promise<string[]> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to list Ollama models');
  }

  const data = await response.json();
  return data.models?.map((m: { name: string }) => m.name) || [];
}

/**
 * Get embedding dimensions for a model
 * Different models have different dimensions:
 * - nomic-embed-text: 768 (default, good quality/speed balance)
 * - all-minilm: 384 (smaller, faster)
 * - mxbai-embed-large: 1024 (higher quality)
 *
 * Important: The database is configured for 768 dimensions (nomic-embed-text).
 * If using a different model, update the database migration.
 */
export function getEmbeddingDimensions(model: string = OLLAMA_EMBED_MODEL): number {
  const dimensions: Record<string, number> = {
    'nomic-embed-text': 768,
    'nomic-embed-text:latest': 768,
    'all-minilm': 384,
    'all-minilm:latest': 384,
    'mxbai-embed-large': 1024,
    'mxbai-embed-large:latest': 1024,
    'snowflake-arctic-embed': 1024,
    'snowflake-arctic-embed:latest': 1024,
  };

  // Default to 768 (nomic-embed-text) if model not found
  return dimensions[model] || 768;
}
