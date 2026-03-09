import '@testing-library/jest-dom';
import { vi, type Mock } from 'vitest';
import { createElement } from 'react';

// Vitest 4.x compatibility helpers
// Add vi.mocked if not available (polyfill for older patterns)
if (typeof vi.mocked !== 'function') {
  Object.defineProperty(vi, 'mocked', {
    configurable: true,
    value<T>(fn: T): T & Mock {
      return fn as T & Mock;
    },
    writable: true,
  });
}

// Add vi.stubGlobal if not available
if (typeof vi.stubGlobal !== 'function') {
  Object.defineProperty(vi, 'stubGlobal', {
    configurable: true,
    value(name: string | number | symbol, value: unknown): void {
      Object.defineProperty(globalThis, name, {
        configurable: true,
        value,
        writable: true,
      });
    },
    writable: true,
  });
}

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => {
    return createElement('img', { src, alt, ...props });
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});
