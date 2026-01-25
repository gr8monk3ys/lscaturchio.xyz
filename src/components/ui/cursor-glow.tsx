'use client';

import { useEffect, useState, useRef, RefObject } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useIsClient } from '@/hooks/use-is-client';

// ============================================
// TYPES
// ============================================
interface CursorGlowProps {
  /**
   * Size of the glow gradient in pixels.
   * @default 600
   */
  size?: number;
  /**
   * Opacity of the glow effect (0-1).
   * @default 0.15
   */
  opacity?: number;
  /**
   * Color of the glow. Uses CSS color format.
   * @default 'hsl(var(--primary))'
   */
  color?: string;
  /**
   * Whether to scope the glow to a container element.
   * If provided, glow only appears within the container bounds.
   */
  containerRef?: RefObject<HTMLElement>;
  /**
   * Additional CSS classes for the glow element.
   */
  className?: string;
  /**
   * Z-index of the glow layer.
   * @default 0
   */
  zIndex?: number;
}

// ============================================
// UTILITIES
// ============================================

/**
 * Check if device is mobile/touch device (no hover support)
 */
function checkIsMobile(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(hover: none)').matches;
}

/**
 * Check if user prefers reduced motion
 */
function checkPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ============================================
// CURSOR GLOW COMPONENT
// ============================================

/**
 * CursorGlow - A subtle radial gradient spotlight that follows the cursor.
 * Inspired by Brittany Chiang's portfolio design.
 *
 * Features:
 * - Radial gradient that smoothly follows cursor
 * - Respects reduced-motion preferences
 * - SSR safe (renders on client only)
 * - Performance optimized with CSS transforms
 * - Optional scoping to container element
 *
 * @example
 * // Full-page cursor glow
 * <CursorGlow />
 *
 * @example
 * // Scoped to a section
 * const ref = useRef<HTMLDivElement>(null);
 * <div ref={ref}>
 *   <CursorGlow containerRef={ref} />
 *   <Content />
 * </div>
 */
export function CursorGlow({
  size = 600,
  opacity = 0.15,
  color = 'hsl(var(--primary))',
  containerRef,
  className = '',
  zIndex = 0,
}: CursorGlowProps) {
  const isClient = useIsClient();
  const [isVisible, setIsVisible] = useState(false);

  // Use motion values for smooth animations
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring config for smooth, natural movement
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Compute device/preference checks
  const isMobile = !isClient || checkIsMobile();
  const prefersReducedMotion = isClient && checkPrefersReducedMotion();

  useEffect(() => {
    if (isMobile || prefersReducedMotion) return;

    // Copy ref to variable for cleanup
    const container = containerRef?.current;

    const handleMouseMove = (e: MouseEvent) => {
      if (container) {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if mouse is inside container
        const isInside =
          x >= 0 &&
          x <= rect.width &&
          y >= 0 &&
          y <= rect.height;

        setIsVisible(isInside);

        if (isInside) {
          mouseX.set(x);
          mouseY.set(y);
        }
      } else {
        // Track globally
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
        setIsVisible(true);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      if (!container) {
        setIsVisible(true);
      }
    };

    // Add listeners
    const target = container || document;
    target.addEventListener('mousemove', handleMouseMove as EventListener);

    if (container) {
      container.addEventListener('mouseleave', handleMouseLeave);
      container.addEventListener('mouseenter', handleMouseEnter);
    } else {
      document.addEventListener('mouseleave', handleMouseLeave);
      document.addEventListener('mouseenter', handleMouseEnter);
    }

    return () => {
      target.removeEventListener('mousemove', handleMouseMove as EventListener);
      if (container) {
        container.removeEventListener('mouseleave', handleMouseLeave);
        container.removeEventListener('mouseenter', handleMouseEnter);
      } else {
        document.removeEventListener('mouseleave', handleMouseLeave);
        document.removeEventListener('mouseenter', handleMouseEnter);
      }
    };
  }, [isMobile, prefersReducedMotion, mouseX, mouseY, containerRef]);

  // Don't render on mobile, during SSR, or with reduced motion
  if (isMobile || prefersReducedMotion) return null;

  const isScoped = !!containerRef;

  return (
    <motion.div
      className={`pointer-events-none ${isScoped ? 'absolute' : 'fixed'} inset-0 overflow-hidden ${className}`}
      style={{ zIndex }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
          opacity,
        }}
      />
    </motion.div>
  );
}

