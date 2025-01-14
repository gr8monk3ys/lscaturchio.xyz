import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import {
  ViewCountsProvider,
  useViewCounts,
  useViewCount,
} from '@/hooks/use-view-counts';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

function createSWRTestWrapper(children: ReactNode) {
  return (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0, errorRetryCount: 0 }}>
      {children}
    </SWRConfig>
  );
}

describe('ViewCountsProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    createSWRTestWrapper(<ViewCountsProvider>{children}</ViewCountsProvider>)
  );

  describe('initial fetch', () => {
    it('fetches all view counts on mount', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          views: [
            { slug: 'post-1', views: 100 },
            { slug: 'post-2', views: 200 },
          ],
        }),
      });

      const { result } = renderHook(() => useViewCounts(), { wrapper });

      // Initially loading
      expect(result.current?.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current?.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/views?all=true', undefined);
      expect(result.current?.viewCounts).toEqual({
        'post-1': 100,
        'post-2': 200,
      });
    });

    it('handles fetch failure gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useViewCounts(), { wrapper });

      await waitFor(() => {
        expect(result.current?.isLoading).toBe(false);
      });

      // Should have empty counts but not error
      expect(result.current?.viewCounts).toEqual({});
    });

    it('handles network error gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useViewCounts(), { wrapper });

      await waitFor(() => {
        expect(result.current?.isLoading).toBe(false);
      });

      // Should silently fail with empty counts
      expect(result.current?.viewCounts).toEqual({});
    });

    it('handles empty response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ views: [] }),
      });

      const { result } = renderHook(() => useViewCounts(), { wrapper });

      await waitFor(() => {
        expect(result.current?.isLoading).toBe(false);
      });

      expect(result.current?.viewCounts).toEqual({});
    });

    it('handles missing views property in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useViewCounts(), { wrapper });

      await waitFor(() => {
        expect(result.current?.isLoading).toBe(false);
      });

      expect(result.current?.viewCounts).toEqual({});
    });
  });

  describe('getViewCount', () => {
    it('returns null while loading', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useViewCounts(), { wrapper });

      expect(result.current?.isLoading).toBe(true);
      expect(result.current?.getViewCount('any-post')).toBe(null);
    });

    it('returns view count for existing post', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          views: [{ slug: 'test-post', views: 42 }],
        }),
      });

      const { result } = renderHook(() => useViewCounts(), { wrapper });

      await waitFor(() => {
        expect(result.current?.isLoading).toBe(false);
      });

      expect(result.current?.getViewCount('test-post')).toBe(42);
    });

    it('returns 0 for non-existent post', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          views: [{ slug: 'other-post', views: 100 }],
        }),
      });

      const { result } = renderHook(() => useViewCounts(), { wrapper });

      await waitFor(() => {
        expect(result.current?.isLoading).toBe(false);
      });

      expect(result.current?.getViewCount('non-existent')).toBe(0);
    });
  });

  describe('trackView', () => {
    it('tracks view and updates count', async () => {
      // Initial fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          views: [{ slug: 'test-post', views: 10 }],
        }),
      });

      const { result } = renderHook(() => useViewCounts(), { wrapper });

      await waitFor(() => {
        expect(result.current?.isLoading).toBe(false);
      });

      // Track view
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ views: 11 }),
      });

      await act(async () => {
        await result.current?.trackView('test-post');
      });

      expect(mockFetch).toHaveBeenLastCalledWith('/api/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: 'test-post' }),
      });

      expect(result.current?.viewCounts['test-post']).toBe(11);
    });

    it('handles trackView failure gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          views: [{ slug: 'test-post', views: 10 }],
        }),
      });

      const { result } = renderHook(() => useViewCounts(), { wrapper });

      await waitFor(() => {
        expect(result.current?.isLoading).toBe(false);
      });

      // Track view fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await act(async () => {
        await result.current?.trackView('test-post');
      });

      // Count should remain unchanged
      expect(result.current?.viewCounts['test-post']).toBe(10);
    });

    it('handles trackView network error gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ views: [] }),
      });

      const { result } = renderHook(() => useViewCounts(), { wrapper });

      await waitFor(() => {
        expect(result.current?.isLoading).toBe(false);
      });

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Should not throw
      await act(async () => {
        await result.current?.trackView('test-post');
      });

      expect(result.current?.viewCounts['test-post']).toBeUndefined();
    });
  });
});

describe('useViewCounts', () => {
  it('returns null when used outside provider', () => {
    const { result } = renderHook(() => useViewCounts());

    expect(result.current).toBe(null);
  });
});

describe('useViewCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    createSWRTestWrapper(<ViewCountsProvider>{children}</ViewCountsProvider>)
  );

  const swrOnlyWrapper = ({ children }: { children: ReactNode }) => (
    createSWRTestWrapper(children)
  );

  describe('with provider', () => {
    it('returns view count from context', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          views: [{ slug: 'my-post', views: 55 }],
        }),
      });

      const { result } = renderHook(() => useViewCount('my-post'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.viewCount).toBe(55);
    });

    it('provides trackView function', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          views: [{ slug: 'my-post', views: 10 }],
        }),
      });

      const { result } = renderHook(() => useViewCount('my-post'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ views: 11 }),
      });

      await act(async () => {
        await result.current.trackView();
      });

      expect(result.current.viewCount).toBe(11);
    });
  });

  describe('without provider (fallback behavior)', () => {
    it('fetches individual view count', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ views: 33 }),
      });

      const { result } = renderHook(() => useViewCount('individual-post'), { wrapper: swrOnlyWrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/views?slug=individual-post',
        undefined
      );
      expect(result.current.viewCount).toBe(33);
    });

    it('handles fetch failure gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useViewCount('failed-post'), { wrapper: swrOnlyWrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // viewCount remains null on failure
      expect(result.current.viewCount).toBe(null);
    });

    it('handles network error gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useViewCount('error-post'), { wrapper: swrOnlyWrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.viewCount).toBe(null);
    });

    it('provides fallback trackView function', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ views: 5 }),
      });

      const { result } = renderHook(() => useViewCount('track-post'), { wrapper: swrOnlyWrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ views: 6 }),
      });

      await act(async () => {
        await result.current.trackView();
      });

      expect(mockFetch).toHaveBeenLastCalledWith('/api/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: 'track-post' }),
      });

      expect(result.current.viewCount).toBe(6);
    });

    it('encodes slug properly in URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ views: 1 }),
      });

      renderHook(() => useViewCount('post-with-special&chars'), { wrapper: swrOnlyWrapper });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/views?slug=post-with-special%26chars',
          undefined
        );
      });
    });
  });

  describe('slug changes', () => {
    it('refetches when slug changes (without provider)', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ views: 10 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ views: 20 }),
        });

      const { result, rerender } = renderHook(
        ({ slug }) => useViewCount(slug),
        { initialProps: { slug: 'first-post' }, wrapper: swrOnlyWrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.viewCount).toBe(10);

      rerender({ slug: 'second-post' });

      await waitFor(() => {
        expect(result.current.viewCount).toBe(20);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/views?slug=first-post', undefined);
      expect(mockFetch).toHaveBeenCalledWith('/api/views?slug=second-post', undefined);
    });
  });
});
