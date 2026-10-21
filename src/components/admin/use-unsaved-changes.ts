"use client";

import { useEffect } from "react";

/**
 * Ask before leaving a page with edits that have not been published.
 *
 * Every admin editor holds its draft only in component state, so a reload or
 * a closed tab discarded it silently (Web Interface Guidelines: warn before
 * navigation with unsaved changes). The listener exists only while there is
 * something to lose, so a clean editor never prompts.
 */
export function useUnsavedChangesWarning(hasUnsavedChanges: boolean): void {
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Legacy browsers only show the prompt when returnValue is set.
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasUnsavedChanges]);
}
