"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ParagraphProps {
  children: React.ReactNode;
  className?: string;
}

const paragraphVariants = {
  initial: { 
    opacity: 0,
    y: 20
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export function Paragraph({ children, className }: ParagraphProps) {
  return (
    <motion.p
      variants={paragraphVariants}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-20px" }}
      className={cn(
        "text-base md:text-lg lg:text-xl leading-relaxed font-space-mono text-stone-600 dark:text-stone-400",
        "selection:bg-stone-200 dark:selection:bg-stone-700 selection:text-stone-800 dark:selection:text-stone-200",
        className
      )}
    >
      {children}
    </motion.p>
  );
}
