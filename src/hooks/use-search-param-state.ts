"use client";

import { useCallback, useSyncExternalStore } from "react";

const CHANGE_EVENT = "lsc:searchparamchange";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("popstate", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/**
 * A piece of UI state that lives in the URL's query string.
 *
 * Web Interface Guidelines: tabs, filters and similar state belong in the URL
 * so they survive a reload and can be linked to. This reads the parameter with
 * useSyncExternalStore rather than useSearchParams, so a statically rendered
 * page keeps its server HTML: the server snapshot is the fallback (no Suspense
 * boundary, no client-only bail-out), and a deep link switches to its value
 * right after hydration. Writes use history.replaceState, which the Next.js
 * router observes, so there is no navigation and no scroll jump.
 */
export function useSearchParamState<T extends string>(
  key: string,
  allowed: readonly T[],
  fallback: T
): [T, (next: T) => void] {
  const raw = useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).get(key),
    () => null
  );
  const value = raw !== null && (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;

  const setValue = useCallback(
    (next: T) => {
      const url = new URL(window.location.href);
      if (next === fallback) url.searchParams.delete(key);
      else url.searchParams.set(key, next);
      window.history.replaceState(window.history.state, "", url);
      window.dispatchEvent(new Event(CHANGE_EVENT));
    },
    [key, fallback]
  );

  return [value, setValue];
}
