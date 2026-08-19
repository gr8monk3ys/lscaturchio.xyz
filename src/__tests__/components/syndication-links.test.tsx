import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SyndicationLinks } from '@/components/blog/syndication-links';

describe('SyndicationLinks', () => {
  it('renders nothing when links are missing or blank', () => {
    const { container: empty } = render(<SyndicationLinks />);
    expect(empty).toBeEmptyDOMElement();
    const { container: blanks } = render(<SyndicationLinks links={['', '   ']} />);
    expect(blanks).toBeEmptyDOMElement();
  });

  it('labels Bluesky and Mastodon links by hostname', () => {
    render(
      <SyndicationLinks
        links={[
          'https://bsky.app/profile/lorenzo/post/1',
          'https://fosstodon.org/@lorenzo/2',
        ]}
      />
    );
    expect(screen.getByRole('link', { name: /Bluesky/ })).toHaveAttribute(
      'href',
      'https://bsky.app/profile/lorenzo/post/1'
    );
    expect(screen.getByRole('link', { name: /Mastodon/ })).toBeInTheDocument();
  });

  it('falls back to a generic label and sets syndication rel', () => {
    render(<SyndicationLinks links={['https://example.com/elsewhere']} />);
    const link = screen.getByRole('link', { name: /Syndication/ });
    expect(link).toHaveAttribute('rel', 'syndication noopener noreferrer');
    expect(link).toHaveAttribute('target', '_blank');
  });
});
