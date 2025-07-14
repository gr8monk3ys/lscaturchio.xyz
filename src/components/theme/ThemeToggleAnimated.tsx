// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleAnimatedProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ThemeToggleAnimated({
  className,
  size = "md",
}: ThemeToggleAnimatedProps): JSX.Element {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Prevent hydration errors
  if (!mounted) return <div className={getContainerClasses(size, className)} />;

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={getContainerClasses(size, className)}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="relative flex items-center justify-center">
        {/* Sun */}
        <motion.div
          initial={{ scale: isDark ? 0 : 1 }}
          animate={{ 
            scale: isDark ? 0 : 1,
            opacity: isDark ? 0 : 1,
          }}
          transition={{ duration: 0.3 }}
          className="absolute"
        >
          <SunIcon size={getSizeInPixels(size)} />
        </motion.div>

        {/* Moon */}
        <motion.div
          initial={{ scale: isDark ? 1 : 0 }}
          animate={{ 
            scale: isDark ? 1 : 0,
            opacity: isDark ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="absolute"
        >
          <MoonIcon size={getSizeInPixels(size)} />
        </motion.div>
      </div>
    </Button>
  );
}

// Helper functions
function getContainerClasses(size: string, className?: string): string {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return cn(
    "rounded-full",
    sizeClasses[size as keyof typeof sizeClasses],
    className
  );
}

function getSizeInPixels(size: string): number {
  const sizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };
  return sizes[size as keyof typeof sizes];
}

// Custom Icons with animations
function SunIcon({ size = 20 }: { size?: number }): JSX.Element {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
    >
      <motion.circle
        cx="12"
        cy="12"
        r="5"
        stroke="currentColor"
        strokeWidth="2"
      />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <motion.line
          key={i}
          x1="12"
          y1="2"
          x2="12"
          y2="4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            delay: i * 0.25,
            repeatType: "reverse" 
          }}
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
    </motion.svg>
  );
}

function MoonIcon({ size = 20 }: { size?: number }): JSX.Element {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.circle
        cx="9"
        cy="9"
        r="1"
        fill="currentColor"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      />
      <motion.circle
        cx="15"
        cy="13"
        r="0.5"
        fill="currentColor"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.3 }}
      />
    </motion.svg>
  );
}
