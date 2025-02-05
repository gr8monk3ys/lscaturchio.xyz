"use client";

import { motion } from "framer-motion";

interface SectionHeadingProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionHeading({ children, className = "" }: SectionHeadingProps) {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`text-3xl font-bold tracking-tight text-stone-600  sm:text-4xl ${className}`}
    >
      {children}
    </motion.h2>
  );
}
