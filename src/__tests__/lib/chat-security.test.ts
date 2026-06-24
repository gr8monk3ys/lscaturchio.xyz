import { describe, it, expect } from 'vitest';
import { buildFallbackAnswer } from '@/lib/chat/security';

const CLOSEST = [{ title: 'On Gardens', url: '/blog/on-gardens' }];

describe('buildFallbackAnswer', () => {
  it('echoes the retrieved context when grounding is present', () => {
    const out = buildFallbackAnswer('I wrote about RAG systems at length.', [], 'strong');
    expect(out).toContain('RAG systems');
  });

  it('does NOT echo context when confidence is none, even if text was retrieved', () => {
    // Low-similarity candidates can still produce context text; presenting it as
    // "relevant" when nothing actually matched is misleading.
    const out = buildFallbackAnswer('Some only-loosely-related prose.', CLOSEST, 'none');
    expect(out).not.toContain('only-loosely-related');
    expect(out).toContain('On Gardens');
  });

  it('points at the closest notes when there is no usable context', () => {
    const out = buildFallbackAnswer('', CLOSEST, 'none');
    expect(out).toContain('On Gardens');
    expect(out).toContain('/blog/on-gardens');
  });

  it('gives a neutral message when nothing is available', () => {
    const out = buildFallbackAnswer('', [], 'none');
    expect(out).toContain('temporarily unable');
  });
});
