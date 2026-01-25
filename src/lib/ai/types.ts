/**
 * AI Provider Types
 *
 * Unified interface for multiple AI providers (OpenAI, Anthropic, Google)
 */

export type AIProvider = 'openai' | 'anthropic' | 'google';

export type ChatModel =
  // OpenAI models
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4-turbo'
  | 'gpt-3.5-turbo'
  // Anthropic models
  | 'claude-sonnet-4-20250514'
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-5-haiku-20241022'
  | 'claude-3-opus-20240229'
  // Google models
  | 'gemini-1.5-pro'
  | 'gemini-1.5-flash'
  | 'gemini-2.0-flash-exp';

export type EmbeddingModel =
  // OpenAI
  | 'text-embedding-ada-002'
  | 'text-embedding-3-small'
  | 'text-embedding-3-large'
  // Google
  | 'text-embedding-004';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  model?: ChatModel;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface ChatResponse {
  content: string;
  model: string;
  provider: AIProvider;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface EmbeddingOptions {
  model?: EmbeddingModel;
}

export interface EmbeddingResponse {
  embedding: number[];
  model: string;
  provider: AIProvider;
}

export interface AIProviderClient {
  /**
   * Generate a chat completion
   */
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse>;

  /**
   * Generate embeddings for text
   * Note: Some providers (Anthropic) don't support embeddings natively
   */
  embed?(text: string, options?: EmbeddingOptions): Promise<EmbeddingResponse>;

  /**
   * Check if the provider is available (API key configured)
   */
  isAvailable(): boolean;

  /**
   * Get the provider name
   */
  readonly provider: AIProvider;
}

/**
 * Map of model names to their providers
 */
export const MODEL_PROVIDERS: Record<ChatModel | EmbeddingModel, AIProvider> = {
  // OpenAI
  'gpt-4o': 'openai',
  'gpt-4o-mini': 'openai',
  'gpt-4-turbo': 'openai',
  'gpt-3.5-turbo': 'openai',
  'text-embedding-ada-002': 'openai',
  'text-embedding-3-small': 'openai',
  'text-embedding-3-large': 'openai',
  // Anthropic
  'claude-sonnet-4-20250514': 'anthropic',
  'claude-3-5-sonnet-20241022': 'anthropic',
  'claude-3-5-haiku-20241022': 'anthropic',
  'claude-3-opus-20240229': 'anthropic',
  // Google
  'gemini-1.5-pro': 'google',
  'gemini-1.5-flash': 'google',
  'gemini-2.0-flash-exp': 'google',
  'text-embedding-004': 'google',
};

/**
 * Default models for each provider
 */
export const DEFAULT_MODELS: Record<AIProvider, { chat: ChatModel; embedding?: EmbeddingModel }> = {
  openai: {
    chat: 'gpt-4o',
    embedding: 'text-embedding-3-small',
  },
  anthropic: {
    chat: 'claude-sonnet-4-20250514',
    // Anthropic doesn't have embeddings - fall back to OpenAI
  },
  google: {
    chat: 'gemini-1.5-pro',
    embedding: 'text-embedding-004',
  },
};
