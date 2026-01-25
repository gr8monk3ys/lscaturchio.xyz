"use client";

import { motion } from "framer-motion";
import { ReactNode, useMemo } from "react";

/**
 * Generate deterministic random values based on seed
 * This ensures consistent values across renders without calling Math.random() during render
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

// ============================================
// FLOATING ELEMENT - Continuous float animation
// ============================================
interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  distance?: number;
  delay?: number;
}

export function FloatingElement({
  children,
  className = "",
  duration = 3,
  distance = 10,
  delay = 0,
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -distance, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut" as const,
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// ROTATING ELEMENT - Continuous rotation
// ============================================
interface RotatingElementProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  direction?: "cw" | "ccw";
}

export function RotatingElement({
  children,
  className = "",
  duration = 10,
  direction = "cw",
}: RotatingElementProps) {
  const rotation = direction === "cw" ? 360 : -360;

  return (
    <motion.div
      className={className}
      animate={{ rotate: rotation }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear" as const,
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// PULSING ELEMENT - Scale pulse animation
// ============================================
interface PulsingElementProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  scale?: number;
}

export function PulsingElement({
  children,
  className = "",
  duration = 2,
  scale = 1.05,
}: PulsingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, scale, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut" as const,
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// ORBIT ELEMENT - Orbiting animation
// ============================================
interface OrbitElementProps {
  children: ReactNode;
  className?: string;
  radius?: number;
  duration?: number;
  delay?: number;
  direction?: "cw" | "ccw";
}

export function OrbitElement({
  children,
  className = "",
  radius = 100,
  duration = 10,
  delay = 0,
  direction = "cw",
}: OrbitElementProps) {
  const angle = direction === "cw" ? [0, 360] : [360, 0];

  return (
    <motion.div
      className={`absolute ${className}`}
      animate={{
        rotate: angle,
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear" as const,
      }}
      style={{
        transformOrigin: `center ${radius}px`,
      }}
    >
      <motion.div
        animate={{ rotate: direction === "cw" ? [0, -360] : [-360, 0] }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: "linear" as const,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// ============================================
// BLOB ANIMATION - Morphing blob shape
// ============================================
interface AnimatedBlobProps {
  className?: string;
  color?: string;
  size?: number;
}

export function AnimatedBlob({
  className = "",
  color = "hsl(var(--primary) / 0.3)",
  size = 400,
}: AnimatedBlobProps) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
      }}
      animate={{
        scale: [1, 1.1, 0.95, 1.05, 1],
        x: [0, 30, -20, 10, 0],
        y: [0, -20, 30, -10, 0],
        borderRadius: [
          "60% 40% 30% 70%/60% 30% 70% 40%",
          "30% 60% 70% 40%/50% 60% 30% 60%",
          "60% 40% 30% 70%/60% 30% 70% 40%",
        ],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut" as const,
      }}
    />
  );
}

// ============================================
// ANIMATED GRID - Background grid pattern
// ============================================
interface AnimatedGridProps {
  className?: string;
  gridSize?: number;
  color?: string;
}

export function AnimatedGrid({
  className = "",
  gridSize = 50,
  color = "hsl(var(--primary) / 0.05)",
}: AnimatedGridProps) {
  return (
    <motion.div
      className={`absolute inset-0 overflow-hidden ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, transparent 0%, hsl(var(--background)) 70%)`,
        }}
      />
    </motion.div>
  );
}

// ============================================
// ANIMATED SHAPES - Floating geometric shapes
// ============================================
interface AnimatedShapesProps {
  className?: string;
  count?: number;
}

export function AnimatedShapes({
  className = "",
  count = 5,
}: AnimatedShapesProps) {
  // Pre-compute random values to avoid calling Math.random() during render
  const shapeConfigs = useMemo(() => {
    const shapes = ["circle", "square", "triangle"] as const;
    return Array.from({ length: count }).map((_, i) => ({
      shape: shapes[i % shapes.length],
      size: 20 + seededRandom(i * 1) * 40,
      left: seededRandom(i * 2) * 100,
      top: seededRandom(i * 3) * 100,
      duration: 15 + seededRandom(i * 4) * 10,
      delay: seededRandom(i * 5) * 5,
    }));
  }, [count]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {shapeConfigs.map((config, i) => {
        const { shape, size, left, top, duration, delay } = config;

        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, 30, -30, 0],
              rotate: [0, 180, 360],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "easeInOut" as const,
            }}
          >
            {shape === "circle" && (
              <div className="w-full h-full rounded-full border border-primary/20" />
            )}
            {shape === "square" && (
              <div className="w-full h-full border border-primary/20 rotate-45" />
            )}
            {shape === "triangle" && (
              <div
                className="w-0 h-0 border-l-[15px] border-r-[15px] border-b-[26px] border-l-transparent border-r-transparent border-b-primary/20"
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ============================================
// PARTICLES BACKGROUND - Simple particle field
// ============================================
interface ParticlesBackgroundProps {
  className?: string;
  particleCount?: number;
  color?: string;
}

export function ParticlesBackground({
  className = "",
  particleCount = 30,
  color = "hsl(var(--primary))",
}: ParticlesBackgroundProps) {
  // Pre-compute particle configurations to avoid calling Math.random() during render
  const particleConfigs = useMemo(() =>
    Array.from({ length: particleCount }).map((_, i) => ({
      size: 2 + seededRandom(i * 10) * 4,
      left: seededRandom(i * 11) * 100,
      duration: 10 + seededRandom(i * 12) * 20,
      delay: seededRandom(i * 13) * 10,
      opacity: 0.3 + seededRandom(i * 14) * 0.4,
      xOffset: (seededRandom(i * 15) - 0.5) * 100,
    })), [particleCount]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particleConfigs.map((config, i) => {
        const { size, left, duration, delay, opacity, xOffset } = config;

        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              bottom: -10,
              backgroundColor: color,
              opacity,
            }}
            animate={{
              y: [0, -1000], // Use fixed value instead of window.innerHeight
              x: [0, xOffset],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "linear" as const,
            }}
          />
        );
      })}
    </div>
  );
}

// ============================================
// WAVE ANIMATION - Animated wave line
// ============================================
interface WaveAnimationProps {
  className?: string;
  color?: string;
  amplitude?: number;
  frequency?: number;
}

export function WaveAnimation({
  className = "",
  color = "hsl(var(--primary))",
  amplitude = 20,
  frequency = 0.02,
}: WaveAnimationProps) {
  const points = 100;
  const width = 1000;

  const generatePath = (offset: number) => {
    let path = `M 0 ${amplitude}`;
    for (let i = 0; i <= points; i++) {
      const x = (i / points) * width;
      const y = amplitude + Math.sin((i * frequency * Math.PI * 2) + offset) * amplitude;
      path += ` L ${x} ${y}`;
    }
    return path;
  };

  return (
    <div className={`absolute inset-x-0 overflow-hidden ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${amplitude * 2 + 10}`}
        className="w-full h-auto"
        preserveAspectRatio="none"
      >
        <motion.path
          d={generatePath(0)}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeOpacity="0.3"
          animate={{
            d: [
              generatePath(0),
              generatePath(Math.PI),
              generatePath(Math.PI * 2),
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear" as const,
          }}
        />
        <motion.path
          d={generatePath(Math.PI / 2)}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeOpacity="0.2"
          animate={{
            d: [
              generatePath(Math.PI / 2),
              generatePath(Math.PI * 1.5),
              generatePath(Math.PI * 2.5),
            ],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear" as const,
          }}
        />
      </svg>
    </div>
  );
}
