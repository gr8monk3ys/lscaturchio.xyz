"use client";

import { useEffect, useCallback, useRef } from "react";

/**
 * The classic Konami Code sequence
 * ArrowUp, ArrowUp, ArrowDown, ArrowDown, ArrowLeft, ArrowRight, ArrowLeft, ArrowRight, b, a
 */
const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];

interface UseKonamiCodeOptions {
  /**
   * Called when the Konami code is successfully entered
   */
  onSuccess: () => void;
  /**
   * Whether to allow the code to be triggered multiple times
   * @default true
   */
  allowRepeat?: boolean;
  /**
   * Time in milliseconds to reset the sequence if no key is pressed
   * @default 2000
   */
  timeout?: number;
}

/**
 * Hook that detects the Konami code: up up down down left right left right B A
 *
 * @example
 * ```tsx
 * useKonamiCode({
 *   onSuccess: () => console.log('Konami code activated!'),
 * });
 * ```
 */
export function useKonamiCode({
  onSuccess,
  allowRepeat = true,
  timeout = 2000,
}: UseKonamiCodeOptions): void {
  const indexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggeredRef = useRef(false);

  const resetSequence = useCallback(() => {
    indexRef.current = 0;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Check if this isn't the first key and we should prevent repeat triggers
      if (!allowRepeat && triggeredRef.current) {
        return;
      }

      // Reset timeout on each key press
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout to reset sequence
      timeoutRef.current = setTimeout(resetSequence, timeout);

      // Check if current key matches expected key in sequence
      const expectedKey = KONAMI_CODE[indexRef.current];
      const pressedKey = event.code;

      if (pressedKey === expectedKey) {
        indexRef.current++;

        // Check if sequence is complete
        if (indexRef.current === KONAMI_CODE.length) {
          resetSequence();
          triggeredRef.current = true;
          onSuccess();
        }
      } else {
        // Wrong key - reset sequence
        resetSequence();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onSuccess, allowRepeat, timeout, resetSequence]);
}
