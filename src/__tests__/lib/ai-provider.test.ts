import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// One mocked OpenAI SDK for every consumer, so the test can see which of them
// still talks to OpenAI after another has had its key refused.
const { MockOpenAI, chatCreate, embeddingsCreate, ollamaAvailable, ollamaEmbed, ollamaChat } =
  vi.hoisted(() => {
    const chatCreate = vi.fn();
    const embeddingsCreate = vi.fn();
    const MockOpenAI = vi.fn().mockImplementation(function (this: Record<string, unknown>) {
      this.chat = { completions: { create: chatCreate } };
      this.embeddings = { create: embeddingsCreate };
      return this;
    });
    return {
      MockOpenAI,
      chatCreate,
      embeddingsCreate,
      ollamaAvailable: vi.fn(),
      ollamaEmbed: vi.fn(),
      ollamaChat: vi.fn(),
    };
  });

vi.mock('openai', () => ({ default: MockOpenAI }));
vi.mock('@/lib/ollama', () => ({
  isOllamaAvailable: ollamaAvailable,
  createOllamaEmbedding: ollamaEmbed,
  createOllamaChatCompletion: ollamaChat,
  getEmbeddingDimensions: () => 768,
}));
vi.mock('@/lib/logger', () => ({ logError: vi.fn(), logWarn: vi.fn(), logInfo: vi.fn() }));

const refused = () => Object.assign(new Error('Incorrect API key provided'), { status: 401 });

/** Fresh module state per test: the disable flag lives for the process. */
async function load() {
  vi.resetModules();
  const [provider, embeddings, chat, summarize] = await Promise.all([
    import('@/lib/ai-provider'),
    import('@/lib/embeddings'),
    import('@/lib/chat/providers'),
    import('@/lib/summarize'),
  ]);
  return { ...provider, ...embeddings, ...chat, ...summarize };
}

describe('ai-provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('OPENAI_API_KEY', 'sk-test');
    vi.stubEnv('OPENROUTER_API_KEY', '');
    ollamaAvailable.mockResolvedValue(true);
    ollamaEmbed.mockResolvedValue([0.5]);
    ollamaChat.mockResolvedValue('local answer');
    chatCreate.mockResolvedValue({ choices: [{ message: { content: 'openai answer' } }] });
    embeddingsCreate.mockResolvedValue({ data: [{ embedding: [0.1] }] });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('has no client without a key', async () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    const { getOpenAIClient, isOpenAIEnabled } = await load();

    expect(isOpenAIEnabled()).toBe(false);
    expect(await getOpenAIClient()).toBeNull();
    expect(MockOpenAI).not.toHaveBeenCalled();
  });

  it('builds one client, with the shared timeout and retry budget, for every consumer', async () => {
    const { createEmbedding, generateChatAnswer, summarizeContent } = await load();

    await createEmbedding('text');
    await generateChatAnswer('sys', 'q');
    await summarizeContent('content');

    expect(MockOpenAI).toHaveBeenCalledTimes(1);
    expect(MockOpenAI).toHaveBeenCalledWith({ apiKey: 'sk-test', timeout: 30_000, maxRetries: 1 });
  });

  it('leaves OpenAI on after an error that is not about the key', async () => {
    const { disableOpenAIOnAuthError, isOpenAIEnabled } = await load();

    expect(disableOpenAIOnAuthError(new Error('model overloaded'))).toBe(false);
    expect(isOpenAIEnabled()).toBe(true);
  });

  // /api/summarize sends reader text to OpenAI. An error whose MESSAGE merely
  // contains an auth word must not switch OpenAI off for every reader; only a
  // real 401/403 from the API may.
  it('falls back on an auth-worded message without a 401/403, but leaves OpenAI on', async () => {
    const { disableOpenAIOnAuthError, isOpenAIEnabled } = await load();

    expect(disableOpenAIOnAuthError(new Error('Unauthorized words in your text'))).toBe(true);
    expect(
      disableOpenAIOnAuthError(Object.assign(new Error('authentication mentioned'), { status: 400 }))
    ).toBe(true);
    expect(isOpenAIEnabled()).toBe(true);
  });

  it('a key refused while embedding turns OpenAI off for chat and summaries too', async () => {
    embeddingsCreate.mockRejectedValue(refused());
    const { createEmbedding, generateChatAnswer, summarizeContent, getEmbeddingProvider } =
      await load();

    expect(await createEmbedding('text')).toEqual([0.5]); // fell back to Ollama
    expect(getEmbeddingProvider()).toBe('ollama');

    expect(await generateChatAnswer('sys', 'q')).toMatchObject({ provider: 'ollama' });
    await expect(summarizeContent('content')).rejects.toThrow('Failed to generate summary');
    expect(chatCreate).not.toHaveBeenCalled();
  });

  it('a key refused while chatting turns OpenAI off for embeddings too', async () => {
    chatCreate.mockRejectedValue(refused());
    const { createEmbedding, generateChatAnswer } = await load();

    expect(await generateChatAnswer('sys', 'q')).toMatchObject({ provider: 'ollama' });
    expect(await createEmbedding('text')).toEqual([0.5]);
    expect(embeddingsCreate).not.toHaveBeenCalled();
  });

  it('a key refused while summarising turns OpenAI off for embeddings too', async () => {
    chatCreate.mockRejectedValue(refused());
    const { summarizeContent, createEmbedding } = await load();

    await expect(summarizeContent('content')).rejects.toThrow('Failed to generate summary');
    expect(await createEmbedding('text')).toEqual([0.5]);
    expect(embeddingsCreate).not.toHaveBeenCalled();
  });
});
