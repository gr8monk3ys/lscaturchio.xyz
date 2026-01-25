/**
 * Google Gemini Provider Implementation
 */

import { GoogleGenerativeAI, Content } from '@google/generative-ai';
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

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!client) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY environment variable is not configured');
    }
    client = new GoogleGenerativeAI(apiKey);
  }
  return client;
}

// Map our model names to Google's
const MODEL_MAP: Record<string, string> = {
  'gemini-1.5-pro': 'gemini-1.5-pro',
  'gemini-1.5-flash': 'gemini-1.5-flash',
  'gemini-2.0-flash-exp': 'gemini-2.0-flash-exp',
  'text-embedding-004': 'text-embedding-004',
};

export const googleProvider: AIProviderClient = {
  provider: 'google',

  isAvailable(): boolean {
    return !!process.env.GOOGLE_AI_API_KEY;
  },

  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResponse> {
    const modelName = (options.model || 'gemini-1.5-pro') as ChatModel;

    // Validate model is Google
    if (!modelName.startsWith('gemini-')) {
      throw new Error(`Invalid Google model: ${modelName}`);
    }

    const googleModelName = MODEL_MAP[modelName] || modelName;
    const model = getClient().getGenerativeModel({ model: googleModelName });

    // Separate system message and build conversation history
    const systemMessage = messages.find((m) => m.role === 'system');
    const conversationMessages = messages.filter((m) => m.role !== 'system');

    // Convert to Gemini format
    const history: Content[] = [];
    let lastUserMessage = '';

    for (const msg of conversationMessages) {
      if (msg.role === 'user') {
        lastUserMessage = msg.content;
      } else if (msg.role === 'assistant') {
        // Add the previous user message and this response to history
        if (history.length > 0 || lastUserMessage) {
          history.push({
            role: 'user',
            parts: [{ text: lastUserMessage }],
          });
          history.push({
            role: 'model',
            parts: [{ text: msg.content }],
          });
        }
      }
    }

    // Start chat with history and system instruction
    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: options.maxTokens ?? 1000,
        temperature: options.temperature ?? 0.7,
      },
      systemInstruction: systemMessage?.content,
    });

    // Send the last user message
    const result = await chat.sendMessage(lastUserMessage);
    const response = result.response;

    return {
      content: response.text(),
      model: modelName,
      provider: 'google',
      usage: response.usageMetadata
        ? {
            inputTokens: response.usageMetadata.promptTokenCount || 0,
            outputTokens: response.usageMetadata.candidatesTokenCount || 0,
          }
        : undefined,
    };
  },

  async embed(text: string, options: EmbeddingOptions = {}): Promise<EmbeddingResponse> {
    const modelName = (options.model || 'text-embedding-004') as EmbeddingModel;
    const googleModelName = MODEL_MAP[modelName] || modelName;

    const model = getClient().getGenerativeModel({ model: googleModelName });
    const result = await model.embedContent(text);

    return {
      embedding: result.embedding.values,
      model: modelName,
      provider: 'google',
    };
  },
};
