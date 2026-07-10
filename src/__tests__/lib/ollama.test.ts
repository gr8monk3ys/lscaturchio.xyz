import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  isOllamaAvailable,
  createOllamaEmbedding,
  createOllamaChatCompletion,
  getEmbeddingDimensions,
} from '@/lib/ollama';

function mockFetch(impl: (...args: Parameters<typeof fetch>) => Promise<Response> | Response) {
  const fn = vi.fn(impl);
  vi.stubGlobal('fetch', fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe('isOllamaAvailable', () => {
  it('returns true when the tags endpoint responds OK', async () => {
    const fn = mockFetch(() => new Response('{}', { status: 200 }));
    expect(await isOllamaAvailable()).toBe(true);
    expect(fn).toHaveBeenCalledWith(
      'http://localhost:11434/api/tags',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('returns false on a non-OK response', async () => {
    mockFetch(() => new Response('nope', { status: 500 }));
    expect(await isOllamaAvailable()).toBe(false);
  });

  it('returns false when the server is unreachable', async () => {
    mockFetch(() => Promise.reject(new Error('ECONNREFUSED')));
    expect(await isOllamaAvailable()).toBe(false);
  });
});

describe('createOllamaEmbedding', () => {
  it('posts the text and returns the embedding vector', async () => {
    const fn = mockFetch(
      () => new Response(JSON.stringify({ embedding: [0.1, 0.2, 0.3] }), { status: 200 }),
    );

    const embedding = await createOllamaEmbedding('hello world');

    expect(embedding).toEqual([0.1, 0.2, 0.3]);
    const [url, init] = fn.mock.calls[0];
    expect(url).toBe('http://localhost:11434/api/embeddings');
    expect(JSON.parse(init!.body as string)).toEqual({
      model: 'nomic-embed-text',
      prompt: 'hello world',
    });
  });

  it('throws with the server error text on a non-OK response', async () => {
    mockFetch(() => new Response('model not found', { status: 404 }));
    await expect(createOllamaEmbedding('x')).rejects.toThrow(
      'Ollama embedding failed: model not found',
    );
  });
});

describe('createOllamaChatCompletion', () => {
  const OK_RESPONSE = JSON.stringify({
    message: { role: 'assistant', content: 'an answer' },
    done: true,
  });

  it('returns the assistant message content', async () => {
    mockFetch(() => new Response(OK_RESPONSE, { status: 200 }));

    const answer = await createOllamaChatCompletion([
      { role: 'system', content: 'be brief' },
      { role: 'user', content: 'hi' },
    ]);

    expect(answer).toBe('an answer');
  });

  it('sends the default model, temperature, and token cap when no options given', async () => {
    const fn = mockFetch(() => new Response(OK_RESPONSE, { status: 200 }));

    await createOllamaChatCompletion([{ role: 'user', content: 'hi' }]);

    const body = JSON.parse(fn.mock.calls[0][1]!.body as string);
    expect(body).toMatchObject({
      model: 'llama3.2',
      stream: false,
      options: { temperature: 0.4, num_predict: 1000 },
    });
  });

  it('honors explicit model and option overrides', async () => {
    const fn = mockFetch(() => new Response(OK_RESPONSE, { status: 200 }));

    await createOllamaChatCompletion([{ role: 'user', content: 'hi' }], {
      model: 'mistral',
      temperature: 0.9,
      maxTokens: 42,
    });

    const body = JSON.parse(fn.mock.calls[0][1]!.body as string);
    expect(body).toMatchObject({
      model: 'mistral',
      options: { temperature: 0.9, num_predict: 42 },
    });
  });

  it('throws with the server error text on a non-OK response', async () => {
    mockFetch(() => new Response('out of memory', { status: 500 }));
    await expect(
      createOllamaChatCompletion([{ role: 'user', content: 'hi' }]),
    ).rejects.toThrow('Ollama chat failed: out of memory');
  });
});

describe('getEmbeddingDimensions', () => {
  it('maps known models to their dimensions', () => {
    expect(getEmbeddingDimensions('nomic-embed-text')).toBe(768);
    expect(getEmbeddingDimensions('nomic-embed-text:latest')).toBe(768);
    expect(getEmbeddingDimensions('all-minilm')).toBe(384);
    expect(getEmbeddingDimensions('mxbai-embed-large')).toBe(1024);
    expect(getEmbeddingDimensions('snowflake-arctic-embed:latest')).toBe(1024);
  });

  it('defaults unknown models to 768 (matches the database migration)', () => {
    expect(getEmbeddingDimensions('some-new-model')).toBe(768);
  });

  it('uses the default embed model when called without arguments', () => {
    expect(getEmbeddingDimensions()).toBe(768);
  });
});
