import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActiveNavLink } from '@/components/ui/active-nav-link';

const usePathnameMock = vi.hoisted(() => vi.fn((): string => '/'));

vi.mock('next/navigation', () => ({
  usePathname: usePathnameMock,
}));

describe('ActiveNavLink', () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue('/');
  });

  it('marks the link with aria-current when the path matches exactly', () => {
    usePathnameMock.mockReturnValue('/blog');
    render(<ActiveNavLink href="/blog">Blog</ActiveNavLink>);

    const link = screen.getByRole('link', { name: 'Blog' });
    expect(link).toHaveAttribute('href', '/blog');
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  it('stays active on nested paths under the href', () => {
    usePathnameMock.mockReturnValue('/blog/some-post');
    render(<ActiveNavLink href="/blog">Blog</ActiveNavLink>);

    expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('omits aria-current when the path does not match', () => {
    usePathnameMock.mockReturnValue('/about');
    render(<ActiveNavLink href="/blog">Blog</ActiveNavLink>);

    expect(screen.getByRole('link', { name: 'Blog' })).not.toHaveAttribute(
      'aria-current'
    );
  });

  it('treats the home href as active only on the exact root path', () => {
    usePathnameMock.mockReturnValue('/blog');
    const { unmount } = render(<ActiveNavLink href="/">Home</ActiveNavLink>);
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute(
      'aria-current'
    );
    unmount();

    usePathnameMock.mockReturnValue('/');
    render(<ActiveNavLink href="/">Home</ActiveNavLink>);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('applies activeClassName when active and inactiveClassName otherwise', () => {
    usePathnameMock.mockReturnValue('/blog');
    const { unmount } = render(
      <ActiveNavLink
        href="/blog"
        className="base"
        activeClassName="is-active"
        inactiveClassName="is-inactive"
      >
        Blog
      </ActiveNavLink>
    );
    let link = screen.getByRole('link', { name: 'Blog' });
    expect(link).toHaveClass('base', 'is-active');
    expect(link).not.toHaveClass('is-inactive');
    unmount();

    usePathnameMock.mockReturnValue('/about');
    render(
      <ActiveNavLink
        href="/blog"
        className="base"
        activeClassName="is-active"
        inactiveClassName="is-inactive"
      >
        Blog
      </ActiveNavLink>
    );
    link = screen.getByRole('link', { name: 'Blog' });
    expect(link).toHaveClass('base', 'is-inactive');
    expect(link).not.toHaveClass('is-active');
  });
});