// ============================================
// GRADIENT CURSOR GLOW (Alternative style)
// ============================================

interface GradientCursorGlowProps {
  /**
   * Size of the glow gradient in pixels.
   * @default 800
   */
  size?: number;
  /**
   * Opacity of the glow effect (0-1).
   * @default 0.12
   */
  opacity?: number;
  /**
   * Primary color of the gradient.
   * @default 'rgba(100, 200, 100, 0.4)'
   */
  primaryColor?: string;
  /**
   * Secondary color of the gradient (for multi-color effect).
   * @default 'rgba(59, 130, 246, 0.2)'
   */
  secondaryColor?: string;
  /**
   * Container ref for scoped glow.
   */
  containerRef?: RefObject<HTMLElement>;
  /**
   * Z-index of the glow layer.
   * @default 0
   */
  zIndex?: number;
}

/**
 * GradientCursorGlow - A dual-color radial gradient spotlight.
 * Creates a more colorful, dynamic glow effect.
 */
export function GradientCursorGlow({
  size = 800,
  opacity = 0.12,
  primaryColor = 'rgba(100, 200, 100, 0.4)',
  secondaryColor = 'rgba(59, 130, 246, 0.2)',
  containerRef,
  zIndex = 0,
}: GradientCursorGlowProps) {
  const isClient = useIsClient();
  const [isVisible, setIsVisible] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 120, mass: 0.8 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const isMobile = !isClient || checkIsMobile();
  const prefersReducedMotion = isClient && checkPrefersReducedMotion();

  useEffect(() => {
    if (isMobile || prefersReducedMotion) return;

    // Copy ref to variable for cleanup
    const container = containerRef?.current;

    const handleMouseMove = (e: MouseEvent) => {
      if (container) {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const isInside =
          x >= 0 &&
          x <= rect.width &&
          y >= 0 &&
          y <= rect.height;

        setIsVisible(isInside);

        if (isInside) {
          mouseX.set(x);
          mouseY.set(y);
        }
      } else {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
        setIsVisible(true);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => {
      if (!container) setIsVisible(true);
    };

    const target = container || document;
    target.addEventListener('mousemove', handleMouseMove as EventListener);

    if (container) {
      container.addEventListener('mouseleave', handleMouseLeave);
      container.addEventListener('mouseenter', handleMouseEnter);
    } else {
      document.addEventListener('mouseleave', handleMouseLeave);
      document.addEventListener('mouseenter', handleMouseEnter);
    }

    return () => {
      target.removeEventListener('mousemove', handleMouseMove as EventListener);
      if (container) {
        container.removeEventListener('mouseleave', handleMouseLeave);
        container.removeEventListener('mouseenter', handleMouseEnter);
      } else {
        document.removeEventListener('mouseleave', handleMouseLeave);
        document.removeEventListener('mouseenter', handleMouseEnter);
      }
    };
  }, [isMobile, prefersReducedMotion, mouseX, mouseY, containerRef]);

  if (isMobile || prefersReducedMotion) return null;

  const isScoped = !!containerRef;

  return (
    <motion.div
      className={`pointer-events-none ${isScoped ? 'absolute' : 'fixed'} inset-0 overflow-hidden`}
      style={{ zIndex }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Primary glow */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: size,
          height: size,
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          background: `radial-gradient(circle at center, ${primaryColor} 0%, transparent 60%)`,
          opacity,
        }}
      />
      {/* Secondary glow (offset) */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: size * 0.7,
          height: size * 0.7,
          x: springX,
          y: springY,
          translateX: '-30%',
          translateY: '-30%',
          background: `radial-gradient(circle at center, ${secondaryColor} 0%, transparent 60%)`,
          opacity: opacity * 0.8,
        }}
      />
    </motion.div>
  );
}
