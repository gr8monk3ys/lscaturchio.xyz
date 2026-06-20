import { describe, it, expect } from 'vitest';
import { splitIntoChunks } from '@/lib/embeddings';

describe('splitIntoChunks', () => {
  it('returns an empty array for empty or whitespace-only input', () => {
    expect(splitIntoChunks('')).toEqual([]);
    expect(splitIntoChunks('   \n  \t ')).toEqual([]);
  });

  it('keeps short text as a single trimmed chunk', () => {
    const chunks = splitIntoChunks('A short sentence. Another one.', 1000);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe(chunks[0].trim());
    expect(chunks[0]).toContain('A short sentence.');
    expect(chunks[0]).toContain('Another one.');
  });

  it('retains trailing text that lacks terminal punctuation', () => {
    // The old regex /[^.!?]+[.!?]+/g silently dropped any tail without . ! or ?
    const text = 'First sentence. Second sentence. Trailing heading without a period';
    const joined = splitIntoChunks(text, 1000).join(' ');
    expect(joined).toContain('Trailing heading without a period');
  });

  it('retains a trailing markdown list whose items have no terminal punctuation', () => {
    const text = 'Intro paragraph about the topic.\n- item one\n- item two\n- item three';
    const joined = splitIntoChunks(text, 1000).join('\n');
    expect(joined).toContain('item one');
    expect(joined).toContain('item two');
    expect(joined).toContain('item three');
  });

  it('retains a trailing markdown heading line', () => {
    const text = 'Some body content here that is a full sentence.\n## Conclusion';
    const joined = splitIntoChunks(text, 1000).join('\n');
    expect(joined).toContain('## Conclusion');
  });

  it('preserves every word token across chunks (no silent drops)', () => {
    const text = Array.from(
      { length: 30 },
      (_, i) => `Distinctword${i} appears in sentence ${i} here.`,
    ).join(' ') + '\n- finaltoken without punctuation';

    const joined = splitIntoChunks(text, 200).join(' ');
    const tokens = Array.from(new Set(text.split(/\s+/).filter(Boolean)));
    for (const token of tokens) {
      expect(joined).toContain(token);
    }
  });

  it('produces multiple overlapping chunks for long input', () => {
    // Each sentence carries a unique marker so we can detect shared content
    // between consecutive chunks.
    const text = Array.from(
      { length: 40 },
      (_, i) => `Marker${i} this is filler sentence ${i} with enough length to matter.`,
    ).join(' ');

    const chunks = splitIntoChunks(text, 250);
    expect(chunks.length).toBeGreaterThan(1);

    const markersOf = (chunk: string) =>
      new Set((chunk.match(/Marker\d+/g) ?? []));

    for (let i = 1; i < chunks.length; i++) {
      const prev = markersOf(chunks[i - 1]);
      const curr = markersOf(chunks[i]);
      const shared = Array.from(curr).some((m) => prev.has(m));
      expect(shared).toBe(true); // consecutive chunks overlap
    }
  });

  it('trims every chunk and emits no empty chunks', () => {
    const text = Array.from(
      { length: 25 },
      (_, i) => `Sentence number ${i} with some content.`,
    ).join('  \n\n  ');

    const chunks = splitIntoChunks(text, 150);
    for (const chunk of chunks) {
      expect(chunk).toBe(chunk.trim());
      expect(chunk.length).toBeGreaterThan(0);
    }
  });

  it('hard-splits a single unbroken token longer than maxChunkLength', () => {
    // A long run with no whitespace — a data URI, a minified blob, a giant URL —
    // used to pass through whole as one chunk far larger than maxChunkLength,
    // risking the embedding model's token limit. It must be broken up.
    const max = 300;
    // Heterogeneous (cycling a–z) so a dropped slice is actually detectable —
    // a uniform run would mask any loss of distinct characters.
    const token = Array.from({ length: 2000 }, (_, i) =>
      String.fromCharCode(97 + (i % 26)),
    ).join('');
    const chunks = splitIntoChunks(token, max);

    expect(chunks.length).toBeGreaterThan(1); // not kept as one giant chunk
    const longest = Math.max(...chunks.map((c) => c.length));
    // Bounded like any normal chunk: at most a near-full body and one carried
    // overlap segment, each <= max, plus the joining space — never the whole
    // 2000-char token.
    expect(longest).toBeLessThanOrEqual(max * 2 + 1);
    // No character is lost — every max-sized slice of the token survives intact.
    const joined = chunks.join(' ');
    for (let i = 0; i < token.length; i += max) {
      expect(joined).toContain(token.slice(i, i + max));
    }
  });

  it('keeps chunks bounded even with a pathological overlap ratio', () => {
    // The chunk-size bound must be structural, not an accident of the default
    // overlapRatio: a caller passing a large ratio must not blow up chunk size.
    const text = Array.from(
      { length: 80 },
      (_, i) => `Sentence ${i} padded out with several extra words for length.`,
    ).join(' ');
    const max = 300;
    for (const ratio of [0.5, 0.9, 1.5, 5]) {
      const chunks = splitIntoChunks(text, max, ratio);
      for (const chunk of chunks) {
        expect(chunk.length).toBeLessThanOrEqual(max * 2 + 1);
      }
    }
  });

  it('keeps chunk sizes within a reasonable bound of maxChunkLength', () => {
    const text = Array.from(
      { length: 60 },
      (_, i) => `Sentence ${i} padded out with extra words for length.`,
    ).join(' ');

    const max = 300;
    const chunks = splitIntoChunks(text, max);
    // Same structural bound as the hard-split/pathological-ratio cases: a body
    // plus one carried overlap segment (each <= max) and the joining space.
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(max * 2 + 1);
    }
  });
});
