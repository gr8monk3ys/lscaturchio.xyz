/**
 * AI Client - Unified interface for multiple AI providers
 *
 * Usage:
 *   import { ai } from '@/lib/ai';
 *
 *   // Use default provider (configured via AI_PROVIDER env var)
 *   const response = await ai.chat([{ role: 'user', content: 'Hello' }]);
 *
 *   // Use specific provider
 *   const response = await ai.chat([{ role: 'user', content: 'Hello' }], {
 *     provider: 'anthropic',
 *     model: 'claude-sonnet-4-20250514',
 *   });
 *
 *   // Generate embeddings
 *   const embedding = await ai.embed('Some text to embed');
 */

import {
  AIProvider,
  AIProviderClient,
  ChatMessage,
  ChatOptions,
  ChatResponse,
  EmbeddingOptions,
  EmbeddingResponse,
  MODEL_PROVIDERS,
  DEFAULT_MODELS,
  ChatModel,
} from './types';
import { openaiProvider } from './providers/openai';
import { anthropicProvider } from './providers/anthropic';
import { googleProvider } from './providers/google';

// Re-export types
export * from './types';

// Provider registry
const providers: Record<AIProvider, AIProviderClient> = {
  openai: openaiProvider,
  anthropic: anthropicProvider,
  google: googleProvider,
};

/**
 * Get the configured default provider from environment
 */
function getDefaultProvider(): AIProvider {
  const envProvider = process.env.AI_PROVIDER?.toLowerCase() as AIProvider | undefined;

  if (envProvider && providers[envProvider]) {
    return envProvider;
  }

  // Fall back to first available provider
  const availableProviders: AIProvider[] = ['openai', 'anthropic', 'google'];
  for (const provider of availableProviders) {
    if (providers[provider].isAvailable()) {
      return provider;
    }
  }

  // Default to OpenAI if nothing is configured
  return 'openai';
}

/**
 * Get provider for a specific model
 */
function getProviderForModel(model: ChatModel): AIProvider {
  return MODEL_PROVIDERS[model] || getDefaultProvider();
}

export interface AIClientChatOptions extends ChatOptions {
  provider?: AIProvider;
}

export interface AIClientEmbedOptions extends EmbeddingOptions {
  provider?: AIProvider;
}

/**
 * Unified AI client
 */
export const ai = {
  /**
   * Generate a chat completion
   */
  async chat(
    messages: ChatMessage[],
    options: AIClientChatOptions = {}
  ): Promise<ChatResponse> {
    // Determine provider from options, model, or default
    let providerName: AIProvider;

    if (options.provider) {
      providerName = options.provider;
    } else if (options.model) {
      providerName = getProviderForModel(options.model);
    } else {
      providerName = getDefaultProvider();
    }

    const provider = providers[providerName];

    if (!provider) {
      throw new Error(`Unknown AI provider: ${providerName}`);
    }

    if (!provider.isAvailable()) {
      throw new Error(
        `AI provider "${providerName}" is not available. Please configure the required API key.`
      );
    }

    // Use provider's default model if none specified
    const model = options.model || DEFAULT_MODELS[providerName].chat;

    return provider.chat(messages, { ...options, model });
  },

  /**
   * Generate embeddings for text
   * Note: Falls back to OpenAI if the selected provider doesn't support embeddings
   */
  async embed(
    text: string,
    options: AIClientEmbedOptions = {}
  ): Promise<EmbeddingResponse> {
    let providerName = options.provider || getDefaultProvider();
    let provider = providers[providerName];

    // If provider doesn't support embeddings, fall back to OpenAI
    if (!provider.embed) {
      if (!openaiProvider.isAvailable()) {
        throw new Error(
          `Provider "${providerName}" doesn't support embeddings and OpenAI fallback is not available.`
        );
      }
      providerName = 'openai';
      provider = openaiProvider;
    }

    if (!provider.isAvailable()) {
      throw new Error(
        `AI provider "${providerName}" is not available. Please configure the required API key.`
      );
    }

    // Use provider's default embedding model if none specified
    const model = options.model || DEFAULT_MODELS[providerName].embedding;

    return provider.embed!(text, { ...options, model });
  },

  /**
   * Get available providers
   */
  getAvailableProviders(): AIProvider[] {
    return (Object.keys(providers) as AIProvider[]).filter((name) =>
      providers[name].isAvailable()
    );
  },

  /**
   * Check if a specific provider is available
   */
  isProviderAvailable(provider: AIProvider): boolean {
    return providers[provider]?.isAvailable() ?? false;
  },

  /**
   * Get the current default provider
   */
  getDefaultProvider(): AIProvider {
    return getDefaultProvider();
  },
};

// Legacy exports for backwards compatibility
export { openaiProvider } from './providers/openai';
export { anthropicProvider } from './providers/anthropic';
export { googleProvider } from './providers/google';
