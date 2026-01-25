"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { useIsClient } from "@/hooks/use-is-client";

// ============================================
// CURSOR FOLLOWER - Custom cursor effect
// ============================================
interface CursorFollowerProps {
  size?: number;
  color?: string;
  mixBlendMode?: "normal" | "difference" | "multiply" | "screen" | "overlay";
}

/**
 * Check if device is mobile/touch device
 */
function checkIsMobile(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(hover: none)").matches;
}

export function CursorFollower({
  size = 20,
  color = "hsl(var(--primary))",
  mixBlendMode = "difference",
}: CursorFollowerProps) {
  const isClient = useIsClient();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 200 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  // Compute isMobile from client state (no effect needed)
  const isMobile = !isClient || checkIsMobile();

  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX - size / 2);
      cursorY.set(e.clientY - size / 2);
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Detect hovering over interactive elements
    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.closest("[role='button']") ||
        target.dataset.cursorHover === "true";

      setIsHovering(!!isInteractive);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseover", handleElementHover);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseover", handleElementHover);
    };
  }, [cursorX, cursorY, size, isMobile]);

  if (isMobile) return null;

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
        style={{
          x: springX,
          y: springY,
          width: size,
          height: size,
          backgroundColor: color,
          mixBlendMode,
        }}
        animate={{
          scale: isHovering ? 2.5 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          scale: { type: "spring" as const, stiffness: 300, damping: 20 },
          opacity: { duration: 0.2 },
        }}
      />
    </>
  );
}

// ============================================
// SPOTLIGHT CURSOR - Spotlight follows cursor
// ============================================
interface SpotlightCursorProps {
  size?: number;
  opacity?: number;
  color?: string;
}

export function SpotlightCursor({
  size = 400,
  opacity = 0.15,
  color = "hsl(var(--primary))",
}: SpotlightCursorProps) {
  const isClient = useIsClient();
  const cursorX = useMotionValue(-1000);
  const cursorY = useMotionValue(-1000);

  const springConfig = { damping: 30, stiffness: 100 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  // Compute isMobile from client state (no effect needed)
  const isMobile = !isClient || checkIsMobile();

  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX - size / 2);
      cursorY.set(e.clientY - size / 2);
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [cursorX, cursorY, size, isMobile]);

  if (isMobile) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[1] rounded-full blur-3xl"
      style={{
        x: springX,
        y: springY,
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity,
      }}
    />
  );
}

// ============================================
// TRAIL CURSOR - Multiple dots following
// ============================================
interface TrailCursorProps {
  dotCount?: number;
  dotSize?: number;
  color?: string;
}

export function TrailCursor({
  dotCount = 8,
  dotSize = 10,
  color = "hsl(var(--primary))",
}: TrailCursorProps) {
  const isClient = useIsClient();
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState<{ x: number; y: number }[]>(
    Array(dotCount).fill({ x: -100, y: -100 })
  );

  // Compute isMobile from client state (no effect needed)
  const isMobile = !isClient || checkIsMobile();

  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isMobile]);

  useEffect(() => {
    let rafId: number;

    const animateTrail = () => {
      setTrail((prevTrail) => {
        const newTrail = [...prevTrail];
        newTrail[0] = mousePosition;
        for (let i = 1; i < newTrail.length; i++) {
          const dx = newTrail[i - 1].x - newTrail[i].x;
          const dy = newTrail[i - 1].y - newTrail[i].y;
          newTrail[i] = {
            x: newTrail[i].x + dx * 0.35,
            y: newTrail[i].y + dy * 0.35,
          };
        }
        return newTrail;
      });
    };

    const animate = () => {
      animateTrail();
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafId);
  }, [mousePosition]);

  if (isMobile) return null;

  return (
    <>
      {trail.map((dot, index) => (
        <div
          key={index}
          className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
          style={{
            transform: `translate(${dot.x - dotSize / 2}px, ${dot.y - dotSize / 2}px)`,
            width: dotSize * (1 - index * 0.1),
            height: dotSize * (1 - index * 0.1),
            backgroundColor: color,
            opacity: 1 - index * 0.12,
            mixBlendMode: "difference",
          }}
        />
      ))}
    </>
  );
}
