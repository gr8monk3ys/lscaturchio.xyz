import { logError, logInfo } from '@/lib/logger';
import { createOllamaChatCompletion, isOllamaAvailable } from '@/lib/ollama';
import {
  disableOpenAIOnAuthError,
  getOpenAIClient,
  getOpenRouterClient,
} from '@/lib/ai-provider';

const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';
const OPENAI_FALLBACK_CHAT_MODEL =
  process.env.OPENAI_FALLBACK_CHAT_MODEL || 'gpt-4.1-nano';
const OPENROUTER_CHAT_MODEL =
  process.env.OPENROUTER_CHAT_MODEL || 'openai/gpt-4.1-nano';
const OPENROUTER_FALLBACK_CHAT_MODEL =
  process.env.OPENROUTER_FALLBACK_CHAT_MODEL || '';
const OLLAMA_DEFAULT_MODEL = 'llama3.2';

function uniqueModelCandidates(primary: string, fallback?: string): string[] {
  const candidates = [primary, fallback ?? '']
    .map((m) => m.trim())
    .filter((m) => m.length > 0);
  return Array.from(new Set(candidates));
}

/**
 * The providers the ladder in `generateChatAnswer` can actually answer with,
 * in the order it tries them (plus the no-provider fallback). This tuple is
 * the single source of truth: `ChatProvider` is derived from it, so a name
 * that is not in here cannot be a provider anywhere in the app.
 */
export const CHAT_PROVIDERS = ['openai', 'openrouter', 'ollama', 'fallback'] as const;

export type ChatProvider = (typeof CHAT_PROVIDERS)[number];

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
      if (provider === 'openai' && disableOpenAIOnAuthError(error)) {
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
  try {
    const client = await getOpenAIClient();
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
    if (!disableOpenAIOnAuthError(error)) {
      logError('OpenAI chat failed; falling back', error, {
        component: 'chat',
        model: OPENAI_CHAT_MODEL,
      });
    }
    return null;
  }
}

async function tryOpenRouter(systemPrompt: string, query: string): Promise<ProviderResult | null> {
  try {
    const client = await getOpenRouterClient();
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
