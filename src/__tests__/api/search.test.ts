import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies before importing the route
vi.mock('@/lib/embeddings', () => ({
  searchEmbeddings: vi.fn(),
}));

vi.mock('@/lib/csrf', () => ({
  validateCsrf: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

// Mock rate limiting to bypass it in tests
vi.mock('@/lib/with-rate-limit', () => ({
  withRateLimit: (handler: (req: NextRequest) => Promise<Response>) => handler,
}));

vi.mock('@/lib/rate-limit', () => ({
  RATE_LIMITS: {
    AI_HEAVY: { limit: 5, window: 60000 },
    STANDARD: { limit: 60, window: 60000 },
  },
}));

import { GET, POST } from '@/app/api/search/route';
import { searchEmbeddings } from '@/lib/embeddings';
import { validateCsrf } from '@/lib/csrf';
import { logError } from '@/lib/logger';

describe('Search API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (validateCsrf as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  // Helper to create mock embedding results
  const createMockEmbeddingResult = (overrides: Record<string, unknown> = {}) => ({
    id: 'embed-1',
    content: 'This is sample content from the blog post.',
    embedding: [0.1, 0.2, 0.3],
    similarity: 0.85,
    metadata: {
      title: 'Test Blog Post',
      url: '/blog/test-post',
      description: 'A description of the test post',
      date: '2024-01-15',
      tags: ['typescript', 'testing'],
      ...overrides,
    },
    ...overrides,
  });

  describe('GET /api/search', () => {
    it('returns grouped results for a valid query', async () => {
      const mockResults = [
        createMockEmbeddingResult(),
        createMockEmbeddingResult({
          id: 'embed-2',
          content: 'Another snippet from the same post.',
          similarity: 0.75,
        }),
      ];

      (searchEmbeddings as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

      const request = new NextRequest('http://localhost/api/search?q=typescript');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.query).toBe('typescript');
      expect(json.data.results).toHaveLength(1); // Grouped by URL
      expect(json.data.results[0].title).toBe('Test Blog Post');
      expect(json.data.results[0].url).toBe('/blog/test-post');
      expect(json.data.results[0].snippets).toHaveLength(2);
      expect(json.data.results[0].similarity).toBe(0.85); // Highest similarity
      expect(json.data.count).toBe(1);
    });

    it('returns multiple grouped results from different posts', async () => {
      const mockResults = [
        createMockEmbeddingResult(),
        createMockEmbeddingResult({
          id: 'embed-2',
          content: 'Content from second post.',
          similarity: 0.7,
          metadata: {
            title: 'Second Blog Post',
            url: '/blog/second-post',
            description: 'Another post description',
            date: '2024-01-10',
            tags: ['react'],
          },
        }),
      ];

      (searchEmbeddings as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

      const request = new NextRequest('http://localhost/api/search?q=react');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.results).toHaveLength(2);
      expect(json.data.results[0].title).toBe('Test Blog Post'); // Higher similarity first
      expect(json.data.results[1].title).toBe('Second Blog Post');
    });

    it('returns 400 for missing query parameter', async () => {
      const request = new NextRequest('http://localhost/api/search');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Search query is required');
    });

    it('returns 400 for empty query', async () => {
      const request = new NextRequest('http://localhost/api/search?q=');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Search query is required');
    });

    it('returns 400 for whitespace-only query', async () => {
      const request = new NextRequest('http://localhost/api/search?q=   ');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Search query is required');
    });

    it('returns 400 for query exceeding 500 characters', async () => {
      const longQuery = 'a'.repeat(501);
      const request = new NextRequest(`http://localhost/api/search?q=${longQuery}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Search query too long (max 500 characters)');
    });

    it('accepts query at exactly 500 characters', async () => {
      const maxQuery = 'a'.repeat(500);
      (searchEmbeddings as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const request = new NextRequest(`http://localhost/api/search?q=${maxQuery}`);
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('respects the limit parameter', async () => {
      const mockResults = Array.from({ length: 20 }, (_, i) =>
        createMockEmbeddingResult({
          id: `embed-${i}`,
          similarity: 0.9 - i * 0.01,
          metadata: {
            title: `Post ${i}`,
            url: `/blog/post-${i}`,
            description: `Description ${i}`,
            date: '2024-01-15',
          },
        })
      );

      (searchEmbeddings as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

      const request = new NextRequest('http://localhost/api/search?q=test&limit=5');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.results).toHaveLength(5);
      expect(searchEmbeddings).toHaveBeenCalledWith('test', 5);
    });

    it('caps limit at 50', async () => {
      (searchEmbeddings as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const request = new NextRequest('http://localhost/api/search?q=test&limit=100');
      await GET(request);

      expect(searchEmbeddings).toHaveBeenCalledWith('test', 50);
    });

    it('uses default limit of 10', async () => {
      (searchEmbeddings as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const request = new NextRequest('http://localhost/api/search?q=test');
      await GET(request);

      expect(searchEmbeddings).toHaveBeenCalledWith('test', 10);
    });

    it('limits snippets to 2 per result', async () => {
      const mockResults = [
        createMockEmbeddingResult({ content: 'Snippet 1' }),
        createMockEmbeddingResult({ id: 'embed-2', content: 'Snippet 2', similarity: 0.8 }),
        createMockEmbeddingResult({ id: 'embed-3', content: 'Snippet 3', similarity: 0.75 }),
        createMockEmbeddingResult({ id: 'embed-4', content: 'Snippet 4', similarity: 0.7 }),
      ];

      (searchEmbeddings as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

      const request = new NextRequest('http://localhost/api/search?q=test');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.results[0].snippets).toHaveLength(2);
    });

    it('deduplicates identical snippets from same post', async () => {
      const mockResults = [
        createMockEmbeddingResult({ content: 'Same snippet content' }),
        createMockEmbeddingResult({
          id: 'embed-2',
          content: 'Same snippet content', // Duplicate
          similarity: 0.8,
        }),
      ];

      (searchEmbeddings as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

      const request = new NextRequest('http://localhost/api/search?q=test');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.results[0].snippets).toHaveLength(1);
      expect(json.data.results[0].snippets[0]).toBe('Same snippet content');
    });

    it('skips results without URL in metadata', async () => {
      const mockResults = [
        createMockEmbeddingResult(),
        createMockEmbeddingResult({
          id: 'embed-2',
          metadata: { title: 'No URL Post' }, // Missing URL
        }),
      ];

      (searchEmbeddings as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

      const request = new NextRequest('http://localhost/api/search?q=test');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.results).toHaveLength(1);
      expect(json.data.results[0].title).toBe('Test Blog Post');
    });

    it('returns 500 when searchEmbeddings throws an error', async () => {
      (searchEmbeddings as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost/api/search?q=test');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Search failed. Please try again later.');
      expect(logError).toHaveBeenCalledWith(
        'Search: Unexpected error',
        expect.any(Error),
        { component: 'search', action: 'GET' }
      );
    });

    it('returns empty results for no matches', async () => {
      (searchEmbeddings as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const request = new NextRequest('http://localhost/api/search?q=nonexistent');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.results).toEqual([]);
      expect(json.data.count).toBe(0);
    });

    it('does not include tags in GET response', async () => {
      const mockResults = [createMockEmbeddingResult()];
      (searchEmbeddings as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

      const request = new NextRequest('http://localhost/api/search?q=test');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.results[0].tags).toBeUndefined();
    });
  });

  describe('POST /api/search', () => {
    it('returns formatted results for a valid query', async () => {
      const mockResults = [createMockEmbeddingResult()];
      (searchEmbeddings as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

      const request = new NextRequest('http://localhost/api/search', {
        method: 'POST',
        body: JSON.stringify({ query: 'typescript' }),
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost',
        },
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.query).toBe('typescript');
      expect(json.data.results).toHaveLength(1);
      expect(json.data.results[0]).toEqual({
        slug: 'test-post',
        title: 'Test Blog Post',
        description: 'A description of the test post',
        date: '2024-01-15',
        tags: ['typescript', 'testing'],
        relevance: 0.85,
      });
      expect(json.data.count).toBe(1);
    });

    it('includes tags in POST response', async () => {
      const mockResults = [createMockEmbeddingResult()];
      (searchEmbeddings as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

      const request = new NextRequest('http://localhost/api/search', {
        method: 'POST',
        body: JSON.stringify({ query: 'test' }),
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost',
        },
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.results[0].tags).toEqual(['typescript', 'testing']);
    });

    it('handles request without origin header gracefully', async () => {
      const mockResults = [createMockEmbeddingResult()];
      (searchEmbeddings as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

      const request = new NextRequest('http://localhost/api/search', {
        method: 'POST',
        body: JSON.stringify({ query: 'test' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('returns 400 for missing query in body', async () => {
      const request = new NextRequest('http://localhost/api/search', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Search query is required');
    });

    it('returns 400 for empty query in body', async () => {
      const request = new NextRequest('http://localhost/api/search', {
        method: 'POST',
        body: JSON.stringify({ query: '' }),
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Search query is required');
    });

    it('returns 400 for whitespace-only query in body', async () => {
      const request = new NextRequest('http://localhost/api/search', {
        method: 'POST',
        body: JSON.stringify({ query: '   ' }),
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Search query is required');
    });

    it('returns 400 for query exceeding 500 characters in body', async () => {
      const longQuery = 'a'.repeat(501);
      const request = new NextRequest('http://localhost/api/search', {
        method: 'POST',
        body: JSON.stringify({ query: longQuery }),
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Search query too long (max 500 characters)');
    });

    it('respects the limit parameter in body', async () => {
      const mockResults = Array.from({ length: 10 }, (_, i) =>
        createMockEmbeddingResult({
          id: `embed-${i}`,
          similarity: 0.9 - i * 0.01,
          metadata: {
            title: `Post ${i}`,
            url: `/blog/post-${i}`,
            description: `Description ${i}`,
            date: '2024-01-15',
            tags: [],
          },
        })
      );

      (searchEmbeddings as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

      const request = new NextRequest('http://localhost/api/search', {
        method: 'POST',
        body: JSON.stringify({ query: 'test', limit: 3 }),
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost',
        },
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.results).toHaveLength(3);
      expect(searchEmbeddings).toHaveBeenCalledWith('test', 3);
    });

    it('extracts slug from URL correctly', async () => {
      const mockResults = [
        createMockEmbeddingResult({
          metadata: {
            title: 'Deep Nested Post',
            url: '/blog/category/deep-nested-post',
            description: 'A nested post',
            date: '2024-01-15',
            tags: [],
          },
        }),
      ];

      (searchEmbeddings as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

      const request = new NextRequest('http://localhost/api/search', {
        method: 'POST',
        body: JSON.stringify({ query: 'test' }),
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost',
        },
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.results[0].slug).toBe('deep-nested-post');
    });

    it('returns 500 when searchEmbeddings throws an error', async () => {
      (searchEmbeddings as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('OpenAI API error')
      );

      const request = new NextRequest('http://localhost/api/search', {
        method: 'POST',
        body: JSON.stringify({ query: 'test' }),
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Search failed. Please try again later.');
      expect(logError).toHaveBeenCalledWith(
        'Search: Unexpected error',
        expect.any(Error),
        { component: 'search', action: 'POST' }
      );
    });

    it('handles results with missing tags gracefully', async () => {
      const mockResults = [
        createMockEmbeddingResult({
          metadata: {
            title: 'Post Without Tags',
            url: '/blog/no-tags',
            description: 'Description',
            date: '2024-01-15',
            // No tags field
          },
        }),
      ];

      (searchEmbeddings as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

      const request = new NextRequest('http://localhost/api/search', {
        method: 'POST',
        body: JSON.stringify({ query: 'test' }),
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost',
        },
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.results[0].tags).toEqual([]);
    });

    it('handles limit passed as string', async () => {
      (searchEmbeddings as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const request = new NextRequest('http://localhost/api/search', {
        method: 'POST',
        body: JSON.stringify({ query: 'test', limit: '5' }),
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost',
        },
      });

      await POST(request);

      expect(searchEmbeddings).toHaveBeenCalledWith('test', 5);
    });
  });

  describe('Result Grouping Logic', () => {
    it('groups multiple embedding chunks from same blog post', async () => {
      const mockResults = [
        createMockEmbeddingResult({
          id: 'chunk-1',
          content: 'First chunk of content about TypeScript.',
          similarity: 0.9,
        }),
        createMockEmbeddingResult({
          id: 'chunk-2',
          content: 'Second chunk discussing advanced patterns.',
          similarity: 0.85,
        }),
        createMockEmbeddingResult({
          id: 'chunk-3',
          content: 'Third chunk on testing strategies.',
          similarity: 0.8,
        }),
      ];

      (searchEmbeddings as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

      const request = new NextRequest('http://localhost/api/search?q=typescript');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.results).toHaveLength(1);
      expect(json.data.results[0].similarity).toBe(0.9); // Highest preserved
      expect(json.data.results[0].snippets).toHaveLength(2); // Limited to 2
    });

    it('sorts grouped results by highest similarity', async () => {
      const mockResults = [
        createMockEmbeddingResult({
          id: 'low-sim',
          similarity: 0.6,
          metadata: {
            title: 'Low Similarity Post',
            url: '/blog/low-post',
            description: 'Low',
            date: '2024-01-15',
          },
        }),
        createMockEmbeddingResult({
          id: 'high-sim',
          similarity: 0.95,
          metadata: {
            title: 'High Similarity Post',
            url: '/blog/high-post',
            description: 'High',
            date: '2024-01-14',
          },
        }),
        createMockEmbeddingResult({
          id: 'mid-sim',
          similarity: 0.75,
          metadata: {
            title: 'Medium Similarity Post',
            url: '/blog/mid-post',
            description: 'Medium',
            date: '2024-01-13',
          },
        }),
      ];

      (searchEmbeddings as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

      const request = new NextRequest('http://localhost/api/search?q=test');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.results[0].title).toBe('High Similarity Post');
      expect(json.data.results[1].title).toBe('Medium Similarity Post');
      expect(json.data.results[2].title).toBe('Low Similarity Post');
    });

    it('preserves metadata from first occurrence of grouped result', async () => {
      const mockResults = [
        createMockEmbeddingResult({
          id: 'first',
          similarity: 0.7,
          metadata: {
            title: 'Original Title',
            url: '/blog/test-post',
            description: 'Original Description',
            date: '2024-01-15',
          },
        }),
        createMockEmbeddingResult({
          id: 'second',
          similarity: 0.9, // Higher similarity but comes second
          metadata: {
            title: 'Different Title', // This should NOT be used
            url: '/blog/test-post',
            description: 'Different Description',
            date: '2024-01-14',
          },
        }),
      ];

      (searchEmbeddings as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

      const request = new NextRequest('http://localhost/api/search?q=test');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.results[0].title).toBe('Original Title');
      expect(json.data.results[0].description).toBe('Original Description');
      expect(json.data.results[0].similarity).toBe(0.9); // Highest similarity
    });
  });
});
