import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/ui/footer-section';
import { footerColumns } from '@/constants/navlinks';

describe('Footer', () => {
  it('renders all four site-map columns', () => {
    render(<Footer />);
    for (const column of footerColumns) {
      expect(
        screen.getByRole('navigation', { name: column.name })
      ).toBeInTheDocument();
    }
  });

  it('renders every site-map link with its href', () => {
    render(<Footer />);
    for (const column of footerColumns) {
      for (const item of column.items) {
        const link = screen.getByRole('link', { name: item.name });
        expect(link).toHaveAttribute('href', item.href);
      }
    }
  });

  it('keeps the legal links in the bottom bar', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
      'href',
      '/privacy-policy'
    );
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute(
      'href',
      '/terms-of-service'
    );
    expect(screen.getByRole('link', { name: 'Stats' })).toHaveAttribute('href', '/stats');
  });

  it('renders the email and feed links in the colophon', () => {
    render(<Footer />);
    expect(
      screen.getByRole('link', { name: 'lorenzosca7@protonmail.ch' })
    ).toHaveAttribute('href', 'mailto:lorenzosca7@protonmail.ch');
    expect(screen.getByRole('link', { name: /RSS/ })).toHaveAttribute('href', '/api/rss');
  });
});
