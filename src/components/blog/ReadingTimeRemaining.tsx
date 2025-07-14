// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ReadingTimeRemainingProps {
  totalReadingTime: number; // in minutes
  contentSelector?: string;
  className?: string;
}

export function ReadingTimeRemaining({
  totalReadingTime,
  contentSelector = "#blog-content",
  className,
}: ReadingTimeRemainingProps): JSX.Element {
  const [timeRemaining, setTimeRemaining] = useState(totalReadingTime);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const content = document.querySelector(contentSelector);
    if (!content) return;

    const calculateRemainingTime = () => {
      const contentRect = content.getBoundingClientRect();
      const contentTop = contentRect.top;
      const contentHeight = contentRect.height;
      const windowHeight = window.innerHeight;

      // If content is not visible yet
      if (contentTop >= windowHeight) {
        setTimeRemaining(totalReadingTime);
        setVisible(false);
        return;
      }

      // Calculate how much of the content has been scrolled through
      const pixelsScrolled = Math.max(0, -contentTop);
      const visibleContentHeight = Math.min(windowHeight, contentHeight + contentTop);
      
      // Calculate percentage scrolled (considering visible area only)
      const visiblePercentage = Math.min(
        1,
        (pixelsScrolled + visibleContentHeight) / contentHeight
      );
      
      // Calculate remaining time
      const remaining = Math.max(0, totalReadingTime * (1 - visiblePercentage));
      setTimeRemaining(remaining);
      
      // Show component only when we're in the content area
      setVisible(
        contentTop < windowHeight && contentTop + contentHeight > 0
      );
    };

    // Initial calculation
    calculateRemainingTime();

    // Update on scroll
    window.addEventListener("scroll", calculateRemainingTime, { passive: true });

    return () => {
      window.removeEventListener("scroll", calculateRemainingTime);
    };
  }, [contentSelector, totalReadingTime]);

  // Format the remaining time
  const formatTimeRemaining = (minutes: number): string => {
    if (minutes < 0.5) return "Less than 30 seconds";
    if (minutes < 1) return "Less than a minute";
    return `~${Math.ceil(minutes)} min${Math.ceil(minutes) !== 1 ? "s" : ""} left`;
  };

  if (!visible) return <></>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "fixed bottom-6 left-6 z-40 flex items-center gap-1.5 rounded-full bg-stone-50 px-3 py-1.5 text-sm font-space-mono text-stone-700 shadow-[2px_2px_4px_rgba(0,0,0,0.05),-2px_-2px_4px_rgba(255,255,255,0.7)] dark:bg-stone-800 dark:text-stone-300 dark:shadow-[2px_2px_4px_rgba(0,0,0,0.2),-1px_-1px_2px_rgba(255,255,255,0.05)] lg:bottom-10 lg:left-10",
        timeRemaining <= 0 && "hidden",
        className
      )}
    >
      <Clock className="h-3.5 w-3.5" />
      {formatTimeRemaining(timeRemaining)}
    </motion.div>
  );
}
