import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';

const usePathnameMock = vi.hoisted(() => vi.fn((): string => '/'));

vi.mock('next/navigation', () => ({
  usePathname: usePathnameMock,
}));

describe('BreadcrumbNav', () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue('/');
  });

  it('renders nothing on the home page', () => {
    const { container } = render(<BreadcrumbNav />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a breadcrumb trail derived from the pathname', () => {
    usePathnameMock.mockReturnValue('/blog/some-post');
    render(<BreadcrumbNav />);

    expect(
      screen.getByRole('navigation', { name: 'Breadcrumb' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/'
    );
    expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute(
      'href',
      '/blog'
    );
  });

  it('marks the last segment as the current page, not a link', () => {
    usePathnameMock.mockReturnValue('/blog/some-post');
    render(<BreadcrumbNav />);

    const current = screen.getByText('Some post');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('link', { name: 'Some post' })).toBeNull();
  });

  it('uses custom segment labels exactly as given', () => {
    usePathnameMock.mockReturnValue('/blog/some-post');
    // Verbatim, not re-cased. This test used to assert the opposite — that
    // 'my custom title' came out 'My custom title' — which is wrong for the
    // only thing that passes a custom label: an essay's own `meta.title`,
    // already cased by its author. Re-casing it turned "AI Art and the Death
    // of Process" into a guess.
    render(<BreadcrumbNav customSegments={{ 'some-post': 'AI Art and the Death of Process' }} />);

    expect(screen.getByText('AI Art and the Death of Process')).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('leaves hyphens alone in a custom label', () => {
    usePathnameMock.mockReturnValue('/blog/some-post');
    // The slug transform replaces hyphens with spaces, which is right for a
    // slug and wrong for a title: "Trade-offs" was becoming "Trade offs".
    render(<BreadcrumbNav customSegments={{ 'some-post': 'Trade-offs in Retrieval' }} />);

    expect(screen.getByText('Trade-offs in Retrieval')).toBeInTheDocument();
  });

  it('supports a custom home label', () => {
    usePathnameMock.mockReturnValue('/blog');
    render(<BreadcrumbNav homeLabel="Start" />);

    expect(screen.getByRole('link', { name: 'Start' })).toHaveAttribute(
      'href',
      '/'
    );
  });

  it('omits the home crumb when excludeHome is set', () => {
    usePathnameMock.mockReturnValue('/blog/some-post');
    render(<BreadcrumbNav excludeHome />);

    expect(screen.queryByRole('link', { name: 'Home' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute(
      'href',
      '/blog'
    );
  });
});
