"use client";

import * as React from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { Toast as ToastType, ToastAction } from "@/hooks/use-toast";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

// ============================================
// ANIMATION VARIANTS
// ============================================

const toastVariants: Variants = {
  initial: {
    opacity: 0,
    x: 50,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    x: 50,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

// ============================================
// TOAST STYLING
// ============================================

const toastStyles = cva(
  "relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-lg p-4 neu-card transition-all",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        success: "bg-background text-foreground border-l-4 border-l-green-500",
        error: "bg-background text-foreground border-l-4 border-l-destructive",
        warning: "bg-background text-foreground border-l-4 border-l-yellow-500",
        info: "bg-background text-foreground border-l-4 border-l-blue-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// ============================================
// ICON MAPPING
// ============================================

const iconMap = {
  default: null,
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const iconColorMap = {
  default: "text-foreground",
  success: "text-green-500",
  error: "text-destructive",
  warning: "text-yellow-500",
  info: "text-blue-500",
};

// ============================================
// TOAST COMPONENT
// ============================================

interface ToastProps extends VariantProps<typeof toastStyles> {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss, variant }: ToastProps) {
  const toastVariant = variant ?? toast.variant ?? "default";
  const Icon = iconMap[toastVariant];

  return (
    <motion.div
      layout
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(toastStyles({ variant: toastVariant }))}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      {/* Icon */}
      {Icon && (
        <div className={cn("flex-shrink-0 mt-0.5", iconColorMap[toastVariant])}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{toast.title}</p>
        {toast.description && (
          <p className="mt-1 text-sm text-muted-foreground">{toast.description}</p>
        )}

        {/* Action Button */}
        {toast.action && (
          <ToastActionButton action={toast.action} />
        )}
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className={cn(
          "flex-shrink-0 rounded-md p-1.5 transition-all",
          "text-muted-foreground hover:text-foreground",
          "neu-button focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        )}
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

// ============================================
// TOAST ACTION BUTTON
// ============================================

interface ToastActionButtonProps {
  action: ToastAction;
}

function ToastActionButton({ action }: ToastActionButtonProps) {
  return (
    <button
      type="button"
      onClick={action.onClick}
      className={cn(
        "mt-2 inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium",
        "bg-primary text-primary-foreground",
        "neu-button focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "transition-all hover:bg-primary/90"
      )}
    >
      {action.label}
    </button>
  );
}

// ============================================
// EXPORTS
// ============================================

export { toastStyles };
export type { ToastProps };
