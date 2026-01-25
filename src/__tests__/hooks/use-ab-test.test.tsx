import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useABTest, useVariant, ABTestVariant } from '@/hooks/use-ab-test';
import { render, screen } from '@testing-library/react';

// Mock the ab-testing module
vi.mock('@/lib/ab-testing', () => ({
  getVariant: vi.fn(),
  trackVariantView: vi.fn(),
  experiments: {
    'test-experiment': {
      id: 'test-experiment',
      name: 'Test Experiment',
      variants: ['control', 'variant-a', 'variant-b'],
      weights: [0.5, 0.25, 0.25],
    },
    'blog-layout': {
      id: 'blog-layout',
      name: 'Blog Layout Style',
      variants: ['default', 'compact', 'wide'],
      weights: [0.8, 0.1, 0.1],
    },
  },
}));

// Mock useIsClient hook
vi.mock('@/hooks/use-is-client', () => ({
  useIsClient: vi.fn(),
}));

import { getVariant, trackVariantView, experiments } from '@/lib/ab-testing';
import { useIsClient } from '@/hooks/use-is-client';

describe('useABTest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default to client-side environment
    (useIsClient as ReturnType<typeof vi.fn>).mockReturnValue(true);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('variant assignment', () => {
    it('returns assigned variant from getVariant', () => {
      (getVariant as ReturnType<typeof vi.fn>).mockReturnValue('variant-a');

      const { result } = renderHook(() => useABTest('test-experiment'));

      expect(result.current.variant).toBe('variant-a');
      expect(result.current.isLoading).toBe(false);
    });

    it('returns experiment info', () => {
      (getVariant as ReturnType<typeof vi.fn>).mockReturnValue('control');

      const { result } = renderHook(() => useABTest('test-experiment'));

      expect(result.current.experiment).toEqual({
        id: 'test-experiment',
        name: 'Test Experiment',
        variants: ['control', 'variant-a', 'variant-b'],
        weights: [0.5, 0.25, 0.25],
      });
    });

    it('returns null for non-existent experiment', () => {
      (getVariant as ReturnType<typeof vi.fn>).mockReturnValue(null);

      const { result } = renderHook(() => useABTest('non-existent'));

      expect(result.current.variant).toBe(null);
      expect(result.current.experiment).toBe(null);
    });

    it('handles different experiment IDs', () => {
      (getVariant as ReturnType<typeof vi.fn>).mockReturnValue('compact');

      const { result } = renderHook(() => useABTest('blog-layout'));

      expect(result.current.variant).toBe('compact');
      expect(result.current.experiment?.name).toBe('Blog Layout Style');
    });
  });

  describe('SSR behavior', () => {
    it('returns null variant and isLoading=true on server', () => {
      (useIsClient as ReturnType<typeof vi.fn>).mockReturnValue(false);
      (getVariant as ReturnType<typeof vi.fn>).mockReturnValue('variant-a');

      const { result } = renderHook(() => useABTest('test-experiment'));

      expect(result.current.variant).toBe(null);
      expect(result.current.isLoading).toBe(true);
    });

    it('does not track view on server', () => {
      (useIsClient as ReturnType<typeof vi.fn>).mockReturnValue(false);
      (getVariant as ReturnType<typeof vi.fn>).mockReturnValue('variant-a');

      renderHook(() => useABTest('test-experiment'));

      expect(trackVariantView).not.toHaveBeenCalled();
    });
  });

  describe('view tracking', () => {
    it('tracks view when trackView is true (default)', async () => {
      (getVariant as ReturnType<typeof vi.fn>).mockReturnValue('variant-a');

      renderHook(() => useABTest('test-experiment'));

      await waitFor(() => {
        expect(trackVariantView).toHaveBeenCalledWith('test-experiment', 'variant-a');
      });
    });

    it('does not track view when trackView is false', async () => {
      (getVariant as ReturnType<typeof vi.fn>).mockReturnValue('variant-a');

      renderHook(() => useABTest('test-experiment', false));

      // Wait a tick to ensure effect has run
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(trackVariantView).not.toHaveBeenCalled();
    });

    it('only tracks view once even with re-renders', async () => {
      (getVariant as ReturnType<typeof vi.fn>).mockReturnValue('variant-a');

      const { rerender } = renderHook(() => useABTest('test-experiment'));

      await waitFor(() => {
        expect(trackVariantView).toHaveBeenCalledTimes(1);
      });

      rerender();
      rerender();
      rerender();

      // Should still only be called once
      expect(trackVariantView).toHaveBeenCalledTimes(1);
    });

    it('does not track when variant is null', async () => {
      (getVariant as ReturnType<typeof vi.fn>).mockReturnValue(null);

      renderHook(() => useABTest('non-existent'));

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(trackVariantView).not.toHaveBeenCalled();
    });
  });

  describe('variant consistency', () => {
    it('returns consistent variant across re-renders', () => {
      (getVariant as ReturnType<typeof vi.fn>).mockReturnValue('variant-a');

      const { result, rerender } = renderHook(() => useABTest('test-experiment'));

      const firstVariant = result.current.variant;
      rerender();
      const secondVariant = result.current.variant;
      rerender();
      const thirdVariant = result.current.variant;

      expect(firstVariant).toBe('variant-a');
      expect(secondVariant).toBe('variant-a');
      expect(thirdVariant).toBe('variant-a');
    });
  });
});

