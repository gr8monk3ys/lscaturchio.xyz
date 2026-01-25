"use client";

import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";

// ============================================
// ANIMATED COUNTER - Numbers count up
// ============================================
interface AnimatedCounterProps {
  value: number;
  className?: string;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  once?: boolean;
}

export function AnimatedCounter({
  value,
  className = "",
  duration = 2,
  prefix = "",
  suffix = "",
  decimals = 0,
  once = true,
}: AnimatedCounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-50px" });
  // Use ref instead of state to avoid triggering re-renders
  const hasAnimatedRef = useRef(false);

  const springValue = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const displayValue = useTransform(springValue, (latest) =>
    latest.toFixed(decimals)
  );

  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (isInView && !hasAnimatedRef.current) {
      springValue.set(value);
      hasAnimatedRef.current = true;
    }
  }, [isInView, springValue, value]);

  useEffect(() => {
    const unsubscribe = displayValue.on("change", (v) => setDisplay(v));
    return unsubscribe;
  }, [displayValue]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}

// ============================================
// STAT CARD - Animated stat display
// ============================================
interface StatCardProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function StatCard({
  value,
  label,
  prefix = "",
  suffix = "",
  className = "",
  icon,
}: StatCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      className={`relative p-6 rounded-2xl bg-secondary/50 backdrop-blur-sm border border-border/50 overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />

      <div className="relative space-y-2">
        {icon && (
          <motion.div
            className="text-primary mb-3"
            initial={{ scale: 0, rotate: -180 }}
            animate={isInView ? { scale: 1, rotate: 0 } : {}}
            transition={{ delay: 0.2, type: "spring" as const, stiffness: 200 }}
          >
            {icon}
          </motion.div>
        )}
        <div className="text-4xl font-bold tracking-tight">
          <AnimatedCounter
            value={value}
            prefix={prefix}
            suffix={suffix}
            duration={2}
          />
        </div>
        <p className="text-muted-foreground text-sm">{label}</p>
      </div>
    </motion.div>
  );
}

// ============================================
// PROGRESS BAR - Animated progress
// ============================================
interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  showValue?: boolean;
  duration?: number;
}

export function AnimatedProgress({
  value,
  max = 100,
  className = "",
  barClassName = "",
  showValue = false,
  duration = 1,
}: AnimatedProgressProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const percentage = (value / max) * 100;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-primary ${barClassName}`}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${percentage}%` } : {}}
          transition={{
            duration,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </div>
      {showValue && (
        <motion.span
          className="absolute right-0 top-full mt-1 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: duration * 0.5 }}
        >
          {percentage.toFixed(0)}%
        </motion.span>
      )}
    </div>
  );
}

// ============================================
// SKILL BAR - Labeled progress bar
// ============================================
interface SkillBarProps {
  name: string;
  level: number;
  className?: string;
  color?: string;
}

export function SkillBar({
  name,
  level,
  className = "",
  color = "bg-primary",
}: SkillBarProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      className={`space-y-2 ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between text-sm">
        <span className="font-medium">{name}</span>
        <span className="text-muted-foreground">{level}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${level}%` } : {}}
          transition={{
            duration: 1,
            delay: 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </div>
    </motion.div>
  );
}

// ============================================
// CIRCULAR PROGRESS - Radial progress indicator
// ============================================
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
  color?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className = "",
  showValue = true,
  color = "stroke-primary",
}: CircularProgressProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const percentage = (value / max) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div ref={ref} className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          className="stroke-secondary"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <motion.circle
          className={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={isInView ? { strokeDashoffset: offset } : {}}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatedCounter
            value={percentage}
            suffix="%"
            className="text-2xl font-bold"
            duration={1.5}
          />
        </div>
      )}
    </div>
  );
}
