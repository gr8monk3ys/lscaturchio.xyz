"use client";

import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
  compact: "py-8 md:py-12",
  default: "py-12 md:py-16",
  large: "py-16 md:py-24",
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
  const reduceMotion = useReducedMotion();
  const revealVariants = {
    // Keep content visible during SSR; only apply subtle motion on reveal.
    hidden: { opacity: 1, y: reduceMotion ? 0 : 16 },
    show: { opacity: 1, y: 0 },
  };

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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 max-w-lg h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      )}
      <motion.div
        className={cn(
          "mx-auto px-4 sm:px-6 lg:px-8",
          sizeClasses[size],
          paddingClasses[padding]
        )}
        initial={reveal ? "hidden" : false}
        whileInView={reveal ? "show" : undefined}
        viewport={{ once: true, margin: "-80px" }}
        variants={revealVariants}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {children}
      </motion.div>
      {divider && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 max-w-md h-px bg-gradient-to-r from-transparent via-border to-transparent" />
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
}

export function SectionHeader({
  title,
  description,
  className,
  align = "left",
  action,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-8",
        align === "center" && "text-center",
        action && "flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4",
        className
      )}
    >
      <div className={cn(align === "center" && "mx-auto")}>
        <h2 className="text-section-title">{title}</h2>
        {description && (
          <p className="mt-2 text-muted-foreground max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
