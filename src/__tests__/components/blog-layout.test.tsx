import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BlogLayout } from '@/components/blog/BlogLayout';
import { getSiteUrl } from '@/lib/site-url';
import type { BlogPost } from '@/lib/getAllBlogs';

// The layout composes many interactive widgets that have their own tests
// (or fetch on mount). Stub them so this file tests the layout itself.
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

// No catalogue double. The layout takes the catalogue's record as a prop and
// reads nothing else, so this record is its whole input.
const post: BlogPost = {
  slug: 'strikes-work',
  title: 'Strikes Work',
  description: 'Labor history without the amnesia.',
  date: '2025-06-02',
  image: '/images/blog/strikes-work.webp',
  tags: ['labor', 'ai'],
  body: 'Body text.',
  published: true,
  readingTimeMinutes: 7,
  words: 1400,
};

function renderLayout(props: Parameters<typeof BlogLayout>[0]) {
  return render(BlogLayout(props));
}

describe('BlogLayout', () => {
  it('returns bare children for the RSS feed rendering', () => {
    const { container } = renderLayout({
      post,
      isRssFeed: true,
      children: <p>article body</p>,
    });
    expect(screen.getByText('article body')).toBeInTheDocument();
    expect(container.querySelector('article')).toBeNull();
  });

  it('renders the header: title, description, date, reading time, tag links', () => {
    renderLayout({ post, children: <p>body</p> });
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

  it('renders the record as given rather than re-deriving it', () => {
    // The catalogue has already clamped a scheduled date to today and applied
    // the default cover. The layout used to re-run the clamp on raw meta and
    // look reading time back up by slug; it must now show exactly this.
    renderLayout({
      post: {
        ...post,
        date: '2026-01-01',
        image: '/images/blog/default.webp',
        readingTimeMinutes: 12,
        published: false,
      },
      children: <p>body</p>,
    });
    expect(document.querySelector('time')).toHaveAttribute('dateTime', '2026-01-01');
    expect(screen.getByText('12 min')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Strikes Work' }).getAttribute('src')).toContain(
      'default.webp'
    );
  });

  it('builds the canonical URL from the site origin, not window.location', () => {
    renderLayout({ post, children: <p>body</p> });
    const canonical = `${getSiteUrl()}/blog/strikes-work`;
    expect(screen.getByTestId('social-share')).toHaveTextContent(canonical);
    const schema = JSON.parse(
      document.getElementById('blog-schema')?.textContent ?? '{}'
    );
    expect(schema.mainEntityOfPage['@id']).toBe(canonical);
  });

  it('shows an updated line only when the record has one', () => {
    renderLayout({ post, children: <p>body</p> });
    expect(screen.queryByText(/^Updated/)).toBeNull();
    cleanup();
    renderLayout({
      post: { ...post, updated: '2026-01-10' },
      children: <p>body</p>,
    });
    expect(screen.getByText(/^Updated/)).toBeInTheDocument();
  });

  it('links topic hubs matched from the post tags', () => {
    renderLayout({ post, children: <p>body</p> });
    // The 'ai' tag maps to at least one /topics/ hub.
    expect(screen.getByText('Explore')).toBeInTheDocument();
    const hubLinks = screen
      .getAllByRole('link')
      .filter((l) => l.getAttribute('href')?.startsWith('/topics/'));
    expect(hubLinks.length).toBeGreaterThan(0);
  });

  it('renders syndication links only when provided', () => {
    renderLayout({
      post: { ...post, syndication: ['https://bsky.app/profile/x/post/1'] },
      children: <p>body</p>,
    });
    expect(screen.getByRole('link', { name: /Bluesky/ })).toBeInTheDocument();
  });

  it('shows a back button that walks browser history when there is a previous page', () => {
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    renderLayout({
      post,
      previousPathname: '/blog',
      children: <p>body</p>,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Go back to blogs' }));
    expect(back).toHaveBeenCalledOnce();
    back.mockRestore();
  });
});
