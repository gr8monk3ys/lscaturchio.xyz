"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef, ReactNode } from "react";

// ============================================
// ANIMATED TEXT REVEAL - Word by word reveal
// ============================================
interface AnimatedTextProps {
  text: string;
  className?: string;
  once?: boolean;
  delay?: number;
}

const wordVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    rotateX: -90,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
  },
};

export function AnimatedText({ text, className = "", once = true, delay = 0 }: AnimatedTextProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-50px" });
  const words = text.split(" ");

  return (
    <motion.span
      ref={ref}
      className={`inline-flex flex-wrap ${className}`}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ staggerChildren: 0.08, delayChildren: delay }}
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className="inline-block mr-[0.25em]"
          variants={wordVariants}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
          }}
          style={{ perspective: 1000 }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

// ============================================
// ANIMATED HEADING - Character by character
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
  animate?: boolean;
}

export function GradientText({
  children,
  className = "",
}: GradientTextProps) {
  // Use the primary green color - no gradient animation needed
  // This keeps the design cohesive with the green theme
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

// ============================================
// TYPEWRITER EFFECT
// ============================================
interface TypewriterProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
}

export function Typewriter({
  text,
  className = "",
  speed = 50,
  delay = 0,
  cursor = true,
}: TypewriterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <span ref={ref} className={`inline-flex ${className}`}>
      <motion.span
        initial={{ width: 0 }}
        animate={isInView ? { width: "auto" } : { width: 0 }}
        transition={{
          duration: text.length * (speed / 1000),
          delay,
          ease: "linear" as const,
        }}
        className="overflow-hidden whitespace-nowrap"
      >
        {text}
      </motion.span>
      {cursor && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 1] }}
          className="inline-block w-[2px] h-[1em] bg-current ml-1"
        />
      )}
    </span>
  );
}

// ============================================
// BLUR IN TEXT
// ============================================
interface BlurInTextProps {
  children: string;
  className?: string;
  delay?: number;
}

export function BlurInText({ children, className = "", delay = 0 }: BlurInTextProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.span
      ref={ref}
      className={`inline-block ${className}`}
      initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
      animate={isInView ? { opacity: 1, filter: "blur(0px)", y: 0 } : {}}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      }}
    >
      {children}
    </motion.span>
  );
}

// ============================================
// SPLIT TEXT - Lines animate separately
// ============================================
interface SplitTextProps {
  children: string;
  className?: string;
  lineClassName?: string;
  delay?: number;
}

export function SplitText({
  children,
  className = "",
  lineClassName = "",
  delay = 0,
}: SplitTextProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const lines = children.split("\n");

  return (
    <div ref={ref} className={className}>
      {lines.map((line, index) => (
        <div key={index} className="overflow-hidden">
          <motion.div
            className={lineClassName}
            initial={{ y: "100%" }}
            animate={isInView ? { y: 0 } : {}}
            transition={{
              duration: 0.6,
              delay: delay + index * 0.1,
              ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            }}
          >
            {line}
          </motion.div>
        </div>
      ))}
    </div>
  );
}
