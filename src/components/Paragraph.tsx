"use client";

import { cn } from "@/lib/utils";
import { m, useMotionPreset } from '@/lib/motion';

interface ParagraphProps {
  children: React.ReactNode;
  className?: string;
}

export function Paragraph({ children, className }: ParagraphProps) {
  const transition = useMotionPreset('slow');
  const paragraphVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition },
  };
  return (
    <m.p
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
    </m.p>
  );
}
