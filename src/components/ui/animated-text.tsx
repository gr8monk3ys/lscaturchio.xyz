"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef, ReactNode } from "react";

// ============================================
// ANIMATED HEADING - Character by character reveal
// ============================================

interface AnimatedHeadingProps {
  children: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
  once?: boolean;
  staggerDelay?: number;
}

const charVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
    rotateX: -90,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
  },
};

export function AnimatedHeading({
  children,
  as: Component = "h2",
  className = "",
  once = true,
  staggerDelay = 0.03,
}: AnimatedHeadingProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-100px" });
  const characters = children.split("");

  return (
    <Component ref={ref} className={className}>
      <motion.span
        className="inline-flex flex-wrap"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ staggerChildren: staggerDelay }}
      >
        {characters.map((char, index) => (
          <motion.span
            key={`${char}-${index}`}
            className="inline-block"
            variants={charVariants}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            }}
            style={{
              perspective: 1000,
              whiteSpace: char === " " ? "pre" : "normal",
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.span>
    </Component>
  );
}

// ============================================
// GRADIENT TEXT - Uses primary green color
// ============================================

interface GradientTextProps {
  children: ReactNode;
  className?: string;
}

export function GradientText({
  children,
  className = "",
}: GradientTextProps) {
  return (
    <motion.span
      className={`inline-block text-primary font-bold ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      }}
    >
      {children}
    </motion.span>
  );
}
