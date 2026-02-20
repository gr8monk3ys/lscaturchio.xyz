"use client";

import { motion, useMotionValue, useSpring, useTransform, Variants } from '@/lib/motion';
import { ReactNode, useRef, MouseEvent } from "react";

// ============================================
// HOVER CARD - Simple hover animation with scale and shadow
// ============================================
interface HoverCardProps {
  children: ReactNode;
  className?: string;
}

const hoverCardVariants: Variants = {
  initial: {
    y: 0,
    scale: 1,
  },
  hover: {
    y: -4,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

export function HoverCard({ children, className = "" }: HoverCardProps) {
  return (
    <motion.div
      className={className}
      variants={hoverCardVariants}
      initial="initial"
      whileHover="hover"
    >
      {children}
    </motion.div>
  );
}

// ============================================
// TILT CARD - Interactive 3D tilt on hover
// ============================================
interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltAmount?: number;
  scale?: number;
  glareOpacity?: number;
}

export function TiltCard({
  children,
  className = "",
  tiltAmount = 10,
  scale = 1.02,
  glareOpacity = 0.1,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 300, damping: 30 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [tiltAmount, -tiltAmount]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-tiltAmount, tiltAmount]), springConfig);
  const scaleValue = useSpring(1, springConfig);

  const glareX = useTransform(x, [-0.5, 0.5], [-100, 200]);
  const glareY = useTransform(y, [-0.5, 0.5], [-100, 200]);

  const handleMouseMove = (e: MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const normalizedX = (e.clientX - centerX) / rect.width;
    const normalizedY = (e.clientY - centerY) / rect.height;

    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseEnter = () => {
    scaleValue.set(scale);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    scaleValue.set(1);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={{
        rotateX,
        rotateY,
        scale: scaleValue,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glare effect */}
      <motion.div
        className="absolute inset-0 rounded-inherit pointer-events-none overflow-hidden"
        style={{
          background: `radial-gradient(circle at ${glareX}% ${glareY}%, white, transparent 50%)`,
          opacity: glareOpacity,
        }}
      />
      {children}
    </motion.div>
  );
}
