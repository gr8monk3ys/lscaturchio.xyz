import React from "react";

import { cn } from "@/lib/utils";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";

const defaultSizeByTag: Record<HeadingTag, string> = {
  h1: "text-page-title",
  h2: "text-section-title",
  h3: "text-card-title",
  h4: "text-subsection",
  h5: "text-subsection",
  h6: "text-subsection",
  p: "text-body",
  span: "",
  div: "",
};

export const Heading = ({
  className,
  children,
  as: Component = "h1",
}: {
  className?: string;
  children: React.ReactNode;
  as?: HeadingTag;
}) => {
  return (
    <Component
      className={cn(
        // Use the site display font by default; keep sizing flexible via caller.
        //
        // No `tracking-tight` here. It sat in this string beside the ramp token
        // supplied two lines down, so every Heading rendered at -0.025em while
        // the ramp declares -0.035 / -0.03 / -0.026 / -0.02 / -0.01em per step.
        // The Fluid Heading Rule exists to make tracking loosen as size falls,
        // and this one class flattened all five — the /about h1 and h2 at the
        // same tracking as the /books h1, and a different value from the / and
        // /blog h1s, which use a raw `text-page-title` and so kept -0.03em.
        //
        // Third composition site of this bug. Neither source rule could see it:
        // `heading-tracking-override` wants both tokens in one string, and
        // `heading-component-tracking-override` wants a consumer to pass it in.
        // Here it was two arguments of the same `cn()` call. The guard for it
        // is in the DOM — see `e2e/design-invariants.spec.ts`.
        "font-display text-foreground",
        defaultSizeByTag[Component],
        className
      )}
    >
      {children}
    </Component>
  );
};
