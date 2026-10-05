import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// The retrieval module is tested at its interface — essays and grounding —
// with only the edges mocked: the database (which answers both the vector and
// the full-text query) and the two embedding providers.
const { mockSql, mockOllamaEmbed, mockOllamaAvailable, mockLogError } = vi.hoisted(() => ({
  mockSql: vi.fn(),
  mockOllamaEmbed: vi.fn(),
  mockOllamaAvailable: vi.fn(),
  mockLogError: vi.fn(),
}));

// No OpenAI key: the embedding ladder goes straight to (mocked) Ollama.
beforeEach(() => {
  vi.stubEnv('OPENAI_API_KEY', '');
});
afterEach(() => {
  vi.unstubAllEnvs();
});

vi.mock('@/lib/db', () => ({
  getDb: () => mockSql,
  isDatabaseConfigured: () => true,
}));
vi.mock('@/lib/ollama', () => ({
  createOllamaEmbedding: mockOllamaEmbed,
  isOllamaAvailable: mockOllamaAvailable,
  getEmbeddingDimensions: () => 768,
}));
vi.mock('@/lib/logger', () => ({ logError: mockLogError, logWarn: vi.fn() }));

import { relevantEssays, groundingFor } from '@/lib/retrieval';

type Row = { id: number; content: string; similarity?: number; metadata: Record<string, unknown> };

const essay = (slug: string, extra: Record<string, unknown> = {}) => ({
  url: `/blog/${slug}`,
  title: slug.toUpperCase(),
  description: `about ${slug}`,
  date: '2026-01-01',
  tags: [slug],
  ...extra,
});

/** Route the two legs of the hybrid query to fixed rows (or a failure). */
function index({ vector = [], lexical = [] }: { vector?: Row[] | Error; lexical?: Row[] | Error }) {
  mockSql.mockImplementation((strings: TemplateStringsArray) => {
    const text = strings.join(' ');
    const leg = text.includes('match_embeddings')
      ? vector
      : text.includes('websearch_to_tsquery')
        ? lexical
        : [];
    return leg instanceof Error ? Promise.reject(leg) : Promise.resolve(leg);
  });
}

describe('relevantEssays', () => {
  beforeEach(() => {
    mockSql.mockReset();
    mockLogError.mockReset();
    mockOllamaEmbed.mockReset().mockResolvedValue(new Array(768).fill(0.1));
    mockOllamaAvailable.mockReset().mockResolvedValue(true);
  });

  it('returns one essay per URL, carrying its best similarity', async () => {
    index({
      vector: [
        { id: 1, content: 'First passage on gardens.', similarity: 0.62, metadata: essay('gardens') },
        { id: 2, content: 'Second passage on gardens.', similarity: 0.81, metadata: essay('gardens') },
        { id: 3, content: 'A passage on prisons.', similarity: 0.5, metadata: essay('prisons') },
      ],
    });

    const essays = await relevantEssays('gardens', { limit: 5 });

    expect(essays.map((e) => e.url)).toEqual(['/blog/gardens', '/blog/prisons']);
    expect(essays[0]).toMatchObject({
      slug: 'gardens',
      title: 'GARDENS',
      description: 'about gardens',
      date: '2026-01-01',
      tags: ['gardens'],
      similarity: 0.81,
      relevance: 1,
    });
  });

  it('ranks a keyword-only match by fused score, not as zero similarity', async () => {
    // "boredom" is the top full-text hit but never clears the vector floor;
    // "gardens" is the weak top vector hit. Lexical is weighted slightly higher,
    // so the keyword match ranks first — the same rule search has always used.
    index({
      vector: [{ id: 1, content: 'Loosely related.', similarity: 0.3, metadata: essay('gardens') }],
      lexical: [{ id: 2, content: 'On boredom, exactly.', metadata: essay('boredom') }],
    });

    const essays = await relevantEssays('boredom', { limit: 5 });

    expect(essays.map((e) => e.slug)).toEqual(['boredom', 'gardens']);
    expect(essays[0]).toMatchObject({ similarity: 0, relevance: 1 });
    expect(essays[1].relevance).toBeGreaterThan(0);
    expect(essays[1].relevance).toBeLessThan(1);
  });

  it('ranks an essay found by both legs above one found by either', async () => {
    const shared = { id: 1, content: 'On RAG systems.', metadata: essay('rag') };
    index({
      vector: [
        { id: 3, content: 'Vector only.', similarity: 0.9, metadata: essay('vectors') },
        { ...shared, similarity: 0.7 },
      ],
      lexical: [{ id: 2, content: 'Keyword only.', metadata: essay('keywords') }, shared],
    });

    const essays = await relevantEssays('rag', { limit: 5 });

    expect(essays[0].slug).toBe('rag');
    expect(essays[0].similarity).toBe(0.7);
  });

  it('chooses presentable snippets: no code, no repeated title, no duplicates, at most two', async () => {
    const meta = essay('shipping', { title: 'Shipping It' });
    index({
      vector: [
        { id: 1, content: '```ts\nconst x = 1;\n```', similarity: 0.9, metadata: meta },
        { id: 2, content: 'Shipping It: people who have shipped know better.', similarity: 0.85, metadata: meta },
        { id: 3, content: '```python class Service: pass', similarity: 0.84, metadata: meta },
        { id: 4, content: 'people who have shipped know better.', similarity: 0.83, metadata: meta },
        { id: 5, content: 'A second real sentence.', similarity: 0.82, metadata: meta },
        { id: 6, content: 'A third real sentence.', similarity: 0.81, metadata: meta },
      ],
    });

    const [result] = await relevantEssays('shipping', { limit: 10 });

    expect(result.snippets).toEqual([
      'people who have shipped know better.',
      'A second real sentence.',
    ]);
  });

  it('keeps the first-ranked passage’s metadata and falls back to Untitled', async () => {
    index({
      vector: [
        { id: 1, content: 'a', similarity: 0.9, metadata: { url: '/blog/category/nested-post' } },
        { id: 2, content: 'b', similarity: 0.8, metadata: { url: '/blog/category/nested-post', title: 'Later Title' } },
      ],
    });

    const [result] = await relevantEssays('nested', { limit: 5 });

    expect(result).toMatchObject({ slug: 'nested-post', title: 'Untitled', description: '', date: '', tags: [] });
  });

  it('skips passages that belong to no essay', async () => {
    index({
      vector: [
        { id: 1, content: 'I live in Los Angeles.', similarity: 0.9, metadata: { source: 'about.md' } },
        { id: 2, content: 'An essay passage.', similarity: 0.6, metadata: essay('cities') },
      ],
    });

    const essays = await relevantEssays('where do you live', { limit: 5 });

    expect(essays.map((e) => e.slug)).toEqual(['cities']);
  });

  it('bounds the passages ranked by limit', async () => {
    index({
      vector: [
        { id: 1, content: 'a', similarity: 0.9, metadata: essay('first') },
        { id: 2, content: 'b', similarity: 0.8, metadata: essay('second') },
      ],
    });

    const essays = await relevantEssays('q', { limit: 1 });

    expect(essays.map((e) => e.slug)).toEqual(['first']);
  });

  describe('when a provider or the index fails', () => {
    const lexicalOnly: Row[] = [{ id: 2, content: 'Keyword hit.', metadata: essay('keywords') }];

    it('falls back to keyword matches when no embedding provider is reachable, quietly', async () => {
      mockOllamaAvailable.mockResolvedValue(false);
      index({ vector: [], lexical: lexicalOnly });

      const essays = await relevantEssays('keywords', { limit: 5 });

      expect(essays).toEqual([expect.objectContaining({ slug: 'keywords', similarity: 0 })]);
      expect(mockOllamaEmbed).not.toHaveBeenCalled();
      expect(mockLogError).not.toHaveBeenCalled();
    });

    it('falls back to keyword matches when the vector query fails, and logs it', async () => {
      index({ vector: new Error('vector index unavailable'), lexical: lexicalOnly });

      const essays = await relevantEssays('keywords', { limit: 5 });

      expect(essays.map((e) => e.slug)).toEqual(['keywords']);
      expect(mockLogError).toHaveBeenCalledWith('Vector search failed', expect.any(Error), expect.anything());
    });

    it('returns no essays, without throwing, when both legs fail', async () => {
      index({ vector: new Error('down'), lexical: new Error('down') });

      await expect(relevantEssays('anything', { limit: 5 })).resolves.toEqual([]);
    });
  });
});

