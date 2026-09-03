"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "./button";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* A hairline paper square, not a floating action button: no shadow, no
          fill, no lift. Hover warms the border and tints the ground. */}
      <Button
        onClick={scrollToTop}
        size="icon"
        variant="ghost"
        className="h-9 w-9 rounded-sm border border-border bg-card text-muted-foreground shadow-none transition-colors hover:border-primary/45 hover:bg-primary/6 hover:text-primary"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
    </div>
  );
}
