import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { ReactElement, ReactNode } from 'react';
import type { BlogPost } from '@/lib/getAllBlogs';

/**
 * `src/app/blog/[slug]/page.tsx`, the one route every essay renders through.
 *
 * Driven through the real catalogue over a fixture tree on disk, so the
 * record the page hands the layout is the one the catalogue computes: the
 * clamped date, the real reading time, the default cover. Two seams are
 * stubbed. The MDX body, because compiling MDX is the bundler's job and the
 * production build covers it. And the layout, so this file can assert exactly
 * what the route passes it; `blog-layout.test.tsx` covers what it renders.
 */

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

const loadEssayContent = vi.fn(async (slug: string) => {
  function Body() {
    return <p>body of {slug}</p>;
  }
  return Body;
});
vi.mock('@/lib/essay-content', () => ({
  loadEssayContent: (slug: string) => loadEssayContent(slug),
}));

vi.mock('@/components/blog/BlogLayout', () => ({
  BlogLayout: ({ children }: { children: ReactNode }) => children,
}));

const NOW = new Date('2026-06-15T12:00:00Z');
const TODAY = '2026-06-15';

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'essay-route-'));
const blogDir = path.join(tmpRoot, 'src', 'app', 'blog');

function writeEssay(slug: string, meta: Record<string, unknown>, words = 400) {
  const dir = path.join(blogDir, slug);
  fs.mkdirSync(dir, { recursive: true });
  const lines = Object.entries(meta).map(([key, value]) => `  ${key}: ${JSON.stringify(value)},`);
  fs.writeFileSync(
    path.join(dir, 'content.mdx'),
    ['export const meta = {', ...lines, '};', '', 'word '.repeat(words), ''].join('\n'),
    'utf-8'
  );
}

beforeAll(() => {
  writeEssay(
    'live-essay',
    {
      title: 'Live Essay',
      description: 'Already out.',
      date: '2026-01-10',
      image: '/images/blog/live-essay.webp',
      tags: ['labor'],
    },
    1400
  );
  writeEssay('no-cover', {
    title: 'No Cover',
    description: 'Shipped from the portal without an image.',
    date: '2026-02-01',
    tags: [],
  });
  writeEssay('scheduled', {
    title: 'Scheduled',
    description: 'Not out yet.',
    date: '2026-07-01',
    image: '/images/blog/scheduled.webp',
    tags: [],
  });
  // No date: the catalogue cannot order it, so the route does not serve it.
  writeEssay('dateless', { title: 'Dateless', description: 'x', tags: [] });
});

afterAll(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  loadEssayContent.mockClear();
});

/** A fresh route and catalogue over the fixture tree, on the fixed clock. */
async function loadRoute() {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
  vi.spyOn(process, 'cwd').mockReturnValue(tmpRoot);
  vi.resetModules();
  return import('@/app/blog/[slug]/page');
}

const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

async function renderEssay(slug: string) {
  const route = await loadRoute();
  const element = (await route.default(params(slug))) as ReactElement<{
    post: BlogPost;
    children: ReactElement;
  }>;
  return { post: element.props.post, children: element.props.children };
}

describe('essay route: params', () => {
  it('prerenders every essay the catalogue lists, scheduled included', async () => {
    const route = await loadRoute();
    const slugs = (await route.generateStaticParams()).map((p) => p.slug).sort();
    expect(slugs).toEqual(['live-essay', 'no-cover', 'scheduled']);
  });

  it('404s any other slug instead of rendering it on demand', async () => {
    const route = await loadRoute();
    expect(route.dynamicParams).toBe(false);
    await expect(route.default(params('dateless'))).rejects.toThrow('NEXT_NOT_FOUND');
    await expect(route.default(params('nope'))).rejects.toThrow('NEXT_NOT_FOUND');
    await expect(route.generateMetadata(params('nope'))).rejects.toThrow('NEXT_NOT_FOUND');
    expect(loadEssayContent).not.toHaveBeenCalled();
  });
});

describe('essay route: the record it renders', () => {
  it("hands the layout the catalogue's record and the essay's MDX body", async () => {
    const { post, children } = await renderEssay('live-essay');
    expect(post.slug).toBe('live-essay');
    expect(post.title).toBe('Live Essay');
    expect(post.date).toBe('2026-01-10');
    expect(loadEssayContent).toHaveBeenCalledWith('live-essay');
    expect((children.type as () => ReactElement)()).toEqual(<p>body of {'live-essay'}</p>);
  });

  it('carries the real reading time, not a default', async () => {
    const long = await renderEssay('live-essay');
    const short = await renderEssay('no-cover');
    expect(long.post.readingTimeMinutes).toBeGreaterThan(short.post.readingTimeMinutes);
    expect(long.post.readingTimeMinutes).not.toBe(5);
  });

  it('applies the default cover when the meta has none', async () => {
    const { post } = await renderEssay('no-cover');
    expect(post.image).toBe('/images/blog/default.webp');
  });

  it('renders a scheduled essay at its URL, with its date clamped to today', async () => {
    const { post } = await renderEssay('scheduled');
    expect(post.published).toBe(false);
    expect(post.date).toBe(TODAY);
  });
});

describe('essay route: metadata', () => {
  it('builds title, canonical and OG from the catalogue record', async () => {
    const route = await loadRoute();
    const metadata = await route.generateMetadata(params('live-essay'));
    expect(metadata.title).toBe('Live Essay');
    expect(metadata.description).toBe('Already out.');
    expect(metadata.alternates?.canonical).toBe('/blog/live-essay');
    expect(metadata.openGraph).toMatchObject({ type: 'article', url: '/blog/live-essay' });
  });
});
