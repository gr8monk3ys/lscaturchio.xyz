import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

const useReducedMotionMock = vi.fn();
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useReducedMotion: () => useReducedMotionMock(),
  };
});

import { DURATIONS, EASINGS, useMotionPreset } from '@/lib/motion';

describe('motion presets', () => {
  it('exposes a 3-bucket duration scale', () => {
    expect(DURATIONS).toEqual({ fast: 0.2, default: 0.35, slow: 0.5 });
  });

  it('exposes a standard easing tuple', () => {
    expect(EASINGS.standard).toEqual([0.22, 1, 0.36, 1]);
  });
});

describe('useMotionPreset', () => {
  it('returns the requested duration and standard easing by default', () => {
    useReducedMotionMock.mockReturnValue(false);
    const { result } = renderHook(() => useMotionPreset('default'));
    expect(result.current.duration).toBe(0.35);
    expect(result.current.ease).toEqual([0.22, 1, 0.36, 1]);
  });

  it('honours the duration argument', () => {
    useReducedMotionMock.mockReturnValue(false);
    const { result } = renderHook(() => useMotionPreset('fast'));
    expect(result.current.duration).toBe(0.2);
  });

  it('returns duration 0 when reduced-motion is preferred', () => {
    useReducedMotionMock.mockReturnValue(true);
    const { result } = renderHook(() => useMotionPreset('slow'));
    expect(result.current.duration).toBe(0);
  });

  it('keeps the easing tuple even when reduced-motion is preferred', () => {
    useReducedMotionMock.mockReturnValue(true);
    const { result } = renderHook(() => useMotionPreset('default'));
    expect(result.current.ease).toEqual([0.22, 1, 0.36, 1]);
  });

  it('defaults to "default" duration and "standard" easing', () => {
    useReducedMotionMock.mockReturnValue(false);
    const { result } = renderHook(() => useMotionPreset());
    expect(result.current.duration).toBe(0.35);
    expect(result.current.ease).toEqual([0.22, 1, 0.36, 1]);
  });
});
