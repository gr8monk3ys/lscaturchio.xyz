import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Ollama module
vi.mock('@/lib/ollama', () => ({
  isOllamaAvailable: vi.fn(),
  createOllamaChatCompletion: vi.fn(),
}));

// Mock embeddings module
vi.mock('@/lib/embeddings', () => ({
  searchSimilarContent: vi.fn(),
  isEmbeddingsAvailable: vi.fn(),
}));

// Mock other dependencies
vi.mock('@/lib/csrf', () => ({
  validateCsrf: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

vi.mock('@/lib/with-rate-limit', () => ({
  withRateLimit: (handler: (req: NextRequest) => Promise<Response>) => handler,
}));

vi.mock('@/lib/rate-limit', () => ({
  RATE_LIMITS: {
    AI_HEAVY: { limit: 5, window: 60000 },
  },
}));

import { POST } from '@/app/api/chat/route';
import { searchSimilarContent, isEmbeddingsAvailable } from '@/lib/embeddings';
import { isOllamaAvailable, createOllamaChatCompletion } from '@/lib/ollama';
import { validateCsrf } from '@/lib/csrf';

// Helper to create mock request
function createMockRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      origin: 'http://localhost:3000',
    },
    body: JSON.stringify(body),
  });
}

describe('/api/chat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: CSRF passes
    vi.mocked(validateCsrf).mockReturnValue(null);
    // Default: embeddings available and return empty
    vi.mocked(isEmbeddingsAvailable).mockResolvedValue(true);
    vi.mocked(searchSimilarContent).mockResolvedValue([]);
    // Default: Ollama available and returns response
    vi.mocked(isOllamaAvailable).mockResolvedValue(true);
    vi.mocked(createOllamaChatCompletion).mockResolvedValue('Test response from Ollama');
  });

  describe('validation', () => {
    it('returns 400 when query is missing', async () => {
      const request = createMockRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('expected string');
    });

    it('returns 400 when query is empty string', async () => {
      const request = createMockRequest({ query: '' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Query is required');
    });

    it('returns 400 when query is not a string', async () => {
      const request = createMockRequest({ query: 123 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('expected string');
    });

    it('returns 400 when query exceeds max length', async () => {
      const longQuery = 'a'.repeat(1001);
      const request = createMockRequest({ query: longQuery });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Query too long');
    });
  });

  describe('CSRF protection', () => {
    it('returns CSRF error when validation fails', async () => {
      vi.mocked(validateCsrf).mockReturnValue(
        new Response(JSON.stringify({ error: 'CSRF validation failed' }), {
          status: 403,
        })
      );

      const request = createMockRequest({ query: 'test query' });
      const response = await POST(request);

      expect(response.status).toBe(403);
    });
  });

  describe('successful chat with Ollama', () => {
    it('returns AI response for valid query', async () => {
      const request = createMockRequest({ query: 'What do you do?' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.answer).toBe('Test response from Ollama');
      expect(data.provider).toBe('ollama');
    });

    it('includes context from embeddings in AI prompt', async () => {
      vi.mocked(searchSimilarContent).mockResolvedValue([
        { content: 'I am a software engineer' },
        { content: 'I work on web applications' },
      ]);

      const request = createMockRequest({ query: 'Tell me about yourself' });
      await POST(request);

      // Verify embeddings were searched
      expect(searchSimilarContent).toHaveBeenCalledWith('Tell me about yourself');

      // Verify Ollama was called with context in the system prompt
      expect(createOllamaChatCompletion).toHaveBeenCalled();
      const callArgs = vi.mocked(createOllamaChatCompletion).mock.calls[0];
      const systemMessage = callArgs[0].find((m) => m.role === 'system');
      expect(systemMessage?.content).toContain('I am a software engineer');
      expect(systemMessage?.content).toContain('I work on web applications');
    });

    it('works without embeddings context', async () => {
      vi.mocked(isEmbeddingsAvailable).mockResolvedValue(false);

      const request = createMockRequest({ query: 'Hello' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.answer).toBe('Test response from Ollama');
      expect(searchSimilarContent).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('returns 503 when no AI provider is available', async () => {
      vi.mocked(isOllamaAvailable).mockResolvedValue(false);

      const request = createMockRequest({ query: 'test query' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toBe('Chat service unavailable');
    });

    it('returns 500 when AI chat fails', async () => {
      vi.mocked(createOllamaChatCompletion).mockRejectedValue(new Error('Ollama error'));

      const request = createMockRequest({ query: 'test query' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to process chat request');
    });

    it('continues without context when embeddings search fails', async () => {
      vi.mocked(searchSimilarContent).mockRejectedValue(new Error('Search error'));

      const request = createMockRequest({ query: 'test query' });
      const response = await POST(request);
      const data = await response.json();

      // Should still succeed - embeddings failure is graceful
      expect(response.status).toBe(200);
      expect(data.answer).toBe('Test response from Ollama');
    });
  });
});
