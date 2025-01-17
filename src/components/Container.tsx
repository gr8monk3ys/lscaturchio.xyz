import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "small" | "large";
}

export const Container = ({ children, className, size = "default" }: ContainerProps) => {
  return (
    <main 
      className={cn(
        "relative w-full mx-auto",
        "px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24",
        "py-12 sm:py-16 md:py-20",
        "min-h-[calc(100vh-4rem)]",
        className
      )}
    >
      <div 
        className={cn(
          "mx-auto w-full",
          size === "small" && "max-w-4xl",
          size === "default" && "max-w-7xl",
          size === "large" && "max-w-[100rem]"
        )}
      >
        {children}
      </div>
      
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
      </div>
    </main>
  );
};
