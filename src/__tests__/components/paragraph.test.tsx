import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Paragraph } from '@/components/Paragraph';

const STOCK_SIZE = /^text-(xs|sm|base|lg|xl|\d+xl)$/;

/** Unprefixed font-size classes actually applied to the element. */
function sizeClasses(el: Element): string[] {
  return Array.from(el.classList).filter((c) => !c.includes(':') && STOCK_SIZE.test(c));
}

describe('Paragraph', () => {
  it('renders a <p> containing its children', () => {
    render(<Paragraph>An explanation.</Paragraph>);
    const el = screen.getByText('An explanation.');
    expect(el.tagName).toBe('P');
  });

  it('renders its text without any client-side motion gate', () => {
    const el = render(<Paragraph>Visible immediately.</Paragraph>).container
      .querySelector('p')!;
    expect(el).not.toHaveClass('opacity-0');
    expect(el.textContent).toBe('Visible immediately.');
  });

  it('keeps its colour token when the caller passes a className', () => {
    render(<Paragraph className="mt-6 text-2xl">Styled.</Paragraph>);
    const el = screen.getByText('Styled.');
    expect(el).toHaveClass('text-muted-foreground');
    expect(el).toHaveClass('mt-6');
  });

  it('applies exactly one base font size by default', () => {
    render(<Paragraph>Default size.</Paragraph>);
    expect(sizeClasses(screen.getByText('Default size.'))).toHaveLength(1);
  });

  it('lets a caller-supplied size win over the default', () => {
    render(<Paragraph className="text-2xl">Bigger.</Paragraph>);
    expect(sizeClasses(screen.getByText('Bigger.'))).toEqual(['text-2xl']);
  });

  it('lets a caller override the colour token', () => {
    render(<Paragraph className="text-foreground">Darker.</Paragraph>);
    const el = screen.getByText('Darker.');
    expect(el).toHaveClass('text-foreground');
    expect(el).not.toHaveClass('text-muted-foreground');
  });
});
