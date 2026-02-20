import '@testing-library/jest-dom';
import { vi, type Mock } from 'vitest';
import { createElement } from 'react';

// Vitest 4.x compatibility helpers
// Add vi.mocked if not available (polyfill for older patterns)
if (typeof vi.mocked !== 'function') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (vi as any).mocked = function mocked<T>(fn: T): T & Mock {
    return fn as T & Mock;
  };
}

// Add vi.stubGlobal if not available
if (typeof vi.stubGlobal !== 'function') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (vi as any).stubGlobal = function stubGlobal(name: string, value: unknown): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any)[name] = value;
  };
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
