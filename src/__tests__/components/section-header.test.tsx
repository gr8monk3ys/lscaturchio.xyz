import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionHeader } from '@/components/ui/Section';

describe('SectionHeader', () => {
  it('renders the title and description', () => {
    render(<SectionHeader title="Selected Writing" description="A few pieces." />);
    expect(screen.getByRole('heading', { name: 'Selected Writing' })).toBeInTheDocument();
    expect(screen.getByText('A few pieces.')).toBeInTheDocument();
  });

  it('renders a catalogue kicker from index + eyebrow', () => {
    render(<SectionHeader index="01" eyebrow="Writing" title="Selected Writing" />);
    expect(screen.getByText('01 — Writing')).toBeInTheDocument();
  });

  it('always renders a hairline rule beneath the placard', () => {
    const { container } = render(<SectionHeader title="How I Work" />);
    expect(container.querySelector('hr.gallery-rule')).not.toBeNull();
  });

  it('renders an action element when provided', () => {
    render(
      <SectionHeader title="Writing" action={<a href="/blog">View all</a>} />
    );
    expect(screen.getByRole('link', { name: 'View all' })).toHaveAttribute('href', '/blog');
  });
});
