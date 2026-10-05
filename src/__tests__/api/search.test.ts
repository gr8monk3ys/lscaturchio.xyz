import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// The route sees ranked essays, never chunk rows: grouping, ranking and snippet
// choice are the retrieval module's (src/__tests__/lib/retrieval-essays.test.ts).
vi.mock('@/lib/retrieval', () => ({
  relevantEssays: vi.fn(),
}));

vi.mock('@/lib/csrf', () => ({
  validateCsrf: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({ withRateLimit: <T>(handler: T) => handler }));

import { GET, POST } from '@/app/api/search/route';
import { relevantEssays, type RelevantEssay } from '@/lib/retrieval';
import { validateCsrf } from '@/lib/csrf';
import { logError } from '@/lib/logger';

const mockEssays = vi.mocked(relevantEssays);

function essay(overrides: Partial<RelevantEssay> = {}): RelevantEssay {
  return {
    url: '/blog/test-post',
    slug: 'test-post',
    title: 'Test Blog Post',
    description: 'A description of the test post',
    date: '2024-01-15',
    tags: ['typescript', 'testing'],
    similarity: 0.85,
    relevance: 1,
    snippets: ['This is sample content from the blog post.'],
    ...overrides,
  };
}

function postRequest(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost/api/search', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost', ...headers },
  });
}

describe('Search API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validateCsrf).mockReturnValue(null);
    mockEssays.mockResolvedValue([]);
  });

  describe('GET /api/search', () => {
    it('returns essays as title, url, description, date, similarity and snippets', async () => {
      mockEssays.mockResolvedValue([essay()]);

      const response = await GET(new NextRequest('http://localhost/api/search?q=typescript'));
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toEqual({
        query: 'typescript',
        results: [
          {
            title: 'Test Blog Post',
            url: '/blog/test-post',
            description: 'A description of the test post',
            date: '2024-01-15',
            similarity: 0.85,
            snippets: ['This is sample content from the blog post.'],
          },
        ],
        count: 1,
      });
    });

    it('keeps the retrieval ranking', async () => {
      mockEssays.mockResolvedValue([
        essay({ url: '/blog/keyword', title: 'Keyword Match', similarity: 0, relevance: 1 }),
        essay({ url: '/blog/vector', title: 'Vector Match', similarity: 0.7, relevance: 0.9 }),
      ]);

      const response = await GET(new NextRequest('http://localhost/api/search?q=react'));
      const json = await response.json();

      expect(json.data.results.map((r: { title: string }) => r.title)).toEqual([
        'Keyword Match',
        'Vector Match',
      ]);
    });

    it('returns empty results for no matches', async () => {
      const response = await GET(new NextRequest('http://localhost/api/search?q=nonexistent'));
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.results).toEqual([]);
      expect(json.data.count).toBe(0);
    });

    it.each([
      ['missing', 'http://localhost/api/search'],
      ['empty', 'http://localhost/api/search?q='],
      ['whitespace-only', 'http://localhost/api/search?q=%20%20%20'],
    ])('returns 400 for a %s query', async (_label, url) => {
      const response = await GET(new NextRequest(url));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Search query is required');
      expect(mockEssays).not.toHaveBeenCalled();
    });

    it('returns 400 for query exceeding 500 characters', async () => {
      const response = await GET(new NextRequest(`http://localhost/api/search?q=${'a'.repeat(501)}`));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Search query too long (max 500 characters)');
    });

    it('accepts query at exactly 500 characters', async () => {
      const response = await GET(new NextRequest(`http://localhost/api/search?q=${'a'.repeat(500)}`));
      expect(response.status).toBe(200);
    });

    it.each([
      ['passes an explicit limit', 'limit=5', 5],
      ['caps the limit at 50', 'limit=100', 50],
      ['clamps the limit to a minimum of 1', 'limit=0', 1],
      ['uses the default for an invalid limit', 'limit=abc', 10],
      ['defaults the limit to 10', '', 10],
    ])('%s', async (_label, param, expected) => {
      await GET(new NextRequest(`http://localhost/api/search?q=test&${param}`));
      expect(mockEssays).toHaveBeenCalledWith('test', { limit: expected });
    });

    it('returns 500 when retrieval throws', async () => {
      mockEssays.mockRejectedValue(new Error('Database connection failed'));

      const response = await GET(new NextRequest('http://localhost/api/search?q=test'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Search failed. Please try again later.');
      expect(logError).toHaveBeenCalledWith('Search: Unexpected error', expect.any(Error), {
        component: 'search',
        action: 'GET',
      });
    });
  });

  describe('POST /api/search', () => {
    it('returns essays as slug, title, description, date, tags and relevance', async () => {
      mockEssays.mockResolvedValue([essay()]);

      const response = await POST(postRequest({ query: 'typescript' }));
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data).toEqual({
        query: 'typescript',
        results: [
          {
            slug: 'test-post',
            title: 'Test Blog Post',
            description: 'A description of the test post',
            date: '2024-01-15',
            tags: ['typescript', 'testing'],
            relevance: 0.85,
          },
        ],
        count: 1,
      });
    });

    it('handles request without origin header gracefully', async () => {
      const request = new NextRequest('http://localhost/api/search', {
        method: 'POST',
        body: JSON.stringify({ query: 'test' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it.each([
      ['missing', {}],
      ['empty', { query: '' }],
      ['whitespace-only', { query: '   ' }],
    ])('returns 400 for a %s query in body', async (_label, body) => {
      const response = await POST(postRequest(body));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Search query is required');
    });

    it('returns 400 for query exceeding 500 characters in body', async () => {
      const response = await POST(postRequest({ query: 'a'.repeat(501) }));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Search query too long (max 500 characters)');
    });

    it.each([
      ['passes an explicit limit', 3, 3],
      ['clamps the limit to a minimum of 1', -5, 1],
      ['accepts a limit passed as a string', '5', 5],
    ])('%s', async (_label, limit, expected) => {
      await POST(postRequest({ query: 'test', limit }));
      expect(mockEssays).toHaveBeenCalledWith('test', { limit: expected });
    });

    it('returns 500 when retrieval throws', async () => {
      mockEssays.mockRejectedValue(new Error('OpenAI API error'));

      const response = await POST(postRequest({ query: 'test' }));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Search failed. Please try again later.');
      expect(logError).toHaveBeenCalledWith('Search: Unexpected error', expect.any(Error), {
        component: 'search',
        action: 'POST',
      });
    });
  });
});
