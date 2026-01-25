/**
 * Anthropic Claude Provider Implementation
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  AIProviderClient,
  ChatMessage,
  ChatOptions,
  ChatResponse,
  ChatModel,
} from '../types';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not configured');
    }
    client = new Anthropic({
      apiKey,
      timeout: 30000,
      maxRetries: 1,
    });
  }
  return client;
}

export const anthropicProvider: AIProviderClient = {
  provider: 'anthropic',

  isAvailable(): boolean {
    return !!process.env.ANTHROPIC_API_KEY;
  },

  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResponse> {
    const model = (options.model || 'claude-sonnet-4-20250514') as ChatModel;

    // Validate model is Anthropic
    if (!model.startsWith('claude-')) {
      throw new Error(`Invalid Anthropic model: ${model}`);
    }

    // Separate system message from other messages
    const systemMessage = messages.find((m) => m.role === 'system');
    const conversationMessages = messages.filter((m) => m.role !== 'system');

    const anthropicMessages: Anthropic.MessageParam[] = conversationMessages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    const response = await getClient().messages.create({
      model,
      max_tokens: options.maxTokens ?? 1000,
      system: systemMessage?.content,
      messages: anthropicMessages,
    });

    // Extract text from content blocks
    const textContent = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    return {
      content: textContent,
      model,
      provider: 'anthropic',
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  },

  // Anthropic doesn't have a native embeddings API
  // Use OpenAI for embeddings when using Anthropic for chat
  embed: undefined,
};
