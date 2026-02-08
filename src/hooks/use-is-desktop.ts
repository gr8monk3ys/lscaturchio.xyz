"use client";

import { useState, useEffect } from "react";

const DESKTOP_BREAKPOINT = "(min-width: 1024px)";

/**
 * Hook that returns whether the viewport matches desktop size (>= 1024px).
 * Returns false during SSR and on mobile/tablet viewports.
 * Listens for resize changes via matchMedia so the value stays current.
 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_BREAKPOINT);
    setIsDesktop(mql.matches);

    function handleChange(event: MediaQueryListEvent): void {
      setIsDesktop(event.matches);
    }

    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return isDesktop;
}
