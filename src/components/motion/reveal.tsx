"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useReducer, useRef } from "react";

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

export function Reveal({
  children,
  className,
  y = 14,
  delayMs = 0,
  once = true,
  margin = "-80px",
  threshold = 0.12,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, updateInView] = useReducer(
    (current: boolean, next: boolean) => (current === next ? current : next),
    false
  );

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      updateInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          updateInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          updateInView(false);
        }
      },
      { root: null, rootMargin: margin, threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [margin, once, threshold]);

  const style = {
    "--reveal-y": `${y}px`,
    "--reveal-delay": `${delayMs}ms`,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      data-reveal-state={inView ? "in" : "out"}
      className={cn("reveal", className)}
      style={style}
    >
      {children}
    </div>
  );
}
