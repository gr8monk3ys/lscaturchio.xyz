import { cn } from "@/lib/utils";
import React from "react";

interface HeadingProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const Heading = ({ 
  children, 
  className,
  as: Component = "h2" 
}: HeadingProps) => {
  return (
    <Component className={cn("font-bold tracking-tight", className)}>
      {children}
    </Component>
  );
};
