"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Toast } from "./toast";
import { cn } from "@/lib/utils";

// ============================================
// TOASTER CONTAINER
// ============================================

interface ToasterProps {
  /**
   * Position of the toaster on the screen
   * @default "bottom-right"
   */
  position?: "top-left" | "top-right" | "top-center" | "bottom-left" | "bottom-right" | "bottom-center";
  /**
   * Maximum number of toasts to display at once
   * @default 5
   */
  maxVisible?: number;
  /**
   * Additional className for the container
   */
  className?: string;
}

const positionStyles = {
  "top-left": "top-4 left-4 items-start",
  "top-right": "top-4 right-4 items-end",
  "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
  "bottom-left": "bottom-4 left-4 items-start",
  "bottom-right": "bottom-4 right-4 items-end",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
};

export function Toaster({
  position = "bottom-right",
  maxVisible = 5,
  className,
}: ToasterProps) {
  const { toasts, dismiss } = useToast();

  // Limit visible toasts
  const visibleToasts = toasts.slice(0, maxVisible);

  // Don't render anything if there are no toasts
  if (visibleToasts.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed z-50 flex flex-col gap-3 pointer-events-none",
        positionStyles[position],
        className
      )}
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {visibleToasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onDismiss={dismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// EXPORTS
// ============================================

export type { ToasterProps };
