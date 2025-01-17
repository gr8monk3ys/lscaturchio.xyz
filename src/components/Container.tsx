import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const Container = ({ children, className }: ContainerProps) => {
  return (
    <main 
      className={cn(
        "relative w-full mx-auto",
        "px-4 sm:px-6 md:px-8 lg:px-12",
        "py-12 sm:py-16 md:py-20",
        "max-w-[90rem]",
        "min-h-[calc(100vh-4rem)]",
        className
      )}
    >
      <div className="max-w-4xl mx-auto">
        {children}
      </div>
      
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
      </div>
    </main>
  );
};
