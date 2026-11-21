/**
 * What the live evals need, read from the same variables the app reads.
 *
 * Nothing here loads a `.env` file: `bun run eval` does that itself (Bun loads
 * `.env`, `.env.local` and friends before running a script), and a plain shell
 * export works too.
 */

import { isOllamaAvailable } from '@/lib/ollama';

/** Retrieval reads Neon; without it every question gets no grounding at all. */
export function missingDatabase(): string | null {
  return process.env.DATABASE_URL
    ? null
    : 'DATABASE_URL is not set, so retrieval has no index to search.';
}

/**
 * The chat answers with the first of OpenAI, OpenRouter or a local Ollama that
 * is available, in that order (src/lib/chat/providers.ts). Ollama is free and
 * local; the other two bill the key they are given.
 */
export async function missingChatModel(): Promise<string | null> {
  if (process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY) return null;
  if (await isOllamaAvailable()) return null;
  return 'No chat model: set OPENAI_API_KEY or OPENROUTER_API_KEY, or start Ollama (OLLAMA_BASE_URL).';
}

export function announceSkip(evalName: string, reasons: string[]): void {
  console.warn(`[eval] Skipping "${evalName}": ${reasons.join(' ')}`);
}
