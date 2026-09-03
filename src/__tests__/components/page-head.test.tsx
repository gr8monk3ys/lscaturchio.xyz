import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHead } from '@/components/ui/page-head';

describe('PageHead', () => {
  it('renders the wall-label kicker', () => {
    render(<PageHead kicker="Garden · Reading" title="Books" />);
    expect(screen.getByText('Garden · Reading')).toBeInTheDocument();
  });

  it('renders the title as the page h1', () => {
    render(<PageHead kicker="Garden · Reading" title="Books" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Books' })).toBeInTheDocument();
  });

  it('renders the blurb beneath the title', () => {
    render(
      <PageHead kicker="Garden · Topics" title="Topics" blurb="A small set of curated hubs." />
    );
    expect(screen.getByText('A small set of curated hubs.')).toBeInTheDocument();
  });

  it('omits the blurb when there is none', () => {
    const { container } = render(<PageHead kicker="Garden · Music" title="Music" />);
    expect(container.querySelector('p')).toBeNull();
  });

  it('draws the hairline rule by default', () => {
    const { container } = render(<PageHead kicker="Colophon" title="How this is built." />);
    expect(container.querySelector('hr.gallery-rule')).not.toBeNull();
  });

  it('omits the rule when asked not to draw it', () => {
    const { container } = render(
      <PageHead kicker="Colophon" title="How this is built." rule={false} />
    );
    expect(container.querySelector('hr.gallery-rule')).toBeNull();
  });

  it('places extra head content above the rule', () => {
    const { container } = render(
      <PageHead kicker="Get in touch" title="Say hello">
        <a href="/contact">Book a call</a>
      </PageHead>
    );
    const head = container.querySelector('header');
    const nodes = Array.from(head?.children ?? []);
    const link = nodes.findIndex((n) => n.tagName === 'A');
    const rule = nodes.findIndex((n) => n.tagName === 'HR');
    expect(link).toBeGreaterThan(-1);
    expect(rule).toBeGreaterThan(link);
  });
});
