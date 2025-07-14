// Rule: TypeScript Usage - Use TypeScript for all code with explicit return types
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Rule: TypeScript Usage - Prefer interfaces over types
interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg" | "xl" | "full";
  as?: keyof JSX.IntrinsicElements;
}

// Rule: UI and Styling - Use Tailwind CSS for styling
export function Container({
  children,
  className,
  size = "default",
  as: Component = "div",
}: ContainerProps): JSX.Element {
  return (
    <Component
      className={cn(
        "mx-auto w-full px-4 sm:px-6 md:px-8",
        {
          "max-w-screen-sm": size === "sm",
          "max-w-screen-lg": size === "default",
          "max-w-screen-xl": size === "lg",
          "max-w-screen-2xl": size === "xl",
          "max-w-none": size === "full",
        },
        className
      )}
    >
      {children}
    </Component>
  );
}
