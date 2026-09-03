import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

/**
 * Regression tests for the custom `@utility` font sizes declared in
 * `src/app/globals.css`. Stock tailwind-merge classifies any unknown `text-*`
 * class as a text COLOUR, which silently deleted `text-foreground` from every
 * heading and let two font sizes survive in the same class list.
 */

const CUSTOM_SIZES = [
  'text-display',
  'text-page-title',
  'text-section-title',
  'text-card-title',
  'text-subsection',
  'text-body-lg',
  'text-body',
  'text-body-sm',
  'text-description',
  'text-description-sm',
  'text-label',
  'label-mono',
];

const STOCK_SIZE = /^text-(xs|sm|base|lg|xl|\d+xl)$/;

/** Every unprefixed font-size class left in the merged output. */
function sizeClasses(merged: string): string[] {
  return merged
    .split(' ')
    .filter((c) => !c.includes(':'))
    .filter((c) => CUSTOM_SIZES.includes(c) || STOCK_SIZE.test(c));
}

describe('cn with project @utility font sizes', () => {
  it('keeps a colour token alongside a custom size utility', () => {
    for (const size of CUSTOM_SIZES) {
      const out = cn('text-foreground', size);
      expect(out.split(' ')).toContain('text-foreground');
      expect(out.split(' ')).toContain(size);
    }
  });

  it('lets a caller-supplied text-4xl beat the module default text-page-title', () => {
    const out = cn(
      'font-display tracking-tight text-foreground text-page-title',
      'mt-4 text-4xl font-bold md:text-5xl'
    );
    expect(sizeClasses(out)).toEqual(['text-4xl']);
    expect(out.split(' ')).toContain('text-foreground');
    expect(out).not.toContain('text-page-title');
  });

  it('lets a custom size beat a stock size when the custom one comes last', () => {
    expect(sizeClasses(cn('text-4xl', 'text-page-title'))).toEqual(['text-page-title']);
  });

  it('treats two custom sizes as conflicting, last one wins', () => {
    expect(sizeClasses(cn('text-page-title', 'text-section-title'))).toEqual([
      'text-section-title',
    ]);
  });

  it('does not let label-mono eat a colour class', () => {
    const out = cn('label-mono', 'text-primary').split(' ');
    expect(out).toContain('label-mono');
    expect(out).toContain('text-primary');
  });

  it('still resolves ordinary Tailwind conflicts', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });
});
