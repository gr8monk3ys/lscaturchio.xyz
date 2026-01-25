"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

// ============================================
// PAGE TRANSITION WRAPPER
// ============================================
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  variant?: "fade" | "slide" | "scale" | "slideUp" | "clipReveal";
}

const variants: Record<string, Variants> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  clipReveal: {
    initial: { clipPath: "inset(0 100% 0 0)" },
    animate: { clipPath: "inset(0 0% 0 0)" },
    exit: { clipPath: "inset(0 0 0 100%)" },
  },
};

export function PageTransition({
  children,
  className = "",
  variant = "slideUp",
}: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        className={className}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants[variant]}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// SECTION REVEAL - For scroll animations
// ============================================
interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  once?: boolean;
}

const directionVariants = {
  up: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
  },
  down: {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
  },
  left: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
  },
  right: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
  },
} as const;

export function SectionReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  once = true,
}: SectionRevealProps) {
  const variant = directionVariants[direction];

  return (
    <motion.div
      className={className}
      initial={variant.initial}
      whileInView={variant.animate}
      viewport={{ once, margin: "-100px" }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// STAGGER CONTAINER - For staggered children
// ============================================
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
  once?: boolean;
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.1,
  delayChildren = 0.2,
  once = true,
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// STAGGER ITEM - Child of StaggerContainer
// ============================================
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className = "" }: StaggerItemProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// PARALLAX SECTION - Scroll-based parallax
// ============================================
interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: "up" | "down";
}

import { useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function ParallaxSection({
  children,
  className = "",
  speed = 0.5,
  direction = "up",
}: ParallaxSectionProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const multiplier = direction === "up" ? -1 : 1;
  const y = useTransform(scrollYProgress, [0, 1], [100 * speed * multiplier, -100 * speed * multiplier]);

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}

// ============================================
// SCALE ON SCROLL - Element scales on scroll
// ============================================
interface ScaleOnScrollProps {
  children: ReactNode;
  className?: string;
  scaleRange?: [number, number];
}

export function ScaleOnScroll({
  children,
  className = "",
  scaleRange = [0.8, 1],
}: ScaleOnScrollProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], scaleRange);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  return (
    <motion.div ref={ref} className={className} style={{ scale, opacity }}>
      {children}
    </motion.div>
  );
}

// ============================================
// MASK REVEAL - Text/element reveal with mask
// ============================================
interface MaskRevealProps {
  children: ReactNode;
  className?: string;
  direction?: "left" | "right" | "up" | "down";
  delay?: number;
}

export function MaskReveal({
  children,
  className = "",
  direction = "left",
  delay = 0,
}: MaskRevealProps) {
  const clipPaths: Record<string, { initial: string; animate: string }> = {
    left: {
      initial: "inset(0 100% 0 0)",
      animate: "inset(0 0% 0 0)",
    },
    right: {
      initial: "inset(0 0 0 100%)",
      animate: "inset(0 0 0 0%)",
    },
    up: {
      initial: "inset(100% 0 0 0)",
      animate: "inset(0% 0 0 0)",
    },
    down: {
      initial: "inset(0 0 100% 0)",
      animate: "inset(0 0 0% 0)",
    },
  };

  const clipPath = clipPaths[direction];

  return (
    <motion.div
      className={className}
      initial={{ clipPath: clipPath.initial }}
      whileInView={{ clipPath: clipPath.animate }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
