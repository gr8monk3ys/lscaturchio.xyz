import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A Tufte-style margin note. Drop it into any essay MDX inline with the text:
 *
 *   Some claim in the body.<Sidenote>The aside, citation, or caveat.</Sidenote>
 *
 * On wide screens it floats into the right of the measure as a marginal note
 * with the body text wrapping around it; on narrow screens it becomes a
 * set-apart, hairline-ruled aside in the flow. `not-prose` so it opts out of
 * the article's prose typography and keeps the gallery wall-label register.
 */
export function Sidenote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <aside
      role="note"
      aria-label="Sidenote"
      className={cn(
        "not-prose my-6 border-l-2 border-primary/40 pl-4 text-sm leading-relaxed text-muted-foreground",
        "lg:float-right lg:clear-right lg:my-1 lg:ml-8 lg:mb-4 lg:w-44",
        className
      )}
    >
      <span className="label-mono mb-1 block" aria-hidden="true">Note</span>
      {children}
    </aside>
  );
}
