// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import { useState, useEffect } from "react";

interface ReadingProgressBarProps {
  targetSelector?: string;
  color?: string;
  height?: number;
  position?: "top" | "bottom";
  className?: string;
}

export function ReadingProgressBar({
  targetSelector = "article",
  color = "#78716c", // stone-500
  height = 4,
  position = "top",
  className = "",
}: ReadingProgressBarProps): JSX.Element {
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const calculateReadingProgress = () => {
      const target = document.querySelector(targetSelector);
      
      if (!target) {
        setReadingProgress(0);
        return;
      }
      
      // Get the bounding client rect to calculate position
      const rect = target.getBoundingClientRect();
      
      // Calculate the start (top of the element relative to viewport top)
      const start = rect.top >= 0 ? window.scrollY : window.scrollY + rect.top;
      
      // Calculate the height of the content to read
      const contentHeight = rect.height;
      
      // Calculate how far we've scrolled in the content
      const scrolled = window.scrollY - start;
      
      // Calculate the percentage (and clamp between 0-100)
      const percentage = Math.min(100, Math.max(0, (scrolled / contentHeight) * 100));
      
      setReadingProgress(percentage);
    };

    // Calculate on mount
    calculateReadingProgress();
    
    // Add event listener for scroll
    window.addEventListener("scroll", calculateReadingProgress);
    
    // Cleanup
    return () => {
      window.removeEventListener("scroll", calculateReadingProgress);
    };
  }, [targetSelector]);

  return (
    <div 
      className={`fixed left-0 right-0 z-50 ${position === "top" ? "top-0" : "bottom-0"} ${className}`}
      style={{ height: `${height}px` }}
    >
      <div 
        className="h-full transition-all duration-150 ease-out"
        style={{ 
          width: `${readingProgress}%`, 
          backgroundColor: color,
        }}
        role="progressbar"
        aria-valuenow={readingProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      />
    </div>
  );
}
