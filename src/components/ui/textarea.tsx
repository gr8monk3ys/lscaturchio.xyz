"use client";

import * as React from "react"
import { motion } from "framer-motion";
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const textareaVariants = {
  initial: { 
    opacity: 0,
    y: 10,
    scale: 0.98
  },
  animate: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  focus: {
    scale: 1.01,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <motion.div
        variants={textareaVariants}
        initial="initial"
        animate="animate"
        whileFocus="focus"
        className="relative"
      >
        <textarea
          className={cn(
            "flex min-h-[120px] w-full rounded-xl neu-input",
            "px-4 py-3 text-base md:text-lg",
            "ring-offset-background placeholder:text-muted-foreground/60",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all duration-200",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {isFocused && (
          <motion.div
            layoutId="textarea-focus"
            className="absolute inset-0 -z-10 rounded-md bg-primary/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
