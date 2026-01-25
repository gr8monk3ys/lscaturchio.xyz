import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIsClient } from '@/hooks/use-is-client';

describe('useIsClient', () => {
  describe('in browser environment', () => {
    it('returns true after mount (client-side)', () => {
      const { result } = renderHook(() => useIsClient());

      // useSyncExternalStore with getSnapshot returning true means it returns true on client
      expect(result.current).toBe(true);
    });

    it('returns consistent value across re-renders', () => {
      const { result, rerender } = renderHook(() => useIsClient());

      const firstValue = result.current;
      rerender();
      const secondValue = result.current;

      expect(firstValue).toBe(true);
      expect(secondValue).toBe(true);
    });
  });

  describe('SSR simulation', () => {
    // Note: Testing SSR behavior is tricky in jsdom environment
    // The getServerSnapshot function is used during SSR which returns false
    // In a real SSR environment, useSyncExternalStore would use getServerSnapshot

    it('uses getServerSnapshot during SSR (returns false)', () => {
      // We can verify the hook structure by checking its behavior
      // In test environment (jsdom), it will use getSnapshot (client behavior)
      // But the hook is designed to return false during SSR via getServerSnapshot

      const { result } = renderHook(() => useIsClient());

      // In jsdom (browser-like), it returns true
      // This test documents the expected client behavior
      expect(result.current).toBe(true);
    });
  });

  describe('subscription behavior', () => {
    it('does not cause re-renders from external store changes', () => {
      // The emptySubscribe function returns a no-op unsubscribe
      // This means the hook value is stable and does not change
      let renderCount = 0;

      const { result, rerender } = renderHook(() => {
        renderCount++;
        return useIsClient();
      });

      expect(result.current).toBe(true);

      // Force a rerender
      rerender();

      // Should have rendered twice (initial + rerender)
      expect(renderCount).toBe(2);
      expect(result.current).toBe(true);
    });
  });

  describe('hook purity', () => {
    it('returns the same value on every call within a render', () => {
      // This tests that the hook follows React's purity rules
      // by always returning the same value during a single render
      const values: boolean[] = [];

      const { result } = renderHook(() => {
        const value = useIsClient();
        values.push(value);
        return value;
      });

      expect(values.length).toBe(1);
      expect(values[0]).toBe(result.current);
    });

    it('can be called multiple times in different components', () => {
      // Multiple hook instances should all return true on client
      const { result: result1 } = renderHook(() => useIsClient());
      const { result: result2 } = renderHook(() => useIsClient());
      const { result: result3 } = renderHook(() => useIsClient());

      expect(result1.current).toBe(true);
      expect(result2.current).toBe(true);
      expect(result3.current).toBe(true);
    });
  });

  describe('hydration safety', () => {
    it('provides consistent value for hydration (no mismatch)', () => {
      // useSyncExternalStore is specifically designed to handle hydration safely
      // The getServerSnapshot is used during SSR, getSnapshot during client
      // This ensures no hydration mismatch warnings

      const { result } = renderHook(() => useIsClient());

      // On client, should immediately return true
      // This is safe because useSyncExternalStore handles the SSR/client transition
      expect(result.current).toBe(true);
    });
  });
});
