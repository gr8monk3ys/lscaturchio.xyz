import { logError, logInfo } from '@/lib/logger';
import { createOllamaChatCompletion, isOllamaAvailable } from '@/lib/ollama';

export const USE_OPENAI = !!process.env.OPENAI_API_KEY;
export const USE_OPENROUTER = !!process.env.OPENROUTER_API_KEY;

const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';
const OPENAI_FALLBACK_CHAT_MODEL =
  process.env.OPENAI_FALLBACK_CHAT_MODEL || 'gpt-4.1-nano';
const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const OPENROUTER_CHAT_MODEL =
  process.env.OPENROUTER_CHAT_MODEL || 'openai/gpt-4.1-nano';
const OPENROUTER_FALLBACK_CHAT_MODEL =
  process.env.OPENROUTER_FALLBACK_CHAT_MODEL || '';
const OPENROUTER_SITE_URL =
  process.env.OPENROUTER_SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://lscaturchio.xyz';
const OPENROUTER_APP_NAME = process.env.OPENROUTER_APP_NAME || 'lscaturchio.xyz';
const OLLAMA_DEFAULT_MODEL = 'llama3.2';

let openaiClient: import('openai').default | null = null;
let openrouterClient: import('openai').default | null = null;
let openaiChatDisabled = false;

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

async function getOpenRouter() {
  if (!openrouterClient && USE_OPENROUTER) {
    const OpenAI = (await import('openai')).default;

    const defaultHeaders: Record<string, string> = {};
    if (OPENROUTER_SITE_URL.trim()) {
      defaultHeaders['HTTP-Referer'] = OPENROUTER_SITE_URL.trim();
    }
    if (OPENROUTER_APP_NAME.trim()) {
      defaultHeaders['X-Title'] = OPENROUTER_APP_NAME.trim();
    }

    openrouterClient = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY!,
      baseURL: OPENROUTER_BASE_URL,
      timeout: 30000,
      maxRetries: 1,
      defaultHeaders,
    });
  }
  return openrouterClient;
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
    message.includes('forbidden') ||
    message.includes('account associated with this api key has been deactivated')
  );
}

function uniqueModelCandidates(primary: string, fallback?: string): string[] {
  const candidates = [primary, fallback ?? '']
    .map((m) => m.trim())
    .filter((m) => m.length > 0);
  return Array.from(new Set(candidates));
}

export type ChatProvider = 'openai' | 'openrouter' | 'ollama' | 'fallback';

export type ProviderResult = {
  answer: string;
  provider: ChatProvider;
  model: string;
  usedFallbackModel: boolean;
};

type OpenAICompatibleProvider = 'openai' | 'openrouter';

async function tryOpenAICompatibleProvider({
  provider,
  client,
  systemPrompt,
  query,
  primaryModel,
  fallbackModel,
}: {
  provider: OpenAICompatibleProvider;
  client: import('openai').default;
  systemPrompt: string;
  query: string;
  primaryModel: string;
  fallbackModel?: string;
}): Promise<{ answer: string; modelUsed: string; usedFallbackModel: boolean } | null> {
  const models = uniqueModelCandidates(primaryModel, fallbackModel);

  for (let i = 0; i < models.length; i += 1) {
    const model = models[i];
    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
        temperature: 0.4,
        max_tokens: 1000,
      });

      const answer = completion.choices[0].message?.content || null;
      if (answer) {
        const usedFallbackModel = model !== primaryModel;
        if (usedFallbackModel) {
          logInfo(`Using ${provider} fallback chat model`, {
            component: 'chat',
            provider,
            model,
          });
        }
        return { answer, modelUsed: model, usedFallbackModel };
      }
    } catch (error) {
      if (provider === 'openai' && isOpenAIAuthOrConfigError(error)) {
        openaiChatDisabled = true;
        return null;
      }

      const isLastModel = i === models.length - 1;
      logError(
        isLastModel
          ? `${provider} chat failed; falling back`
          : `${provider} chat model failed; trying fallback model`,
        error,
        { component: 'chat', provider, model },
      );
    }
  }

  return null;
}

async function tryOpenAI(systemPrompt: string, query: string): Promise<ProviderResult | null> {
  if (!USE_OPENAI || openaiChatDisabled) return null;

  try {
    const client = await getOpenAI();
    if (!client) return null;

    const result = await tryOpenAICompatibleProvider({
      provider: 'openai',
      client,
      systemPrompt,
      query,
      primaryModel: OPENAI_CHAT_MODEL,
      fallbackModel: OPENAI_FALLBACK_CHAT_MODEL,
    });
    if (!result) return null;

    return {
      answer: result.answer,
      provider: 'openai',
      model: result.modelUsed,
      usedFallbackModel: result.usedFallbackModel,
    };
  } catch (error) {
    if (isOpenAIAuthOrConfigError(error)) {
      openaiChatDisabled = true;
    } else {
      logError('OpenAI chat failed; falling back', error, {
        component: 'chat',
        model: OPENAI_CHAT_MODEL,
      });
    }
    return null;
  }
}

async function tryOpenRouter(systemPrompt: string, query: string): Promise<ProviderResult | null> {
  if (!USE_OPENROUTER) return null;

  try {
    const client = await getOpenRouter();
    if (!client) return null;

    const result = await tryOpenAICompatibleProvider({
      provider: 'openrouter',
      client,
      systemPrompt,
      query,
      primaryModel: OPENROUTER_CHAT_MODEL,
      fallbackModel: OPENROUTER_FALLBACK_CHAT_MODEL,
    });
    if (!result) return null;

    return {
      answer: result.answer,
      provider: 'openrouter',
      model: result.modelUsed,
      usedFallbackModel: result.usedFallbackModel,
    };
  } catch (error) {
    logError('OpenRouter chat failed; falling back', error, {
      component: 'chat',
      model: OPENROUTER_CHAT_MODEL,
      baseURL: OPENROUTER_BASE_URL,
    });
    return null;
  }
}

async function tryOllama(systemPrompt: string, query: string): Promise<ProviderResult | null> {
  const available = await isOllamaAvailable();
  if (!available) return null;

  const model = process.env.OLLAMA_CHAT_MODEL || OLLAMA_DEFAULT_MODEL;

  try {
    logInfo('Using Ollama for chat', { component: 'chat', model });
    const answer = await createOllamaChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      { temperature: 0.4, maxTokens: 1000 },
    );
    if (!answer) return null;

    return { answer, provider: 'ollama', model, usedFallbackModel: false };
  } catch (error) {
    logError('Ollama chat failed; using fallback response', error, { component: 'chat' });
    return null;
  }
}

export async function generateChatAnswer(
  systemPrompt: string,
  query: string,
): Promise<ProviderResult | null> {
  return (
    (await tryOpenAI(systemPrompt, query)) ||
    (await tryOpenRouter(systemPrompt, query)) ||
    (await tryOllama(systemPrompt, query))
  );
}
