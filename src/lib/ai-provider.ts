/**
 * The one place OpenAI-compatible clients are built, and the one place that
 * remembers OpenAI's key has been refused.
 *
 * Chat, embeddings and summaries all spend the same OPENAI_API_KEY. When that
 * key is missing, wrong or deactivated, every consumer is equally stuck, so
 * the first auth/config failure any of them sees turns OpenAI off for the rest
 * of the process: chat and embeddings fall through to their next provider
 * without paying for another refused request, and summaries fail fast.
 */

import type OpenAI from 'openai';
import { logWarn } from './logger';
import { getErrorMessage, isOpenAIAuthOrConfigError } from './openai-errors';

const CLIENT_OPTIONS = { timeout: 30_000, maxRetries: 1 } as const;

const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const OPENROUTER_SITE_URL =
  process.env.OPENROUTER_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://lscaturchio.xyz';
const OPENROUTER_APP_NAME = process.env.OPENROUTER_APP_NAME || 'lscaturchio.xyz';

let openaiClient: OpenAI | null = null;
let openrouterClient: OpenAI | null = null;
let openaiDisabled = false;

async function construct(options: ConstructorParameters<typeof OpenAI>[0]): Promise<OpenAI> {
  const { default: OpenAIClient } = await import('openai');
  return new OpenAIClient({ ...CLIENT_OPTIONS, ...options });
}

/** OpenAI has a key and has not refused it. */
export function isOpenAIEnabled(): boolean {
  return !!process.env.OPENAI_API_KEY && !openaiDisabled;
}

/** The shared OpenAI client, or null when there is no key or it was refused. */
export async function getOpenAIClient(): Promise<OpenAI | null> {
  if (!isOpenAIEnabled()) return null;
  openaiClient ??= await construct({ apiKey: process.env.OPENAI_API_KEY });
  return openaiClient;
}

/**
 * Report an error from an OpenAI call. An auth/config error turns OpenAI off
 * for every consumer and returns true, meaning "fall back, do not retry"; any
 * other error returns false and changes nothing.
 */
export function disableOpenAIOnAuthError(error: unknown): boolean {
  if (!isOpenAIAuthOrConfigError(error)) return false;
  if (!openaiDisabled) {
    openaiDisabled = true;
    if (process.env.NODE_ENV !== 'production') {
      logWarn('OpenAI auth/config failed; disabling OpenAI for this process', {
        component: 'ai-provider',
        reason: getErrorMessage(error),
      });
    }
  }
  return true;
}

/** The shared OpenRouter client (OpenAI-compatible), or null without a key. */
export async function getOpenRouterClient(): Promise<OpenAI | null> {
  if (!process.env.OPENROUTER_API_KEY) return null;
  if (!openrouterClient) {
    const defaultHeaders: Record<string, string> = {};
    if (OPENROUTER_SITE_URL.trim()) {
      defaultHeaders['HTTP-Referer'] = OPENROUTER_SITE_URL.trim();
    }
    if (OPENROUTER_APP_NAME.trim()) {
      defaultHeaders['X-Title'] = OPENROUTER_APP_NAME.trim();
    }
    openrouterClient = await construct({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: OPENROUTER_BASE_URL,
      defaultHeaders,
    });
  }
  return openrouterClient;
}
