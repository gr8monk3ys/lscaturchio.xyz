import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock OpenAI before importing the module
const mockCreate = vi.fn();
const MockOpenAI = vi.fn().mockImplementation(function(this: Record<string, unknown>) {
  this.chat = {
    completions: {
      create: mockCreate,
    },
  };
  return this;
});

vi.mock('openai', () => {
  return {
    default: MockOpenAI,
  };
});

describe('OpenAI Client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('throws error when OPENAI_API_KEY is not set', async () => {
    delete process.env.OPENAI_API_KEY;

    const { getOpenAI } = await import('@/lib/openai');

    expect(() => getOpenAI()).toThrow('OPENAI_API_KEY environment variable is not configured');
  });

  it('creates OpenAI client when API key is configured', async () => {
    process.env.OPENAI_API_KEY = 'test-api-key';

    const { getOpenAI } = await import('@/lib/openai');

    const client = getOpenAI();
    expect(client).toBeDefined();
  });

  it('returns the same instance on subsequent calls (singleton)', async () => {
    process.env.OPENAI_API_KEY = 'test-api-key';

    const { getOpenAI } = await import('@/lib/openai');

    const client1 = getOpenAI();
    const client2 = getOpenAI();

    expect(client1).toBe(client2);
  });

  it('uses correct configuration options', async () => {
    process.env.OPENAI_API_KEY = 'test-api-key';

    const OpenAIMock = (await import('openai')).default;
    const { getOpenAI } = await import('@/lib/openai');

    getOpenAI();

    expect(OpenAIMock).toHaveBeenCalledWith({
      apiKey: 'test-api-key',
      timeout: 30000,
      maxRetries: 1,
    });
  });
});
