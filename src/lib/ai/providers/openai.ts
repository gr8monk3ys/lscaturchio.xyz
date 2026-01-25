/**
 * OpenAI Provider Implementation
 */

import OpenAI from 'openai';
import {
  AIProviderClient,
  ChatMessage,
  ChatOptions,
  ChatResponse,
  EmbeddingOptions,
  EmbeddingResponse,
  ChatModel,
  EmbeddingModel,
} from '../types';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not configured');
    }
    client = new OpenAI({
      apiKey,
      timeout: 30000,
      maxRetries: 1,
    });
  }
  return client;
}

export const openaiProvider: AIProviderClient = {
  provider: 'openai',

  isAvailable(): boolean {
    return !!process.env.OPENAI_API_KEY;
  },

  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResponse> {
    const model = (options.model || 'gpt-4o') as ChatModel;

    // Validate model is OpenAI
    if (!model.startsWith('gpt-')) {
      throw new Error(`Invalid OpenAI model: ${model}`);
    }

    const openaiMessages: OpenAI.ChatCompletionMessageParam[] = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const completion = await getClient().chat.completions.create({
      model,
      messages: openaiMessages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1000,
    });

    const choice = completion.choices[0];

    return {
      content: choice.message?.content || '',
      model,
      provider: 'openai',
      usage: completion.usage
        ? {
            inputTokens: completion.usage.prompt_tokens,
            outputTokens: completion.usage.completion_tokens,
          }
        : undefined,
    };
  },

  async embed(text: string, options: EmbeddingOptions = {}): Promise<EmbeddingResponse> {
    const model = (options.model || 'text-embedding-3-small') as EmbeddingModel;

    const response = await getClient().embeddings.create({
      model,
      input: text,
    });

    return {
      embedding: response.data[0].embedding,
      model,
      provider: 'openai',
    };
  },
};
