// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface BackToTopProps {
  showAt?: number;
  className?: string;
  position?: "bottom-right" | "bottom-left" | "bottom-center";
  offset?: number;
}

export function BackToTop({
  showAt = 300,
  className,
  position = "bottom-right",
  offset = 6,
}: BackToTopProps): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);

  // Position classes
  const positionClasses = {
    "bottom-right": "right-6 lg:right-10",
    "bottom-left": "left-6 lg:left-10",
    "bottom-center": "left-1/2 transform -translate-x-1/2",
  };

  // Track scroll position and show button when scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > showAt) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Initial check
    toggleVisibility();
    
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, [showAt]);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          aria-label="Back to top"
          className={cn(
            `fixed bottom-${offset} z-50 flex h-10 w-10 items-center justify-center rounded-md bg-gray-800/70 text-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] backdrop-blur-sm transition-all duration-200 hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-primary/30 dark:bg-gray-700/70 dark:hover:bg-gray-600/90`,
            positionClasses[position],
            className
          )}
        >
          <ChevronUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
