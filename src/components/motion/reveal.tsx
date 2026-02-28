import type { CSSProperties, ReactNode } from "react";

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
}: RevealProps) {
  const style = {
    "--reveal-y": `${y}px`,
    "--reveal-delay": `${delayMs}ms`,
  } as CSSProperties;

  return (
    <div
      data-reveal-state="in"
      className={cn("reveal", className)}
      style={style}
    >
      {children}
    </div>
  );
}
