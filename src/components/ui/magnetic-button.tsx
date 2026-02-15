"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useRef, ReactNode, useState } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  as?: "button" | "div" | "a";
  onClick?: () => void;
  href?: string;
}

export function MagneticButton({
  children,
  className = "",
  strength = 0.5,
  as: Component = "button",
  onClick,
  href,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const MotionComponent = motion[Component] as typeof motion.button;

  return (
    <MotionComponent
      ref={ref as React.RefObject<HTMLButtonElement>}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...(href && { href })}
    >
      {children}
    </MotionComponent>
  );
}

// ============================================
// RIPPLE BUTTON - Click ripple effect
// ============================================
interface RippleButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export function RippleButton({
  children,
  className = "",
  onClick,
  disabled = false,
}: RippleButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple: Ripple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    onClick?.();
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: "translate(-50%, -50%)",
          }}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" as const }}
        />
      ))}
      {children}
    </motion.button>
  );
}

// ============================================
// GLOW BUTTON - Hover glow effect
// ============================================
interface GlowButtonProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  onClick?: () => void;
}

export function GlowButton({
  children,
  className = "",
  glowColor = "rgba(124, 58, 237, 0.5)",
  onClick,
}: GlowButtonProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className="absolute pointer-events-none rounded-full blur-xl"
        style={{
          width: 150,
          height: 150,
          left: position.x - 75,
          top: position.y - 75,
          background: glowColor,
        }}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

// ============================================
// BORDER BEAM BUTTON - Animated border
// ============================================
interface BorderBeamButtonProps {
  children: ReactNode;
  className?: string;
  borderColor?: string;
  onClick?: () => void;
}

export function BorderBeamButton({
  children,
  className = "",
  borderColor = "hsl(var(--primary))",
  onClick,
}: BorderBeamButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      className={`relative group ${className}`}
      onClick={onClick}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
    >
      {/* Animated border beam */}
      <span className="absolute inset-0 rounded-xl overflow-hidden">
        <motion.span
          className="absolute inset-[-100%] rounded-xl"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, ${borderColor} 60deg, transparent 120deg)`,
          }}
          animate={prefersReducedMotion ? undefined : { rotate: 360 }}
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  duration: 3,
                  ease: "linear" as const,
                  repeat: Infinity,
                }
          }
        />
      </span>
      {/* Inner content */}
      <span className="relative block m-[2px] rounded-[10px] bg-background px-6 py-3">
        {children}
      </span>
    </motion.button>
  );
}
