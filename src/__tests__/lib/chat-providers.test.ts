import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the OpenAI SDK before importing the module under test. The providers
// module reads its env flags at import time, so every test re-imports it via
// vi.resetModules() + dynamic import (same pattern as openai.test.ts).
const mockCreate = vi.fn();
const MockOpenAI = vi.fn().mockImplementation(function (this: Record<string, unknown>) {
  this.chat = { completions: { create: mockCreate } };
  return this;
});

vi.mock('openai', () => ({ default: MockOpenAI }));

const mockIsOllamaAvailable = vi.fn();
const mockOllamaChat = vi.fn();
vi.mock('@/lib/ollama', () => ({
  isOllamaAvailable: (...args: unknown[]) => mockIsOllamaAvailable(...args),
  createOllamaChatCompletion: (...args: unknown[]) => mockOllamaChat(...args),
}));

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

function completionWith(content: string | null) {
  return { choices: [{ message: { content } }] };
}

async function importProviders() {
  return import('@/lib/chat/providers');
}

describe('generateChatAnswer', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENAI_CHAT_MODEL;
    delete process.env.OPENAI_FALLBACK_CHAT_MODEL;
    delete process.env.OPENROUTER_CHAT_MODEL;
    delete process.env.OPENROUTER_FALLBACK_CHAT_MODEL;
    delete process.env.OLLAMA_CHAT_MODEL;
    mockIsOllamaAvailable.mockResolvedValue(false);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns null when no provider is configured and Ollama is down', async () => {
    const { generateChatAnswer } = await importProviders();
    expect(await generateChatAnswer('sys', 'q')).toBeNull();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  describe('OpenAI', () => {
    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'sk-test';
    });

    it('answers with the primary model on success', async () => {
      mockCreate.mockResolvedValue(completionWith('an answer'));
      const { generateChatAnswer } = await importProviders();

      const result = await generateChatAnswer('sys', 'q');

      expect(result).toEqual({
        answer: 'an answer',
        provider: 'openai',
        model: 'gpt-4o-mini',
        usedFallbackModel: false,
      });
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'sys' },
            { role: 'user', content: 'q' },
          ],
        }),
      );
      expect(mockIsOllamaAvailable).not.toHaveBeenCalled();
    });

    it('falls back to the secondary model when the primary fails', async () => {
      mockCreate
        .mockRejectedValueOnce(new Error('model overloaded'))
        .mockResolvedValueOnce(completionWith('fallback answer'));
      const { generateChatAnswer } = await importProviders();

      const result = await generateChatAnswer('sys', 'q');

      expect(result).toMatchObject({
        answer: 'fallback answer',
        provider: 'openai',
        model: 'gpt-4.1-nano',
        usedFallbackModel: true,
      });
    });

    it('tries the fallback model when the primary returns empty content', async () => {
      mockCreate
        .mockResolvedValueOnce(completionWith(null))
        .mockResolvedValueOnce(completionWith('fallback answer'));
      const { generateChatAnswer } = await importProviders();

      const result = await generateChatAnswer('sys', 'q');

      expect(result).toMatchObject({ model: 'gpt-4.1-nano', usedFallbackModel: true });
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });

    it('moves on to Ollama when every OpenAI model fails', async () => {
      mockCreate.mockRejectedValue(new Error('model overloaded'));
      mockIsOllamaAvailable.mockResolvedValue(true);
      mockOllamaChat.mockResolvedValue('local answer');
      const { generateChatAnswer } = await importProviders();

      const result = await generateChatAnswer('sys', 'q');

      expect(result).toMatchObject({ provider: 'ollama', answer: 'local answer' });
      expect(mockCreate).toHaveBeenCalledTimes(2); // primary + fallback model
    });

    it('disables OpenAI for the process after an auth error', async () => {
      mockCreate.mockRejectedValue(Object.assign(new Error('bad key'), { status: 401 }));
      mockIsOllamaAvailable.mockResolvedValue(true);
      mockOllamaChat.mockResolvedValue('local answer');
      const { generateChatAnswer } = await importProviders();

      expect(await generateChatAnswer('sys', 'q')).toMatchObject({ provider: 'ollama' });
      expect(mockCreate).toHaveBeenCalledTimes(1); // no fallback-model retry on auth errors

      expect(await generateChatAnswer('sys', 'again')).toMatchObject({ provider: 'ollama' });
      expect(mockCreate).toHaveBeenCalledTimes(1); // never asked again
    });

    it('respects model overrides from the environment', async () => {
      process.env.OPENAI_CHAT_MODEL = 'gpt-custom';
      mockCreate.mockResolvedValue(completionWith('ok'));
      const { generateChatAnswer } = await importProviders();

      const result = await generateChatAnswer('sys', 'q');

      expect(result).toMatchObject({ model: 'gpt-custom' });
    });
  });

  describe('OpenRouter', () => {
    beforeEach(() => {
      process.env.OPENROUTER_API_KEY = 'or-test';
    });

    it('answers via OpenRouter when OpenAI is not configured', async () => {
      mockCreate.mockResolvedValue(completionWith('routed answer'));
      const { generateChatAnswer } = await importProviders();

      const result = await generateChatAnswer('sys', 'q');

      expect(result).toEqual({
        answer: 'routed answer',
        provider: 'openrouter',
        model: 'openai/gpt-4.1-nano',
        usedFallbackModel: false,
      });
    });

    it('builds the client with the OpenRouter base URL and attribution headers', async () => {
      mockCreate.mockResolvedValue(completionWith('ok'));
      const { generateChatAnswer } = await importProviders();

      await generateChatAnswer('sys', 'q');

      expect(MockOpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          apiKey: 'or-test',
          baseURL: 'https://openrouter.ai/api/v1',
          defaultHeaders: expect.objectContaining({
            'HTTP-Referer': expect.any(String),
            'X-Title': expect.any(String),
          }),
        }),
      );
    });

    it('is used when OpenAI is configured but fails', async () => {
      process.env.OPENAI_API_KEY = 'sk-test';
      mockCreate
        .mockRejectedValueOnce(Object.assign(new Error('unauthorized'), { status: 401 }))
        .mockResolvedValueOnce(completionWith('routed answer'));
      const { generateChatAnswer } = await importProviders();

      const result = await generateChatAnswer('sys', 'q');

      expect(result).toMatchObject({ provider: 'openrouter', answer: 'routed answer' });
    });

    it('falls through to Ollama when OpenRouter fails', async () => {
      mockCreate.mockRejectedValue(new Error('502 bad gateway'));
      mockIsOllamaAvailable.mockResolvedValue(true);
      mockOllamaChat.mockResolvedValue('local answer');
      const { generateChatAnswer } = await importProviders();

      const result = await generateChatAnswer('sys', 'q');

      expect(result).toMatchObject({ provider: 'ollama' });
    });
  });

  describe('Ollama', () => {
    beforeEach(() => {
      mockIsOllamaAvailable.mockResolvedValue(true);
    });

    it('answers with the default local model', async () => {
      mockOllamaChat.mockResolvedValue('local answer');
      const { generateChatAnswer } = await importProviders();

      const result = await generateChatAnswer('sys', 'q');

      expect(result).toEqual({
        answer: 'local answer',
        provider: 'ollama',
        model: 'llama3.2',
        usedFallbackModel: false,
      });
      expect(mockOllamaChat).toHaveBeenCalledWith(
        [
          { role: 'system', content: 'sys' },
          { role: 'user', content: 'q' },
        ],
        { temperature: 0.4, maxTokens: 1000 },
      );
    });

    it('respects OLLAMA_CHAT_MODEL', async () => {
      process.env.OLLAMA_CHAT_MODEL = 'mistral';
      mockOllamaChat.mockResolvedValue('local answer');
      const { generateChatAnswer } = await importProviders();

      expect(await generateChatAnswer('sys', 'q')).toMatchObject({ model: 'mistral' });
    });

    it('returns null when the completion throws', async () => {
      mockOllamaChat.mockRejectedValue(new Error('connection reset'));
      const { generateChatAnswer } = await importProviders();

      expect(await generateChatAnswer('sys', 'q')).toBeNull();
    });

    it('returns null when the completion is empty', async () => {
      mockOllamaChat.mockResolvedValue('');
      const { generateChatAnswer } = await importProviders();

      expect(await generateChatAnswer('sys', 'q')).toBeNull();
    });
  });
});
