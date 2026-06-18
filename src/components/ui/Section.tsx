import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  children: ReactNode;
  className?: string;
  /** Container width variant */
  size?: "narrow" | "default" | "wide" | "full";
  /** Vertical padding variant */
  padding?: "none" | "compact" | "default" | "large";
  /** Optional ID for anchor links */
  id?: string;
  /** Show divider below section */
  divider?: boolean;
  /** Optional top separator */
  topDivider?: boolean;
  /** Reveal animation on enter */
  reveal?: boolean;
  /** Background variant */
  background?: "default" | "muted" | "card";
}

const sizeClasses = {
  narrow: "max-w-3xl",
  default: "max-w-5xl",
  wide: "max-w-7xl",
  full: "max-w-none",
};

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
  size = "default",
  padding = "default",
  id,
  divider = false,
  topDivider = false,
  reveal = true,
  background = "default",
}: SectionProps) {
  const revealStyle = {
    "--reveal-y": "16px",
    "--reveal-delay": "0ms",
  } as CSSProperties;

  return (
    <section
      id={id}
      className={cn(
        "relative w-full",
        backgroundClasses[background],
        className
      )}
    >
      {topDivider && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 max-w-lg h-px bg-border/70" />
      )}
      <div
        className={cn(
          "mx-auto px-4 sm:px-6 lg:px-8",
          sizeClasses[size],
          paddingClasses[padding],
          reveal && "reveal"
        )}
        data-reveal-state={reveal ? "in" : undefined}
        style={reveal ? revealStyle : undefined}
      >
        {children}
      </div>
      {divider && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 max-w-md h-px bg-border/70" />
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
