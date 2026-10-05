import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadBlogContext, buildSystemPromptWithContext } from '@/lib/chat/context';
import { getEssaySource, type EssaySource } from '@/lib/essay-sources';

// Finding the essay and deriving its body are essay-sources' job, pinned in
// essay-sources.test.ts. Chat context only shapes an EssaySource.
vi.mock('@/lib/essay-sources', () => ({ getEssaySource: vi.fn() }));

const mockGetEssaySource = vi.mocked(getEssaySource);

function essay(body: string, meta: EssaySource['meta'] = {}): EssaySource {
  return {
    slug: 'digital-gardens',
    relativePath: 'digital-gardens/content.mdx',
    filePath: '/blog/digital-gardens/content.mdx',
    source: '',
    meta,
    body,
  };
}

const BODY = `## Why gardens

Because [streams](/blog/streams) wash away.

### Tending

Prune often.

# A top-level heading that should be ignored`;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('loadBlogContext', () => {
  it('returns null when there is no such essay', async () => {
    mockGetEssaySource.mockResolvedValue(null);
    expect(await loadBlogContext('missing-post')).toBeNull();
  });

  it("carries the essay's meta, ##/### headings, and its body", async () => {
    mockGetEssaySource.mockResolvedValue(
      essay(BODY, { title: 'Digital Gardens', description: 'Notes on tending.' }),
    );

    const ctx = await loadBlogContext('digital-gardens');

    expect(mockGetEssaySource).toHaveBeenCalledWith('digital-gardens');
    expect(ctx).toEqual({
      title: 'Digital Gardens',
      description: 'Notes on tending.',
      // Markdown links are flattened to their text; a # heading is not a section.
      headings: ['Why gardens', 'Tending'],
      text: BODY,
    });
  });

  it('truncates oversized posts and marks the cut', async () => {
    const huge = `## Only Heading\n\n${'x'.repeat(9000)}`;
    mockGetEssaySource.mockResolvedValue(essay(huge));

    const ctx = await loadBlogContext('big-post');

    expect(ctx!.text.endsWith('[truncated]')).toBe(true);
    expect(ctx!.text.length).toBeLessThan(huge.length);
  });
});

describe('buildSystemPromptWithContext with a post context', () => {
  const RETRIEVAL = { context: 'matched text', confidence: 'strong' as const, closest: [] };

  it('renders title, description, sections, and content', () => {
    const out = buildSystemPromptWithContext('Base.', {
      title: 'Digital Gardens',
      description: 'Notes on tending.',
      headings: ['Why gardens', 'Tending'],
      text: 'Body text.',
    }, RETRIEVAL);

    expect(out).toContain('Blog post context:');
    expect(out).toContain('Title: Digital Gardens');
    expect(out).toContain('Description: Notes on tending.');
    expect(out).toContain('Sections:\n- Why gardens\n- Tending');
    expect(out).toContain('Post content:\nBody text.');
  });

  it('omits the sections list when the post has no headings', () => {
    const out = buildSystemPromptWithContext('Base.', {
      headings: [],
      text: 'Body text.',
    }, RETRIEVAL);

    expect(out).toContain('Blog post context:');
    expect(out).not.toContain('Sections:');
  });
});
