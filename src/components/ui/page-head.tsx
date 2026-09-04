import type { ReactNode } from "react";

import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { cn } from "@/lib/utils";

interface PageHeadProps {
  /** Wall label above the title, e.g. "Garden · Reading". */
  kicker: string;
  /** The page's single h1. */
  title: ReactNode;
  /** One-sentence description beneath the title. */
  blurb?: ReactNode;
  /** Draw the closing hairline. */
  rule?: boolean;
  /** Extra head content (a CTA row, a status banner) placed above the rule. */
  children?: ReactNode;
  /** Outer spacing only; the head's own type and rhythm are not caller-tunable. */
  className?: string;
}

/**
 * Page-level sibling of `SectionHeader`: the gallery masthead that opens a
 * route — wall-label kicker, the page's one Fraunces h1, a muted blurb, and
 * the hairline rule that closes the placard.
 *
 * The interface is content, not classes. The type scale, the 4/8 rhythm and
 * the rule belong to the module so seventeen routes cannot drift apart again
 * (they already had: four spellings of the same title class).
 */
export function PageHead({
  kicker,
  title,
  blurb,
  rule = true,
  children,
  className,
}: PageHeadProps) {
  return (
    <header className={cn(className)}>
      <span className="label-mono block">{kicker}</span>
      {/* Spacing only. `Heading` supplies `text-page-title` for an h1, and any
          size class named here would replace it: the two live in one
          tailwind-merge group, so the caller's would win and take the
          clamp() with it. */}
      <Heading className="mt-4">{title}</Heading>
      {blurb && (
        <Paragraph className="mt-4 max-w-2xl text-lg text-muted-foreground">
          {blurb}
        </Paragraph>
      )}
      {children}
      {rule && <hr className="gallery-rule mt-8" />}
    </header>
  );
}
