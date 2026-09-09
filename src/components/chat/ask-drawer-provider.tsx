"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface AskDrawerValue {
  isOpen: boolean;
  open: (seedQuestion?: string) => void;
  close: () => void;
  toggle: () => void;
  /** A question handed in by whatever opened the drawer, consumed once. */
  seed: string;
  clearSeed: () => void;
}

const AskDrawerContext = createContext<AskDrawerValue | null>(null);

/**
 * Open/closed state for the ask drawer, plus the page-shift it drives.
 *
 * The drawer pushes the page rather than covering it, so the reader can keep
 * the essay in view while they argue with it. That shift is done in CSS from a
 * single custom property (`--ask-drawer-w`, see globals.css) rather than by
 * passing a width through the tree, because the fixed header has to move too
 * and it is rendered on the server.
 *
 * Below `md` the property stays at zero and the drawer covers instead: 24rem of
 * panel on a 390px phone would leave nothing behind it worth keeping in view.
 */
export function AskDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [seed, setSeed] = useState("");
  const restoreFocusTo = useRef<HTMLElement | null>(null);

  const open = useCallback((seedQuestion = "") => {
    restoreFocusTo.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (seedQuestion) setSeed(seedQuestion);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Send focus back where it came from; a drawer that dumps focus on <body>
    // strands a keyboard reader at the top of the document.
    const target = restoreFocusTo.current;
    if (target && document.contains(target)) {
      window.requestAnimationFrame(() => target.focus());
    }
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  const clearSeed = useCallback(() => setSeed(""), []);

  // The page shift is keyed off the document element so server-rendered,
  // position-fixed chrome can respond to it without knowing this hook exists.
  useEffect(() => {
    const root = document.documentElement;
    if (isOpen) root.setAttribute("data-ask-open", "true");
    else root.removeAttribute("data-ask-open");
    return () => root.removeAttribute("data-ask-open");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const value = useMemo(
    () => ({ isOpen, open, close, toggle, seed, clearSeed }),
    [isOpen, open, close, toggle, seed, clearSeed]
  );

  return <AskDrawerContext.Provider value={value}>{children}</AskDrawerContext.Provider>;
}

/**
 * Returns null when no provider is mounted, so a component can offer the drawer
 * where it exists and quietly do nothing where it does not.
 */
export function useAskDrawer(): AskDrawerValue | null {
  return useContext(AskDrawerContext);
}
