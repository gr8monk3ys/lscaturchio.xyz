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
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
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
        "text-base md:text-lg lg:text-xl leading-relaxed text-muted-foreground",
        "selection:bg-primary/20 selection:text-primary",
        className
      )}
    >
      {children}
    </motion.p>
  );
}
