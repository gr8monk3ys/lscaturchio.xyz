"use client";

import { motion, Variants, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode, useRef, MouseEvent } from "react";
import { cn } from "@/lib/utils";

// ============================================
// ANIMATED BORDER CARD - Card with rotating gradient border
// ============================================

interface AnimatedBorderCardProps {
  children: ReactNode;
  className?: string;
  /** Animation speed: slow (8s), default (4s), or fast (2s) */
  speed?: "slow" | "default" | "fast";
  /** Only animate border on hover */
  hoverOnly?: boolean;
  /** Enable 3D tilt effect on hover */
  tiltEffect?: boolean;
  /** Tilt intensity in degrees */
  tiltAmount?: number;
  /** Border width in pixels */
  borderWidth?: number;
  /** Custom border radius */
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl";
  /** Background color class (defaults to background) */
  bgClassName?: string;
  /** Click handler */
  onClick?: () => void;
}

const cardVariants: Variants = {
  initial: {
    y: 0,
    scale: 1,
  },
  hover: {
    y: -2,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
};

const borderRadiusMap = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
};

const speedClassMap = {
  slow: "animated-border animated-border-slow",
  default: "animated-border",
  fast: "animated-border animated-border-fast",
};

export function AnimatedBorderCard({
  children,
  className = "",
  speed = "default",
  hoverOnly = false,
  tiltEffect = false,
  tiltAmount = 8,
  borderWidth = 2,
  rounded = "xl",
  bgClassName = "bg-background",
  onClick,
}: AnimatedBorderCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Motion values for tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 300, damping: 30 };
  const rotateX = useSpring(
    useTransform(y, [-0.5, 0.5], [tiltAmount, -tiltAmount]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(x, [-0.5, 0.5], [-tiltAmount, tiltAmount]),
    springConfig
  );

  const handleMouseMove = (e: MouseEvent) => {
    if (!tiltEffect || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const normalizedX = (e.clientX - centerX) / rect.width;
    const normalizedY = (e.clientY - centerY) / rect.height;

    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseLeave = () => {
    if (!tiltEffect) return;
    x.set(0);
    y.set(0);
  };

  const borderClass = cn(
    speedClassMap[speed],
    hoverOnly && "animated-border-hover"
  );

  const containerClass = cn(
    "relative overflow-hidden",
    borderRadiusMap[rounded],
    borderClass,
    className
  );

  const innerClass = cn(
    "relative z-10",
    borderRadiusMap[rounded],
    bgClassName
  );

  // CSS custom property for border width
  const borderStyle = {
    "--border-width": `${borderWidth}px`,
  } as React.CSSProperties;

  if (tiltEffect) {
    return (
      <motion.div
        ref={ref}
        className={containerClass}
        style={{
          ...borderStyle,
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          perspective: 1000,
        }}
        variants={cardVariants}
        initial="initial"
        whileHover="hover"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
      >
        <div className={innerClass} style={{ margin: borderWidth }}>
          {children}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={containerClass}
      style={borderStyle}
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      onClick={onClick}
    >
      <div className={innerClass} style={{ margin: borderWidth }}>
        {children}
      </div>
    </motion.div>
  );
}

// ============================================
// ANIMATED BORDER BUTTON - Button variant with animated border
// ============================================

interface AnimatedBorderButtonProps {
  children: ReactNode;
  className?: string;
  /** Animation speed */
  speed?: "slow" | "default" | "fast";
  /** Only animate on hover */
  hoverOnly?: boolean;
  /** Button type */
  type?: "button" | "submit" | "reset";
  /** Disabled state */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
}

export function AnimatedBorderButton({
  children,
  className = "",
  speed = "default",
  hoverOnly = true,
  type = "button",
  disabled = false,
  onClick,
}: AnimatedBorderButtonProps) {
  const borderClass = cn(
    speedClassMap[speed],
    hoverOnly && "animated-border-hover"
  );

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-lg",
        borderClass,
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <span
        className={cn(
          "relative z-10 block rounded-lg bg-background px-6 py-3",
          "font-medium text-foreground",
          "transition-colors duration-200"
        )}
        style={{ margin: 2 }}
      >
        {children}
      </span>
    </motion.button>
  );
}

// ============================================
// GRADIENT BORDER CARD - Static gradient border (no animation)
// ============================================

interface GradientBorderCardProps {
  children: ReactNode;
  className?: string;
  /** Gradient direction */
  direction?: "to-r" | "to-br" | "to-b" | "to-bl" | "to-l" | "to-tl" | "to-t" | "to-tr";
  /** Border width in pixels */
  borderWidth?: number;
  /** Custom border radius */
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl";
  /** Custom gradient colors (Tailwind classes) */
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  /** Background color class */
  bgClassName?: string;
  /** Enable hover lift effect */
  hoverEffect?: boolean;
}

const directionMap = {
  "to-r": "bg-gradient-to-r",
  "to-br": "bg-gradient-to-br",
  "to-b": "bg-gradient-to-b",
  "to-bl": "bg-gradient-to-bl",
  "to-l": "bg-gradient-to-l",
  "to-tl": "bg-gradient-to-tl",
  "to-t": "bg-gradient-to-t",
  "to-tr": "bg-gradient-to-tr",
};

export function GradientBorderCard({
  children,
  className = "",
  direction = "to-br",
  borderWidth = 2,
  rounded = "xl",
  gradientFrom = "from-primary",
  gradientVia = "via-secondary",
  gradientTo = "to-primary",
  bgClassName = "bg-background",
  hoverEffect = true,
}: GradientBorderCardProps) {
  const gradientClass = cn(
    directionMap[direction],
    gradientFrom,
    gradientVia,
    gradientTo
  );

  const containerClass = cn(
    "relative p-px overflow-hidden",
    borderRadiusMap[rounded],
    gradientClass,
    className
  );

  const innerClass = cn(
    borderRadiusMap[rounded],
    bgClassName,
    "relative z-10"
  );

  if (hoverEffect) {
    return (
      <motion.div
        className={containerClass}
        style={{ padding: borderWidth }}
        whileHover={{ y: -2, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className={innerClass}>{children}</div>
      </motion.div>
    );
  }

  return (
    <div className={containerClass} style={{ padding: borderWidth }}>
      <div className={innerClass}>{children}</div>
    </div>
  );
}