describe('useVariant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useIsClient as ReturnType<typeof vi.fn>).mockReturnValue(true);
  });

  it('returns true when target variant matches', () => {
    (getVariant as ReturnType<typeof vi.fn>).mockReturnValue('variant-a');

    const { result } = renderHook(() => useVariant('test-experiment', 'variant-a'));

    expect(result.current).toBe(true);
  });

  it('returns false when target variant does not match', () => {
    (getVariant as ReturnType<typeof vi.fn>).mockReturnValue('variant-b');

    const { result } = renderHook(() => useVariant('test-experiment', 'variant-a'));

    expect(result.current).toBe(false);
  });

  it('returns false while loading (SSR)', () => {
    (useIsClient as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (getVariant as ReturnType<typeof vi.fn>).mockReturnValue('variant-a');

    const { result } = renderHook(() => useVariant('test-experiment', 'variant-a'));

    expect(result.current).toBe(false);
  });

  it('returns false for control variant check when assigned differently', () => {
    (getVariant as ReturnType<typeof vi.fn>).mockReturnValue('control');

    const { result } = renderHook(() => useVariant('test-experiment', 'variant-a'));

    expect(result.current).toBe(false);
  });

  it('works with different experiment variants', () => {
    (getVariant as ReturnType<typeof vi.fn>).mockReturnValue('compact');

    const { result: compactResult } = renderHook(() =>
      useVariant('blog-layout', 'compact')
    );
    const { result: wideResult } = renderHook(() =>
      useVariant('blog-layout', 'wide')
    );
    const { result: defaultResult } = renderHook(() =>
      useVariant('blog-layout', 'default')
    );

    expect(compactResult.current).toBe(true);
    expect(wideResult.current).toBe(false);
    expect(defaultResult.current).toBe(false);
  });
});

describe('ABTestVariant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useIsClient as ReturnType<typeof vi.fn>).mockReturnValue(true);
  });

  it('renders children when variant matches', () => {
    (getVariant as ReturnType<typeof vi.fn>).mockReturnValue('variant-a');

    render(
      <ABTestVariant experimentId="test-experiment" variant="variant-a">
        <div data-testid="variant-content">Variant A Content</div>
      </ABTestVariant>
    );

    expect(screen.getByTestId('variant-content')).toBeInTheDocument();
    expect(screen.getByText('Variant A Content')).toBeInTheDocument();
  });

  it('renders nothing when variant does not match', () => {
    (getVariant as ReturnType<typeof vi.fn>).mockReturnValue('variant-b');

    render(
      <ABTestVariant experimentId="test-experiment" variant="variant-a">
        <div data-testid="variant-content">Variant A Content</div>
      </ABTestVariant>
    );

    expect(screen.queryByTestId('variant-content')).not.toBeInTheDocument();
  });

  it('renders fallback when variant does not match', () => {
    (getVariant as ReturnType<typeof vi.fn>).mockReturnValue('variant-b');

    render(
      <ABTestVariant
        experimentId="test-experiment"
        variant="variant-a"
        fallback={<div data-testid="fallback-content">Fallback Content</div>}
      >
        <div data-testid="variant-content">Variant A Content</div>
      </ABTestVariant>
    );

    expect(screen.queryByTestId('variant-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('fallback-content')).toBeInTheDocument();
    expect(screen.getByText('Fallback Content')).toBeInTheDocument();
  });

  it('renders fallback when loading (SSR)', () => {
    (useIsClient as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (getVariant as ReturnType<typeof vi.fn>).mockReturnValue('variant-a');

    render(
      <ABTestVariant
        experimentId="test-experiment"
        variant="variant-a"
        fallback={<div data-testid="loading-fallback">Loading...</div>}
      >
        <div data-testid="variant-content">Variant A Content</div>
      </ABTestVariant>
    );

    expect(screen.queryByTestId('variant-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('loading-fallback')).toBeInTheDocument();
  });

  it('uses null as default fallback', () => {
    (getVariant as ReturnType<typeof vi.fn>).mockReturnValue('variant-b');

    const { container } = render(
      <ABTestVariant experimentId="test-experiment" variant="variant-a">
        <div>Variant A Content</div>
      </ABTestVariant>
    );

    // Container should be empty (only render nothing)
    expect(container.innerHTML).toBe('');
  });

  it('works with multiple ABTestVariant components', () => {
    (getVariant as ReturnType<typeof vi.fn>).mockReturnValue('variant-a');

    render(
      <>
        <ABTestVariant experimentId="test-experiment" variant="control">
          <div data-testid="control">Control</div>
        </ABTestVariant>
        <ABTestVariant experimentId="test-experiment" variant="variant-a">
          <div data-testid="variant-a">Variant A</div>
        </ABTestVariant>
        <ABTestVariant experimentId="test-experiment" variant="variant-b">
          <div data-testid="variant-b">Variant B</div>
        </ABTestVariant>
      </>
    );

    expect(screen.queryByTestId('control')).not.toBeInTheDocument();
    expect(screen.getByTestId('variant-a')).toBeInTheDocument();
    expect(screen.queryByTestId('variant-b')).not.toBeInTheDocument();
  });
});
