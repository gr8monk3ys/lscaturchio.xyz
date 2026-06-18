"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Y-offset applied before reveal (in pixels). */
  y?: number;
  /** Delay before the transition starts (in ms). */
  delayMs?: number;
  /** Observe once then disconnect. */
  once?: boolean;
  /** IntersectionObserver rootMargin. */
  margin?: string;
  /** IntersectionObserver threshold. */
  threshold?: number | number[];
};

/**
 * Scroll-reveal wrapper. Server-renders as visible ("in") so content is never
 * hidden without JavaScript; after mount, elements still below the viewport
 * are set to "out" and revealed by an IntersectionObserver as they scroll in.
 * Reduced-motion users are never hidden (the observer is skipped entirely,
 * and the CSS `.reveal` reduced-motion block forces visibility regardless).
 */
export function Reveal({
  children,
  className,
  y = 14,
  delayMs = 0,
  once = true,
  margin = "0px 0px -10% 0px",
  threshold = 0.15,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"in" | "out">("in");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Only hide elements that start below the viewport — above-the-fold
    // content keeps its mount animation and never flashes out.
    if (el.getBoundingClientRect().top <= window.innerHeight) return;
    setState("out");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setState("in");
            if (once) observer.disconnect();
          } else if (!once) {
            setState("out");
          }
        }
      },
      { rootMargin: margin, threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once, margin, threshold]);

  const style = {
    "--reveal-y": `${y}px`,
    "--reveal-delay": `${delayMs}ms`,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      data-reveal-state={state}
      className={cn("reveal", className)}
      style={style}
    >
      {children}
    </div>
  );
}
