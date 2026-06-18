import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BlogCard } from '@/components/blog/BlogCard';

const base = {
  slug: 'nihilism-is-lazy',
  title: 'Nihilism Is Lazy Philosophy',
  description: 'Nothing matters is the intellectual equivalent of not voting.',
  date: '2026-02-10',
  image: '/images/blog/nihilism-is-lazy.webp',
  tags: ['philosophy', 'nihilism', 'meaning'],
};

describe('BlogCard', () => {
  it('links to the post and renders the title + description', () => {
    render(<BlogCard {...base} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/blog/nihilism-is-lazy');
    expect(
      screen.getByRole('heading', { name: 'Nihilism Is Lazy Philosophy' })
    ).toBeInTheDocument();
    expect(screen.getByText(/intellectual equivalent/)).toBeInTheDocument();
  });

  it('renders tags as a mono middot wall-label (first two), not pills', () => {
    render(<BlogCard {...base} />);
    // The overlay label joins the formatted date with the first two tags.
    const label = screen.getByText(/philosophy\s+·\s+nihilism/i);
    expect(label).toBeInTheDocument();
    // No filled badge/pill chrome.
    expect(document.querySelector('.rounded-full')).toBeNull();
  });

  it('uses the framed cover plate with a hairline border', () => {
    render(<BlogCard {...base} />);
    const img = screen.getByRole('img', { name: 'Nihilism Is Lazy Philosophy' });
    expect(img.closest('.border-border')).not.toBeNull();
  });

  it('falls back to the default cover when no image is given', () => {
    render(<BlogCard {...base} image="" />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toContain('default');
  });
});
