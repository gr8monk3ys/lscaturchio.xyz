import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Heading } from '@/components/Heading';

const CUSTOM_SIZES = [
  'text-display',
  'text-page-title',
  'text-section-title',
  'text-card-title',
  'text-subsection',
  'text-body',
];
const STOCK_SIZE = /^text-(xs|sm|base|lg|xl|\d+xl)$/;

/** Unprefixed font-size classes actually applied to the element. */
function sizeClasses(el: Element): string[] {
  return Array.from(el.classList)
    .filter((c) => !c.includes(':'))
    .filter((c) => CUSTOM_SIZES.includes(c) || STOCK_SIZE.test(c));
}

describe('Heading', () => {
  it('renders an h1 by default', () => {
    render(<Heading>Colophon</Heading>);
    const el = screen.getByRole('heading', { level: 1 });
    expect(el.tagName).toBe('H1');
  });

  it('renders the element named by `as`', () => {
    render(<Heading as="h3">Card title</Heading>);
    const el = screen.getByRole('heading', { level: 3 });
    expect(el.tagName).toBe('H3');
  });

  it('renders non-heading tags without a heading role', () => {
    const { container } = render(<Heading as="span">Inline</Heading>);
    expect(container.querySelector('span')?.textContent).toBe('Inline');
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('keeps its colour token when the caller passes a className', () => {
    render(<Heading as="h2" className="mt-4 text-4xl font-bold">Work</Heading>);
    const el = screen.getByRole('heading', { level: 2 });
    expect(el).toHaveClass('text-foreground');
    expect(el).toHaveClass('mt-4');
  });

  it('keeps its colour token with no className at all', () => {
    render(<Heading>Plain</Heading>);
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('text-foreground');
  });

  it('applies exactly one font size by default', () => {
    render(<Heading as="h2">Sized</Heading>);
    expect(sizeClasses(screen.getByRole('heading', { level: 2 }))).toHaveLength(1);
  });

  it('lets a caller-supplied size win over the per-tag default', () => {
    render(<Heading as="h1" className="text-4xl">Override</Heading>);
    const el = screen.getByRole('heading', { level: 1 });
    expect(sizeClasses(el)).toEqual(['text-4xl']);
  });

  it('lets a caller-supplied custom size win over the per-tag default', () => {
    render(<Heading as="h1" className="text-display">Hero</Heading>);
    const el = screen.getByRole('heading', { level: 1 });
    expect(sizeClasses(el)).toEqual(['text-display']);
  });
});
