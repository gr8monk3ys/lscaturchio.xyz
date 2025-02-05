import { cn } from "@/lib/utils";
import React from "react";

interface ParagraphProps {
  children: React.ReactNode;
  className?: string;
}

export const Paragraph = ({ children, className }: ParagraphProps) => {
  return (
    <p className={cn("text-muted-foreground leading-7", className)}>
      {children}
    </p>
  );
};
