"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

// ============================================
// GLASS CARD - Frosted glass effect with hover animation
// ============================================

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  /** Glass intensity: subtle, default, or heavy */
  intensity?: "subtle" | "default" | "heavy";
  /** Enable hover animation effects */
  hoverEffect?: boolean;
  /** Enable gradient border on hover */
  gradientBorder?: boolean;
  /** Custom border radius */
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  /** Disable the glass effect entirely (useful for SSR fallback) */
  disableGlass?: boolean;
  /** Click handler */
  onClick?: () => void;
}

const glassVariants: Variants = {
  initial: {
    y: 0,
    scale: 1,
  },
  hover: {
    y: -4,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
};

const glowVariants: Variants = {
  initial: {
    opacity: 0,
  },
  hover: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};

const borderRadiusMap = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
};

export function GlassCard({
  children,
  className = "",
  intensity = "default",
  hoverEffect = true,
  gradientBorder = false,
  rounded = "xl",
  disableGlass = false,
  onClick,
}: GlassCardProps) {
  const intensityClasses = {
    subtle: "glass-subtle",
    default: "glass",
    heavy: "glass-heavy",
  };

  const baseClasses = cn(
    "relative overflow-hidden",
    borderRadiusMap[rounded],
    !disableGlass && intensityClasses[intensity],
    disableGlass && "bg-card border border-border",
    className
  );

  if (!hoverEffect) {
    return (
      <div className={baseClasses} onClick={onClick}>
        {gradientBorder && <GradientBorderOverlay rounded={rounded} />}
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={baseClasses}
      variants={glassVariants}
      initial="initial"
      whileHover="hover"
      whileTap={onClick ? "tap" : undefined}
      onClick={onClick}
    >
      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        variants={glowVariants}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
      </motion.div>

      {gradientBorder && <GradientBorderOverlay rounded={rounded} animated />}

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

// ============================================
// GRADIENT BORDER OVERLAY
// ============================================

interface GradientBorderOverlayProps {
  rounded: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  animated?: boolean;
}

function GradientBorderOverlay({ animated = false }: GradientBorderOverlayProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 rounded-inherit pointer-events-none",
        animated && "animated-border"
      )}
      style={{
        padding: "1px",
        background: animated
          ? undefined
          : "linear-gradient(135deg, hsl(var(--primary) / 0.5), hsl(var(--secondary) / 0.5))",
        WebkitMask: !animated
          ? "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)"
          : undefined,
        mask: !animated
          ? "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)"
          : undefined,
        WebkitMaskComposite: !animated ? "xor" : undefined,
        maskComposite: !animated ? "exclude" : undefined,
      }}
    />
  );
}

// ============================================
// GLASS CARD HEADER - Optional header section
// ============================================

interface GlassCardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function GlassCardHeader({ children, className = "" }: GlassCardHeaderProps) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-b border-white/10 dark:border-white/5",
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================
// GLASS CARD CONTENT - Main content section
// ============================================

interface GlassCardContentProps {
  children: ReactNode;
  className?: string;
}

export function GlassCardContent({ children, className = "" }: GlassCardContentProps) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

// ============================================
// GLASS CARD FOOTER - Optional footer section
// ============================================

interface GlassCardFooterProps {
  children: ReactNode;
  className?: string;
}

export function GlassCardFooter({ children, className = "" }: GlassCardFooterProps) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-t border-white/10 dark:border-white/5",
        className
      )}
    >
      {children}
    </div>
  );
}
