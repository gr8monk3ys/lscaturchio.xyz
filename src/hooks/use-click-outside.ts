// Rule: TypeScript Usage - Use explicit return types for all functions
"use client";

import { useEffect, RefObject } from "react";

/**
 * Hook that detects clicks outside the specified element
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void,
  exceptRefs: RefObject<HTMLElement>[] = []
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent): void => {
      const target = event.target as Node;
      
      // Do nothing if the ref is not set yet
      if (!ref.current) return;
      
      // Don't trigger if clicking ref's element or its children
      if (ref.current.contains(target)) return;
      
      // Don't trigger if clicking any of the excepted elements
      const clickedOnExceptedElement = exceptRefs.some(
        exceptRef => exceptRef.current && exceptRef.current.contains(target)
      );
      
      if (clickedOnExceptedElement) return;
      
      handler(event);
    };

    // Add event listeners
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    
    // Clean up on unmount
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler, exceptRefs]);
}
