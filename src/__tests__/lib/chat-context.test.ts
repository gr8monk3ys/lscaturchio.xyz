import { describe, it, expect } from 'vitest';
import { buildSystemPromptWithContext } from '@/lib/chat/context';

const BASE = 'You are Lorenzo.';

describe('buildSystemPromptWithContext (strictly grounded)', () => {
  it('always appends the grounding directive', () => {
    const out = buildSystemPromptWithContext(BASE, null, {
      context: 'something',
      confidence: 'strong',
      closest: [],
    });
    expect(out).toContain('answer ONLY from the context');
  });

  it('includes the matched context when confidence is not none', () => {
    const out = buildSystemPromptWithContext(BASE, null, {
      context: 'I wrote about RAG systems.',
      confidence: 'strong',
      closest: [],
    });
    expect(out).toContain('I wrote about RAG systems.');
    expect(out).not.toContain("haven't written about this yet");
  });

  it('states nothing matched and lists closest notes when confidence is none', () => {
    const out = buildSystemPromptWithContext(BASE, null, {
      context: '',
      confidence: 'none',
      closest: [{ title: 'On Gardens', url: '/blog/on-gardens' }],
    });
    expect(out).toContain("haven't written about this yet");
    expect(out).toContain('On Gardens');
    expect(out).toContain('/blog/on-gardens');
  });

  it('does not emit the no-match block for weak grounding', () => {
    const out = buildSystemPromptWithContext(BASE, null, {
      context: 'a partial match',
      confidence: 'weak',
      closest: [],
    });
    expect(out).toContain('a partial match');
    expect(out).not.toContain('No matching notes');
  });
});
