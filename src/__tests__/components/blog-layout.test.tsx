import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BlogLayout } from '@/components/blog/BlogLayout';
import { getSiteUrl } from '@/lib/site-url';

// The layout composes many interactive widgets that have their own tests
// (or fetch on mount). Stub them so this file tests the layout itself.
// The shell no longer reads `usePathname()`; the slug arrives as a prop.
vi.mock('@/components/blog/text-to-speech', () => ({ TextToSpeech: () => null }));
vi.mock('@/components/blog/series-navigation', () => ({ SeriesNavigation: () => null }));
vi.mock('@/components/blog/webmentions', () => ({ Webmentions: () => null }));
vi.mock('@/components/blog/giscus-comments', () => ({ GiscusComments: () => null }));
vi.mock('@/components/blog/related-posts', () => ({ RelatedPosts: () => null }));
vi.mock('@/components/blog/blog-sidebar', () => ({
  BlogSidebar: () => null,
  EssayContentsInline: () => null,
  EssayAskInline: () => null,
}));
vi.mock('@/components/blog/view-counter', () => ({
  ViewCounter: () => <span data-testid="view-counter" />,
}));
vi.mock('@/components/blog/social-share', () => ({
  SocialShare: ({ url }: { url: string }) => <div data-testid="social-share">{url}</div>,
}));
vi.mock('@/components/blog/newsletter-cta', () => ({
  NewsletterCTA: () => <div data-testid="newsletter-cta" />,
}));
vi.mock('@/components/blog/reading-progress-tracker', () => ({
  ReadingProgressTracker: () => null,
}));
// The shell derives reading time from the essay sources; double the lookup
// rather than the filesystem.
vi.mock('@/lib/getAllBlogs', () => ({
  getReadingTimeMinutes: vi.fn(async (slug: string) =>
    slug === 'strikes-work' ? 7 : undefined
  ),
}));

const meta = {
  title: 'Strikes Work',
  description: 'Labor history without the amnesia.',
  date: '2025-06-02',
  image: '/images/blog/strikes-work.webp',
  tags: ['labor', 'ai'],
};

/** `BlogLayout` is an async Server Component, so await it before rendering. */
async function renderLayout(props: Parameters<typeof BlogLayout>[0]) {
  return render(await BlogLayout(props));
}

describe('BlogLayout', () => {
  it('returns bare children for the RSS feed rendering', async () => {
    const { container } = await renderLayout({
      meta,
      slug: 'strikes-work',
      isRssFeed: true,
      children: <p>article body</p>,
    });
    expect(screen.getByText('article body')).toBeInTheDocument();
    expect(container.querySelector('article')).toBeNull();
  });

  it('renders the header: title, description, date, reading time, tag links', async () => {
    await renderLayout({ meta, slug: 'strikes-work', children: <p>body</p> });
    expect(screen.getByRole('heading', { name: 'Strikes Work' })).toBeInTheDocument();
    expect(screen.getByText('Labor history without the amnesia.')).toBeInTheDocument();
    expect(screen.getByText('7 min')).toBeInTheDocument();
    const time = document.querySelector('time');
    expect(time).toHaveAttribute('dateTime', '2025-06-02');
    expect(screen.getByRole('link', { name: 'labor' })).toHaveAttribute(
      'href',
      '/tag/labor'
    );
  });

  it('builds the canonical URL from the site origin, not window.location', async () => {
    await renderLayout({ meta, slug: 'strikes-work', children: <p>body</p> });
    const canonical = `${getSiteUrl()}/blog/strikes-work`;
    expect(screen.getByTestId('social-share')).toHaveTextContent(canonical);
    const schema = JSON.parse(
      document.getElementById('blog-schema')?.textContent ?? '{}'
    );
    expect(schema.mainEntityOfPage['@id']).toBe(canonical);
  });

  it('shows an updated line only when meta.updated exists', async () => {
    await renderLayout({ meta, slug: 'strikes-work', children: <p>body</p> });
    expect(screen.queryByText(/^Updated/)).toBeNull();
    cleanup();
    await renderLayout({
      meta: { ...meta, updated: '2026-01-10' },
      slug: 'strikes-work',
      children: <p>body</p>,
    });
    expect(screen.getByText(/^Updated/)).toBeInTheDocument();
  });

  it('links topic hubs matched from the post tags', async () => {
    await renderLayout({ meta, slug: 'strikes-work', children: <p>body</p> });
    // The 'ai' tag maps to at least one /topics/ hub.
    expect(screen.getByText('Explore')).toBeInTheDocument();
    const hubLinks = screen
      .getAllByRole('link')
      .filter((l) => l.getAttribute('href')?.startsWith('/topics/'));
    expect(hubLinks.length).toBeGreaterThan(0);
  });

  it('renders syndication links only when provided', async () => {
    await renderLayout({
      meta: { ...meta, syndication: ['https://bsky.app/profile/x/post/1'] },
      slug: 'strikes-work',
      children: <p>body</p>,
    });
    expect(screen.getByRole('link', { name: /Bluesky/ })).toBeInTheDocument();
  });

  it('shows a back button that walks browser history when there is a previous page', async () => {
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    await renderLayout({
      meta,
      slug: 'strikes-work',
      previousPathname: '/blog',
      children: <p>body</p>,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Go back to blogs' }));
    expect(back).toHaveBeenCalledOnce();
    back.mockRestore();
  });

  it('omits reading time entirely when the essay has no source', async () => {
    // Regression: the old prop defaulted to 5, so eighty-one essays quoted a
    // number nothing had computed. Absent must render absent.
    await renderLayout({ meta, slug: 'not-an-essay', children: <p>body</p> });
    expect(screen.queryByText(/\d+ min/)).toBeNull();
  });
});
