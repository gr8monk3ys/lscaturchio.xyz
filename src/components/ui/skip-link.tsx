// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Skip link for keyboard users to bypass navigation
 * Improves accessibility by allowing keyboard users to skip to main content
 */
export function SkipLink(): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);

  // Show the skip link when it receives focus
  const handleFocus = useCallback(() => {
    setIsVisible(true);
  }, []);

  // Hide the skip link when it loses focus
  const handleBlur = useCallback(() => {
    setIsVisible(false);
  }, []);

  // Add keyboard event listener to show skip link on Tab press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab" && !event.shiftKey && !isVisible) {
        // Only show on first Tab press from page load
        const skipLink = document.getElementById("skip-link");
        if (skipLink && document.activeElement === document.body) {
          skipLink.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible]);

  return (
    <a
      id="skip-link"
      href="#main-content"
      className={`fixed left-4 top-4 z-50 rounded bg-stone-900 px-4 py-2 text-white transition-transform ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2`}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      Skip to main content
    </a>
  );
}
