'use client';

import { useState, useEffect, useCallback, RefObject } from 'react';
import { useIsClient } from './use-is-client';

interface MousePosition {
  x: number;
  y: number;
}

interface UseMousePositionOptions {
  /**
   * Optional ref to track position relative to an element.
   * If not provided, tracks position relative to the viewport.
   */
  containerRef?: RefObject<HTMLElement>;
  /**
   * Whether to only track when the mouse is inside the container.
   * Only applies when containerRef is provided.
   */
  trackOnlyInside?: boolean;
}

/**
 * Hook to track mouse position with SSR safety and reduced-motion support.
 *
 * @param options - Configuration options
 * @returns Mouse position { x, y } or { x: 0, y: 0 } during SSR
 *
 * @example
 * // Track viewport-relative position
 * const { x, y } = useMousePosition();
 *
 * @example
 * // Track position relative to an element
 * const containerRef = useRef<HTMLDivElement>(null);
 * const { x, y } = useMousePosition({ containerRef });
 */
export function useMousePosition(options: UseMousePositionOptions = {}): MousePosition {
  const { containerRef, trackOnlyInside = false } = options;
  const isClient = useIsClient();
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  // Check for reduced motion preference
  const prefersReducedMotion = isClient
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (prefersReducedMotion) return;

      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const inside =
          x >= 0 &&
          x <= rect.width &&
          y >= 0 &&
          y <= rect.height;

        if (!trackOnlyInside || inside) {
          setPosition({ x, y });
        }
      } else {
        setPosition({ x: event.clientX, y: event.clientY });
      }
    },
    [containerRef, trackOnlyInside, prefersReducedMotion]
  );

  useEffect(() => {
    if (!isClient || prefersReducedMotion) return;

    // Copy ref to variable for cleanup
    const container = containerRef?.current;
    const element = container || window;

    element.addEventListener('mousemove', handleMouseMove as EventListener);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove as EventListener);
    };
  }, [isClient, handleMouseMove, containerRef, prefersReducedMotion]);

  // Return position regardless of isInside for simpler API
  // Components can use the hook with trackOnlyInside if they need that behavior
  return position;
}

/**
 * Hook to track mouse position with inside/outside state.
 * Useful when you need to know if the mouse is inside the container.
 */
export function useMousePositionWithState(options: UseMousePositionOptions = {}): {
  position: MousePosition;
  isInside: boolean;
} {
  const { containerRef, trackOnlyInside = false } = options;
  const isClient = useIsClient();
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isInside, setIsInside] = useState(false);

  const prefersReducedMotion = isClient
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (prefersReducedMotion) return;

      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const inside =
          x >= 0 &&
          x <= rect.width &&
          y >= 0 &&
          y <= rect.height;

        setIsInside(inside);

        if (!trackOnlyInside || inside) {
          setPosition({ x, y });
        }
      } else {
        setPosition({ x: event.clientX, y: event.clientY });
      }
    },
    [containerRef, trackOnlyInside, prefersReducedMotion]
  );

  const handleMouseLeave = useCallback(() => {
    setIsInside(false);
  }, []);

  useEffect(() => {
    if (!isClient || prefersReducedMotion) return;

    // Copy ref to variable for cleanup
    const container = containerRef?.current;
    const element = container || window;

    element.addEventListener('mousemove', handleMouseMove as EventListener);

    if (container) {
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      element.removeEventListener('mousemove', handleMouseMove as EventListener);
      if (container) {
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [isClient, handleMouseMove, handleMouseLeave, containerRef, prefersReducedMotion]);

  return { position, isInside };
}
