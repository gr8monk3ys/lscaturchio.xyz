import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BlogLayout } from '@/components/blog/BlogLayout';
import { getSiteUrl } from '@/lib/site-url';

// The layout composes many interactive widgets that have their own tests
// (or fetch on mount). Stub them so this file tests the layout itself.
vi.mock('next/navigation', () => ({
  usePathname: () => '/blog/strikes-work',
}));
vi.mock('next/dynamic', () => ({ default: () => () => null }));
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

const meta = {
  title: 'Strikes Work',
  description: 'Labor history without the amnesia.',
  date: '2025-06-02',
  image: '/images/blog/strikes-work.webp',
  tags: ['labor', 'ai'],
};

describe('BlogLayout', () => {
  it('returns bare children for the RSS feed rendering', () => {
    const { container } = render(
      <BlogLayout meta={meta} isRssFeed>
        <p>article body</p>
      </BlogLayout>
    );
    expect(screen.getByText('article body')).toBeInTheDocument();
    expect(container.querySelector('article')).toBeNull();
  });

  it('renders the header: title, description, date, reading time, tag links', () => {
    render(
      <BlogLayout meta={meta} readingTime={7}>
        <p>body</p>
      </BlogLayout>
    );
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

  it('builds the canonical URL from the site origin, not window.location', () => {
    render(
      <BlogLayout meta={meta}>
        <p>body</p>
      </BlogLayout>
    );
    const canonical = `${getSiteUrl()}/blog/strikes-work`;
    expect(screen.getByTestId('social-share')).toHaveTextContent(canonical);
    const schema = JSON.parse(
      document.getElementById('blog-schema')?.textContent ?? '{}'
    );
    expect(schema.mainEntityOfPage['@id']).toBe(canonical);
  });

  it('shows an updated line only when meta.updated exists', () => {
    const { rerender } = render(
      <BlogLayout meta={meta}>
        <p>body</p>
      </BlogLayout>
    );
    expect(screen.queryByText(/^Updated/)).toBeNull();
    rerender(
      <BlogLayout meta={{ ...meta, updated: '2026-01-10' }}>
        <p>body</p>
      </BlogLayout>
    );
    expect(screen.getByText(/^Updated/)).toBeInTheDocument();
  });

  it('links topic hubs matched from the post tags', () => {
    render(
      <BlogLayout meta={meta}>
        <p>body</p>
      </BlogLayout>
    );
    // The 'ai' tag maps to at least one /topics/ hub.
    expect(screen.getByText('Explore')).toBeInTheDocument();
    const hubLinks = screen
      .getAllByRole('link')
      .filter((l) => l.getAttribute('href')?.startsWith('/topics/'));
    expect(hubLinks.length).toBeGreaterThan(0);
  });

  it('renders syndication links only when provided', () => {
    render(
      <BlogLayout meta={{ ...meta, syndication: ['https://bsky.app/profile/x/post/1'] }}>
        <p>body</p>
      </BlogLayout>
    );
    expect(screen.getByRole('link', { name: /Bluesky/ })).toBeInTheDocument();
  });

  it('shows a back button that walks browser history when there is a previous page', async () => {
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    render(
      <BlogLayout meta={meta} previousPathname="/blog">
        <p>body</p>
      </BlogLayout>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Go back to blogs' }));
    expect(back).toHaveBeenCalledOnce();
    back.mockRestore();
  });
});
