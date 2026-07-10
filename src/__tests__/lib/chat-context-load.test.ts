import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import { loadBlogContext, buildSystemPromptWithContext } from '@/lib/chat/context';

vi.mock('fs/promises', () => ({
  default: { access: vi.fn(), readFile: vi.fn() },
}));

const mockAccess = vi.mocked(fs.access);
const mockReadFile = vi.mocked(fs.readFile);

const MDX = `import { Sidenote } from "@/components/sidenote";

export const meta = {
  title: "Digital Gardens",
  description: "Notes on tending a garden of notes.",
  date: "2026-01-01",
  image: "/blog/gardens.webp",
  tags: ["writing"],
};

## Why gardens

Because [streams](/blog/streams) wash away.

### Tending

Prune often.

# A top-level heading that should be ignored
`;

/** Only the given relative path (under src/app/blog) exists. */
function onlyFileExists(relPath: string, content: string) {
  const target = path.join(process.cwd(), 'src', 'app', 'blog', relPath);
  mockAccess.mockImplementation((p) =>
    String(p) === target ? Promise.resolve() : Promise.reject(new Error('ENOENT')),
  );
  mockReadFile.mockResolvedValue(content);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('loadBlogContext', () => {
  it('returns null when no MDX file exists for the slug', async () => {
    mockAccess.mockRejectedValue(new Error('ENOENT'));
    expect(await loadBlogContext('missing-post')).toBeNull();
    expect(mockReadFile).not.toHaveBeenCalled();
  });

  it('loads <slug>/content.mdx and extracts meta, headings, and text', async () => {
    onlyFileExists(path.join('digital-gardens', 'content.mdx'), MDX);

    const ctx = await loadBlogContext('digital-gardens');

    expect(ctx).not.toBeNull();
    expect(ctx!.title).toBe('Digital Gardens');
    expect(ctx!.description).toBe('Notes on tending a garden of notes.');
    // Only ##/### headings count, markdown links are flattened to their text.
    expect(ctx!.headings).toEqual(['Why gardens', 'Tending']);
    expect(ctx!.text).toContain('Prune often.');
  });

  it('falls back to the flat <slug>.mdx layout', async () => {
    onlyFileExists('digital-gardens.mdx', MDX);

    const ctx = await loadBlogContext('digital-gardens');

    expect(ctx?.title).toBe('Digital Gardens');
    expect(mockReadFile).toHaveBeenCalledTimes(1);
  });

  it('strips import lines and the meta export from the context text', async () => {
    onlyFileExists('digital-gardens.mdx', MDX);

    const ctx = await loadBlogContext('digital-gardens');

    expect(ctx!.text).not.toContain('import {');
    expect(ctx!.text).not.toContain('export const meta');
    expect(ctx!.text).toContain('Because [streams](/blog/streams) wash away.');
  });

  it('truncates oversized posts and marks the cut', async () => {
    const huge = `## Only Heading\n\n${'x'.repeat(9000)}`;
    onlyFileExists('big-post.mdx', huge);

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
