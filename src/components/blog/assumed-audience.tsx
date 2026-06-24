import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * "Assumed Audience" callout — a one-line note at the top of an essay stating
 * who it's written for, so the reader can calibrate scope before diving in
 * (after Maggie Appleton). Drop it at the very top of an essay's MDX:
 *
 *   <AssumedAudience>People who already use RAG and want the failure modes.</AssumedAudience>
 *
 * `not-prose` so it opts out of the article body typography and keeps the
 * gallery wall-label register.
 */
export function AssumedAudience({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <aside
      role="note"
      aria-label="Assumed audience"
      className={cn(
        "not-prose mb-8 border-l-2 border-primary/40 pl-4 text-sm leading-relaxed text-muted-foreground",
        className
      )}
    >
      <span className="label-mono mb-1 block" aria-hidden="true">
        Assumed audience
      </span>
      {children}
    </aside>
  );
}
