import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { ReadingProgress } from '@/components/blog/reading-progress';

function setScroll({ scrollY, scrollHeight, innerHeight }: {
  scrollY: number; scrollHeight: number; innerHeight: number;
}) {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: scrollY });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: innerHeight });
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    value: scrollHeight,
  });
}

describe('ReadingProgress', () => {
  it('starts hidden at the top of the page', () => {
    setScroll({ scrollY: 0, scrollHeight: 3000, innerHeight: 1000 });
    const { container } = render(<ReadingProgress />);
    const bar = container.firstElementChild as HTMLElement;
    expect(bar.style.transform).toBe('scaleX(0)');
    expect(bar.style.opacity).toBe('0');
  });

  it('scales with scroll position and becomes visible past 5%', () => {
    setScroll({ scrollY: 0, scrollHeight: 3000, innerHeight: 1000 });
    const { container } = render(<ReadingProgress />);
    act(() => {
      setScroll({ scrollY: 1000, scrollHeight: 3000, innerHeight: 1000 });
      window.dispatchEvent(new Event('scroll'));
    });
    const bar = container.firstElementChild as HTMLElement;
    expect(bar.style.transform).toBe('scaleX(0.5)');
    expect(bar.style.opacity).toBe('1');
  });

  it('clamps progress to 1 when overscrolled', () => {
    setScroll({ scrollY: 0, scrollHeight: 3000, innerHeight: 1000 });
    const { container } = render(<ReadingProgress />);
    act(() => {
      setScroll({ scrollY: 5000, scrollHeight: 3000, innerHeight: 1000 });
      window.dispatchEvent(new Event('scroll'));
    });
    expect((container.firstElementChild as HTMLElement).style.transform).toBe('scaleX(1)');
  });

  it('treats an unscrollable page as zero progress', () => {
    setScroll({ scrollY: 0, scrollHeight: 800, innerHeight: 1000 });
    const { container } = render(<ReadingProgress />);
    expect((container.firstElementChild as HTMLElement).style.transform).toBe('scaleX(0)');
  });
});
