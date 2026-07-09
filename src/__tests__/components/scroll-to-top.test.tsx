import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScrollToTop } from '@/components/ui/scroll-to-top';

function setScrollOffset(value: number) {
  Object.defineProperty(window, 'pageYOffset', {
    configurable: true,
    writable: true,
    value,
  });
}

describe('ScrollToTop', () => {
  let scrollToMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scrollToMock = vi.fn();
    Object.defineProperty(window, 'scrollTo', {
      configurable: true,
      writable: true,
      value: scrollToMock,
    });
    setScrollOffset(0);
  });

  afterEach(() => {
    setScrollOffset(0);
  });

  it('is hidden before the page is scrolled', () => {
    render(<ScrollToTop />);
    expect(screen.queryByRole('button', { name: 'Scroll to top' })).toBeNull();
  });

  it('appears after scrolling past the 300px threshold', () => {
    render(<ScrollToTop />);
    setScrollOffset(400);
    fireEvent.scroll(window);
    expect(
      screen.getByRole('button', { name: 'Scroll to top' })
    ).toBeInTheDocument();
  });

  it('stays hidden at or below the threshold', () => {
    render(<ScrollToTop />);
    setScrollOffset(300);
    fireEvent.scroll(window);
    expect(screen.queryByRole('button', { name: 'Scroll to top' })).toBeNull();
  });

  it('hides again when scrolled back to the top', () => {
    render(<ScrollToTop />);
    setScrollOffset(400);
    fireEvent.scroll(window);
    expect(
      screen.getByRole('button', { name: 'Scroll to top' })
    ).toBeInTheDocument();

    setScrollOffset(0);
    fireEvent.scroll(window);
    expect(screen.queryByRole('button', { name: 'Scroll to top' })).toBeNull();
  });

  it('scrolls smoothly to the top when clicked', () => {
    render(<ScrollToTop />);
    setScrollOffset(400);
    fireEvent.scroll(window);
    fireEvent.click(screen.getByRole('button', { name: 'Scroll to top' }));
    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