describe('groundingFor', () => {
  beforeEach(() => {
    mockSql.mockReset();
    mockOllamaEmbed.mockReset().mockResolvedValue(new Array(768).fill(0.1));
    mockOllamaAvailable.mockReset().mockResolvedValue(true);
  });

  it('grounds on every source, and points at up to three distinct essays', async () => {
    index({
      vector: [
        { id: 1, content: 'I live in Los Angeles.', similarity: 0.8, metadata: { source: 'about.md' } },
        { id: 2, content: 'Gardens one.', similarity: 0.7, metadata: essay('gardens') },
        { id: 3, content: 'Gardens two.', similarity: 0.69, metadata: essay('gardens') },
        { id: 4, content: 'Cities.', similarity: 0.6, metadata: essay('cities') },
        { id: 5, content: 'Rivers.', similarity: 0.59, metadata: essay('rivers') },
        { id: 6, content: 'Beyond the five passages.', similarity: 0.58, metadata: essay('mountains') },
      ],
    });

    const grounding = await groundingFor('tell me about yourself');

    expect(grounding.confidence).toBe('strong');
    expect(grounding.context).toBe(
      ['I live in Los Angeles.', 'Gardens one.', 'Gardens two.', 'Cities.', 'Rivers.'].join('\n\n'),
    );
    expect(grounding.closest).toEqual([
      { title: 'GARDENS', url: '/blog/gardens' },
      { title: 'CITIES', url: '/blog/cities' },
      { title: 'RIVERS', url: '/blog/rivers' },
    ]);
  });

  it('is weak grounding when only keywords matched', async () => {
    mockOllamaAvailable.mockResolvedValue(false);
    index({ lexical: [{ id: 1, content: 'Keyword hit.', metadata: essay('keywords') }] });

    const grounding = await groundingFor('keywords');

    expect(grounding.confidence).toBe('weak');
    expect(grounding.context).toBe('Keyword hit.');
  });

  it('is no grounding, without throwing, when nothing matches or the index is down', async () => {
    index({ vector: new Error('down'), lexical: new Error('down') });

    await expect(groundingFor('anything')).resolves.toEqual({
      context: '',
      confidence: 'none',
      closest: [],
    });
  });
});
