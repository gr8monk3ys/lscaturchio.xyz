import React from "react";
import { cn } from "@/lib/utils";
import { PAGE_WIDTHS, type PageWidth } from "@/lib/page-width";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Which of the page's three widths this route uses. See `@/lib/page-width`.
   * Defaults to `wide` (72rem), the widest the design system allows.
   */
  size?: PageWidth;
}

export const Container = ({ children, className, size = "wide" }: ContainerProps) => {
  return (
    <div
      className={cn(
        "relative w-full mx-auto",
        "px-4 sm:px-6 md:px-6 lg:px-8 xl:px-12",
        "py-12 sm:py-16 md:py-20",
        "min-h-[calc(100vh-5rem)]",
        className
      )}
    >
      <div className={cn("mx-auto w-full", PAGE_WIDTHS[size])}>{children}</div>
    </div>
  );
};
