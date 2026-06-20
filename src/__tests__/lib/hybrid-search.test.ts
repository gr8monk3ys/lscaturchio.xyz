import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the data layer and both embedding providers so hybridSearch runs
// deterministically offline, regardless of which provider env vars are set.
const { mockSql, mockOllamaEmbed, mockOllamaAvailable } = vi.hoisted(() => ({
  mockSql: vi.fn(),
  mockOllamaEmbed: vi.fn(),
  mockOllamaAvailable: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  getDb: () => mockSql,
  isDatabaseConfigured: () => true,
}));
vi.mock('@/lib/ollama', () => ({
  createOllamaEmbedding: mockOllamaEmbed,
  isOllamaAvailable: mockOllamaAvailable,
  getEmbeddingDimensions: () => 768,
}));
vi.mock('openai', () => ({
  default: class MockOpenAI {
    embeddings = {
      create: async () => ({ data: [{ embedding: new Array(768).fill(0.1) }] }),
    };
  },
}));
vi.mock('@/lib/logger', () => ({ logError: vi.fn(), logWarn: vi.fn() }));

import { hybridSearch } from '@/lib/embeddings';

// match_embeddings shape: { id, content, similarity, metadata }
const VECTOR_ROWS = [
  { id: 1, content: 'a chunk about RAG', similarity: 0.8, metadata: { url: '/blog/a', title: 'A' } },
];
// FTS shape: { id, content, metadata } (no similarity)
const LEXICAL_ROWS = [
  { id: 2, content: 'an exact keyword match', metadata: { url: '/blog/b', title: 'B' } },
  { id: 1, content: 'a chunk about RAG', metadata: { url: '/blog/a', title: 'A' } },
];

function routeSql(opts: { vector?: 'rows' | 'throw' } = {}) {
  mockSql.mockImplementation((strings: TemplateStringsArray) => {
    const text = strings.join(' ');
    if (text.includes('match_embeddings')) {
      return opts.vector === 'throw'
        ? Promise.reject(new Error('vector index unavailable'))
        : Promise.resolve(VECTOR_ROWS);
    }
    if (text.includes('websearch_to_tsquery')) return Promise.resolve(LEXICAL_ROWS);
    return Promise.resolve([]);
  });
}

describe('hybridSearch', () => {
  beforeEach(() => {
    mockSql.mockReset();
    mockOllamaEmbed.mockReset().mockResolvedValue(new Array(768).fill(0.1));
    mockOllamaAvailable.mockReset().mockResolvedValue(true);
  });

  it('fuses vector and lexical hits, ranking a shared doc first', async () => {
    routeSql();
    const { results, confidence } = await hybridSearch('rag systems', 5);

    const ids = results.map((r) => r.id);
    expect(ids).toContain(1);
    expect(ids).toContain(2);
    // doc 1 is found by BOTH paths -> highest fused score -> ranked first
    expect(ids[0]).toBe(1);
    // representative carries the cosine similarity from the vector path
    expect(results.find((r) => r.id === 1)?.similarity).toBe(0.8);
    // lexical-only hit has no cosine
    expect(results.find((r) => r.id === 2)?.similarity).toBeNull();
    // top cosine 0.8 clears the strong floor
    expect(confidence).toBe('strong');
  });

  it('degrades to lexical-only (weak confidence) when the vector query fails', async () => {
    routeSql({ vector: 'throw' });
    const { results, confidence } = await hybridSearch('rag', 5);

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.similarity === null)).toBe(true);
    expect(results.map((r) => r.id).sort((a, b) => a - b)).toEqual([1, 2]);
    // lexical matches are real grounding, just not semantically strong
    expect(confidence).toBe('weak');
  });

  it('reports "none" confidence when nothing matches', async () => {
    mockSql.mockResolvedValue([]);
    const { results, confidence } = await hybridSearch('utterly-unrelated-xyz', 5);
    expect(results).toEqual([]);
    expect(confidence).toBe('none');
  });
});
