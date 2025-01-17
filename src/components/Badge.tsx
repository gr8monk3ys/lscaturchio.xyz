"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "destructive";
}

const badgeVariants = {
  initial: { 
    opacity: 0,
    scale: 0.9
  },
  animate: { 
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

export function Badge({ 
  children, 
  className,
  variant = "default" 
}: BadgeProps) {
  const variantStyles = {
    default: "bg-primary/10 text-primary hover:bg-primary/20",
    outline: "border border-primary/20 text-primary hover:bg-primary/10",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20"
  };

  return (
    <motion.span
      variants={badgeVariants}
      initial="initial"
      whileInView="animate"
      whileHover="hover"
      viewport={{ once: true }}
      className={cn(
        "inline-flex items-center rounded-full px-4 py-1.5",
        "text-sm md:text-base font-medium",
        "transition-colors duration-200",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </motion.span>
  );
}
