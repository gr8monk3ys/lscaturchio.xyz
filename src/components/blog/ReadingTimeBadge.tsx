// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import React from "react";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ReadingTimeBadgeProps {
  readingTime: string;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ReadingTimeBadge({
  readingTime,
  className = "",
  showIcon = true,
  size = "md",
}: ReadingTimeBadgeProps): JSX.Element {
  const sizeClasses = {
    sm: "text-xs py-1 px-2",
    md: "text-sm py-1.5 px-3",
    lg: "text-base py-2 px-4",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "inline-flex items-center rounded-full bg-stone-100 dark:bg-stone-800 font-medium font-space-mono text-stone-700 dark:text-stone-300 shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)]",
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Clock className="mr-1.5 h-3.5 w-3.5" />}
      <span>{readingTime}</span>
    </motion.div>
  );
}
