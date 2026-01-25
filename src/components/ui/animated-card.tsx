"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode, useRef, MouseEvent } from "react";

// ============================================
// 3D TILT CARD - Interactive tilt on hover
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

// ============================================
// SPOTLIGHT CARD - Card with spotlight effect
// ============================================
interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  spotlightSize?: number;
}

export function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(120, 119, 198, 0.1)",
  spotlightSize = 300,
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: spotlightSize,
          height: spotlightSize,
          left: mouseX,
          top: mouseY,
          x: -spotlightSize / 2,
          y: -spotlightSize / 2,
          background: `radial-gradient(circle, ${spotlightColor}, transparent 50%)`,
        }}
      />
      {children}
    </motion.div>
  );
}

// ============================================
// BORDER GRADIENT CARD - Animated border
// ============================================
interface BorderGradientCardProps {
  children: ReactNode;
  className?: string;
  borderWidth?: number;
  duration?: number;
}

export function BorderGradientCard({
  children,
  className = "",
  borderWidth = 2,
  duration = 3,
}: BorderGradientCardProps) {
  return (
    <div
      className={`relative rounded-2xl ${className}`}
      style={{ padding: borderWidth }}
    >
      {/* Animated gradient border */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: "conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--primary) / 0.2), hsl(var(--primary)))",
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration,
          ease: "linear" as const,
          repeat: Infinity,
        }}
      />
      {/* Inner content */}
      <div
        className="relative bg-background h-full"
        style={{ borderRadius: Math.max(14, 16 - borderWidth) }}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================
// REVEAL CARD - Reveals content on hover
// ============================================
interface RevealCardProps {
  children: ReactNode;
  revealContent: ReactNode;
  className?: string;
}

export function RevealCard({
  children,
  revealContent,
  className = "",
}: RevealCardProps) {
  return (
    <motion.div
      className={`relative overflow-hidden group ${className}`}
      whileHover="hover"
      initial="rest"
    >
      {/* Default content */}
      <motion.div
        variants={{
          rest: { opacity: 1, y: 0 },
          hover: { opacity: 0, y: -20 },
        }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>

      {/* Reveal content */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        variants={{
          rest: { opacity: 0, y: 20 },
          hover: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.3 }}
      >
        {revealContent}
      </motion.div>
    </motion.div>
  );
}

// ============================================
// SHIMMER CARD - Shimmer effect on hover
// ============================================
interface ShimmerCardProps {
  children: ReactNode;
  className?: string;
}

export function ShimmerCard({ children, className = "" }: ShimmerCardProps) {
  return (
    <motion.div
      className={`relative overflow-hidden group ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
          transform: "translateX(-100%)",
        }}
        initial={false}
        whileHover={{
          transform: "translateX(100%)",
          transition: { duration: 0.5 },
        }}
      />
      {children}
    </motion.div>
  );
}

// ============================================
// FLIP CARD - 3D flip animation
// ============================================
interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  className?: string;
}

export function FlipCard({ front, back, className = "" }: FlipCardProps) {
  return (
    <motion.div
      className={`relative cursor-pointer ${className}`}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      whileHover={{ rotateY: 180 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Front */}
      <div
        className="absolute inset-0 backface-hidden"
        style={{ backfaceVisibility: "hidden" }}
      >
        {front}
      </div>

      {/* Back */}
      <div
        className="absolute inset-0"
        style={{
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
        }}
      >
        {back}
      </div>
    </motion.div>
  );
}

// ============================================
// GLASS CARD - Glassmorphism with animation
// ============================================
interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className = "" }: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 ${className}`}
      onMouseMove={handleMouseMove}
      whileHover={{ scale: 1.01, borderColor: "rgba(255,255,255,0.2)" }}
      transition={{ duration: 0.3 }}
    >
      {/* Gradient shine effect */}
      <motion.div
        className="absolute pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          width: 200,
          height: 200,
          left: mouseX,
          top: mouseY,
          x: -100,
          y: -100,
          background: "radial-gradient(circle, rgba(255,255,255,0.15), transparent 50%)",
        }}
      />
      {children}
    </motion.div>
  );
}
