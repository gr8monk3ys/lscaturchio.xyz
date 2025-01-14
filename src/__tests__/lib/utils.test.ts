import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cn, isMobile } from '@/lib/utils';

describe('cn (className utility)', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', true && 'active')).toBe('base active');
    expect(cn('base', false && 'active')).toBe('base');
  });

  it('merges Tailwind classes properly', () => {
    // Should keep the last conflicting class
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('handles arrays of classes', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('handles objects with boolean values', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  it('handles undefined and null values', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });

  it('handles empty strings', () => {
    expect(cn('foo', '', 'bar')).toBe('foo bar');
  });
});

describe('isMobile', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false when window is undefined (SSR)', () => {
    const originalWindow = global.window;
    // @ts-expect-error - testing SSR
    delete global.window;

    expect(isMobile()).toBe(false);

    global.window = originalWindow;
  });

  it('returns true for mobile widths (<= 1024px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    expect(isMobile()).toBe(true);
  });

  it('returns true for tablet widths (1024px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    expect(isMobile()).toBe(true);
  });

  it('returns false for desktop widths (> 1024px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });

    expect(isMobile()).toBe(false);
  });
});
