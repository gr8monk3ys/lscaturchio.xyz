"use client";

import { motion, useInView, Variants } from "framer-motion";
import { ReactNode, useRef } from "react";
import {
  staggerContainerVariants,
  staggerItemVariants,
  showContainerVariants,
  showItemVariants
} from "@/lib/animations";

// ============================================
// ANIMATED SECTION
// A wrapper that applies stagger animations to children
// ============================================
interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  /** Use "visible" for animate="visible" or "show" for animate="show" */
  animateState?: "visible" | "show";
  /** Delay before starting the stagger animation */
  delay?: number;
  /** Custom variants (overrides default stagger variants) */
  variants?: Variants;
  /** Whether to trigger animation once or every time in view */
  once?: boolean;
  /** Viewport margin for triggering animation */
  margin?: string;
  /** HTML element to render */
  as?: "div" | "section" | "article" | "main";
}

export function AnimatedSection({
  children,
  className = "",
  animateState = "visible",
  delay = 0,
  variants,
  once = true,
  margin = "-100px",
  as = "div"
}: AnimatedSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: margin as `${number}px` });
  const Component = motion[as];

  // Select appropriate variants based on animate state
  const containerVariants = variants ||
    (animateState === "show" ? showContainerVariants : staggerContainerVariants);

  // Add delay to container variants if specified
  const variantsWithDelay = delay > 0
    ? {
        ...containerVariants,
        [animateState]: {
          ...(containerVariants as { visible?: object; show?: object })[animateState],
          transition: {
            ...((containerVariants as { visible?: { transition?: object }; show?: { transition?: object } })[animateState]?.transition || {}),
            delayChildren: delay
          }
        }
      }
    : containerVariants;

  return (
    <Component
      ref={ref}
      className={className}
      variants={variantsWithDelay}
      initial="hidden"
      animate={isInView ? animateState : "hidden"}
    >
      {children}
    </Component>
  );
}

// ============================================
// ANIMATED ITEM
// A child item for use within AnimatedSection
// ============================================
interface AnimatedItemProps {
  children: ReactNode;
  className?: string;
  /** Use "visible" for animate="visible" or "show" for animate="show" */
  animateState?: "visible" | "show";
  /** Custom variants (overrides default item variants) */
  variants?: Variants;
  /** HTML element to render */
  as?: "div" | "span" | "article" | "li" | "p" | "h1" | "h2" | "h3" | "h4";
}

export function AnimatedItem({
  children,
  className = "",
  animateState = "visible",
  variants,
  as = "div"
}: AnimatedItemProps) {
  const Component = motion[as];

  // Select appropriate variants based on animate state
  const itemVariants = variants ||
    (animateState === "show" ? showItemVariants : staggerItemVariants);

  return (
    <Component className={className} variants={itemVariants}>
      {children}
    </Component>
  );
}
