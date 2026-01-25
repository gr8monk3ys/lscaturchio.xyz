"use client";

import { useSyncExternalStore } from "react";

/**
 * Hook to safely detect client-side rendering without triggering React purity warnings.
 * Uses useSyncExternalStore for proper hydration handling.
 *
 * @returns true if running on the client, false during SSR
 */
const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function useIsClient(): boolean {
  return useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);
}
