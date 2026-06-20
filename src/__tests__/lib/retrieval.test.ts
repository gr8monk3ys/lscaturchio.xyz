import { describe, it, expect } from 'vitest';
import {
  reciprocalRankFusion,
  reciprocalRankFusionScored,
  assessConfidence,
  buildEmbeddingInput,
  sourceContentHash,
  shouldSkipSource,
} from '@/lib/retrieval';

const key = (x: { id: string }) => x.id;

describe('reciprocalRankFusion', () => {
  it('returns [] for no lists or only empty lists', () => {
    expect(reciprocalRankFusion<{ id: string }>([], { key })).toEqual([]);
    expect(reciprocalRankFusion([{ items: [] }], { key })).toEqual([]);
  });

  it('ranks an item appearing in both lists above single-list items', () => {
    // vector ranks: a=0, b=1, c=2 ; lexical ranks: c=0, a=1
    // a = 1/61 + 1/62 = .03252 ; c = 1/63 + 1/61 = .03226 ; b = 1/62 = .01613
    const fused = reciprocalRankFusion(
      [
        { items: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] },
        { items: [{ id: 'c' }, { id: 'a' }] },
      ],
      { key, k: 60 },
    );
    expect(fused.map(key)).toEqual(['a', 'c', 'b']);
  });

  it('respects per-list weights', () => {
    // Equal ranks (both at rank 0) but lexical weighted higher → lexical-only item wins
    const fused = reciprocalRankFusion(
      [
        { items: [{ id: 'v' }], weight: 1 },
        { items: [{ id: 'l' }], weight: 5 },
      ],
      { key, k: 60 },
    );
    expect(fused.map(key)).toEqual(['l', 'v']);
  });

  it('scored variant returns descending fused scores with representatives', () => {
    const scored = reciprocalRankFusionScored(
      [
        { items: [{ id: 'a' }, { id: 'b' }] },
        { items: [{ id: 'a' }] },
      ],
      { key, k: 60 },
    );
    expect(scored.map((s) => s.item.id)).toEqual(['a', 'b']);
    expect(scored[0].score).toBeGreaterThan(scored[1].score);
    // a is in both lists (rank 0 + rank 0), b only in the first (rank 1)
    expect(scored[0].score).toBeCloseTo(1 / 60 + 1 / 60, 6);
    expect(scored[1].score).toBeCloseTo(1 / 61, 6);
  });

  it('keeps the first-list instance as the representative for a duplicated key', () => {
    const fused = reciprocalRankFusion(
      [
        { items: [{ id: 'a', src: 'vector' }] },
        { items: [{ id: 'a', src: 'lexical' }] },
      ],
      { key, k: 60 },
    );
    expect(fused).toHaveLength(1);
    expect(fused[0].src).toBe('vector');
  });
});

describe('assessConfidence', () => {
  const opts = { strong: 0.6, weak: 0.4 };

  it('is "none" with no results', () => {
    expect(assessConfidence([], opts)).toBe('none');
  });

  it('is "strong" when the top cosine similarity clears the strong threshold', () => {
    expect(assessConfidence([{ similarity: 0.7 }, { similarity: 0.2 }], opts)).toBe('strong');
  });

  it('is "weak" when the top similarity is between the floors', () => {
    expect(assessConfidence([{ similarity: 0.5 }], opts)).toBe('weak');
  });

  it('is "none" when the top similarity is below the weak floor and nothing else grounds it', () => {
    expect(assessConfidence([{ similarity: 0.3 }], opts)).toBe('none');
  });

  it('treats a lexical-only hit (null similarity) as weak grounding, not none', () => {
    expect(assessConfidence([{ similarity: null }], opts)).toBe('weak');
    expect(assessConfidence([{ similarity: 0.3 }, { similarity: null }], opts)).toBe('weak');
  });

  it('still reports strong when a strong cosine sits alongside lexical-only hits', () => {
    expect(assessConfidence([{ similarity: null }, { similarity: 0.65 }], opts)).toBe('strong');
  });
});

describe('buildEmbeddingInput', () => {
  it('prepends a Title/Type/URL preamble before the chunk body', () => {
    const out = buildEmbeddingInput(
      { title: 'On Gardens', type: 'blog', url: '/blog/on-gardens' },
      'A chunk of prose.',
    );
    expect(out).toBe(
      'Title: On Gardens\nType: blog\nURL: /blog/on-gardens\n\nA chunk of prose.',
    );
  });

  it('omits absent preamble lines but keeps the present ones', () => {
    expect(buildEmbeddingInput({ title: 'T' }, 'body')).toBe('Title: T\n\nbody');
  });

  it('returns the chunk unchanged when there is no metadata', () => {
    expect(buildEmbeddingInput({}, 'body')).toBe('body');
  });
});

describe('sourceContentHash / shouldSkipSource', () => {
  it('is deterministic and differs for different content', () => {
    expect(sourceContentHash('abc')).toBe(sourceContentHash('abc'));
    expect(sourceContentHash('abc')).not.toBe(sourceContentHash('abd'));
  });

  it('skips a source only when every existing chunk already carries the new hash', () => {
    const h = sourceContentHash('content');
    expect(shouldSkipSource([h, h, h], h)).toBe(true);
    expect(shouldSkipSource([h, 'stale', h], h)).toBe(false); // a chunk predates the change
    expect(shouldSkipSource([], h)).toBe(false); // never indexed → don't skip
  });
});
