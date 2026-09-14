import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PAGE_WIDTHS, type PageWidth } from "@/lib/page-width";

interface SectionProps {
  children: ReactNode;
  className?: string;
  /** Container width variant. See `@/lib/page-width`. */
  size?: PageWidth;
  /** Vertical padding variant */
  padding?: "none" | "compact" | "default" | "large";
  /** Optional ID for anchor links */
  id?: string;
  /** Show divider below section */
  divider?: boolean;
  /** Optional top separator */
  topDivider?: boolean;
  /** Reveal animation on enter */
  /** Background variant */
  background?: "default" | "muted" | "card";
}

const paddingClasses = {
  none: "py-0",
  compact: "py-10 md:py-16",
  default: "py-16 md:py-28",
  large: "py-24 md:py-36",
};

const backgroundClasses = {
  default: "",
  muted: "bg-muted/30",
  card: "bg-card",
};

/**
 * Section component for consistent layout and spacing across pages.
 * Use this to wrap page sections for uniform visual rhythm.
 */
export function Section({
  children,
  className,
  size = "medium",
  padding = "default",
  id,
  divider = false,
  topDivider = false,
  background = "default",
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative w-full",
        backgroundClasses[background],
        className
      )}
    >
      {/* Hairlines that end where the content ends.
          These were centred partial-width rules — half and a third of the
          section, capped at max-w-lg — which read as ornament, so they became
          `inset-x-0` on this outer element. That overcorrected: the section
          element is the full viewport width, while the content below sits
          inside `mx-auto px-4 sm:px-6 lg:px-8` at the page width. Measured on
          `/work-with-me` at 1440, one vertical stack held rules at 144→1296
          and 176→1264 alternating down the page, with every text block
          starting at x=176 — so the first rule a reader met began 32px left of
          everything it divided, and the stagger repeated at 1920 (384/416
          against content at 416), which rules out a one-width accident.

          `/professional` was the counter-example that proved it fixable: every
          rule there measured 272→1168, because that page's rules are drawn
          inside the padding. So the divider now carries the same container and
          padding as the content it divides, and a section rule cannot disagree
          with the block beneath it at any breakpoint. */}
      {topDivider && (
        <div className="absolute inset-x-0 top-0 px-4 sm:px-6 lg:px-8">
          <div className={cn("mx-auto h-px bg-border", PAGE_WIDTHS[size])} />
        </div>
      )}
      <div
        className={cn(
          "mx-auto px-4 sm:px-6 lg:px-8",
          PAGE_WIDTHS[size],
          paddingClasses[padding]
        )}
      >
        {children}
      </div>
      {divider && (
        <div className="absolute inset-x-0 bottom-0 px-4 sm:px-6 lg:px-8">
          <div className={cn("mx-auto h-px bg-border", PAGE_WIDTHS[size])} />
        </div>
      )}
    </section>
  );
}

/**
 * SectionHeader component for consistent section titles.
 */
interface SectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
  /** Alignment of header content */
  align?: "left" | "center";
  /** Optional action element (e.g., "View All" link) */
  action?: ReactNode;
  /** Catalogue index, e.g. "01" — rendered as a mono wall-label prefix. */
  index?: string;
  /** Mono kicker / eyebrow shown above the title (e.g. "WRITING"). */
  eyebrow?: string;
}

/**
 * Museum wall-label header: a mono kicker line (catalogue index + eyebrow),
 * the Fraunces title, an optional description, then a full-width hairline
 * rule — the architectural line under a gallery placard.
 */
export function SectionHeader({
  title,
  description,
  className,
  align = "left",
  action,
  index,
  eyebrow,
}: SectionHeaderProps) {
  const kicker = [index, eyebrow].filter(Boolean).join(" — ");

  return (
    <div className={cn("mb-10", className)}>
      <div
        className={cn(
          align === "center" && "text-center",
          action && "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        )}
      >
        <div className={cn(align === "center" && "mx-auto")}>
          {kicker && (
            <span className={cn("label-mono mb-3 block", align === "center" && "mx-auto")}>
              {kicker}
            </span>
          )}
          <h2 className="text-section-title">{title}</h2>
          {description && (
            <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0 sm:pb-1">{action}</div>}
      </div>
      <hr className="gallery-rule mt-6" />
    </div>
  );
}
