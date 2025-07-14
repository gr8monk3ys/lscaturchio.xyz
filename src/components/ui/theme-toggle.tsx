// Rule: TypeScript Usage - Use TypeScript for all code with explicit return types
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ThemeToggleProps {
  className?: string;
  variant?: "default" | "slim" | "icon-only";
  showTooltip?: boolean;
  align?: "start" | "center" | "end";
}

export function ThemeToggle({
  className,
  variant = "default",
  showTooltip = true,
  align = "end",
}: ThemeToggleProps): JSX.Element {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Animation variants for icon transitions
  const iconVariants = {
    initial: { opacity: 0, scale: 0.8, rotate: -30 },
    animate: { opacity: 1, scale: 1, rotate: 0 },
    exit: { opacity: 0, scale: 0.8, rotate: 30 }
  };

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size={variant === "slim" ? "sm" : "icon"}
        className={cn(
          "w-9 px-0",
          variant === "icon-only" && "w-9 h-9 rounded-full",
          variant === "slim" && "h-8",
          className
        )}
      />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={variant === "slim" ? "sm" : "icon"}
          className={cn(
            "w-9 px-0",
            variant === "icon-only" && "w-9 h-9 rounded-full",
            variant === "slim" && "h-8",
            className
          )}
          aria-label="Toggle theme"
          data-tooltip={showTooltip ? "Toggle theme" : null}
          data-tooltip-delay={400}
        >
          <AnimatePresence mode="wait" initial={false}>
            {theme === "light" ? (
              <motion.div
                key="light"
                variants={iconVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
              >
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              </motion.div>
            ) : theme === "dark" ? (
              <motion.div
                key="dark"
                variants={iconVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
              >
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              </motion.div>
            ) : (
              <motion.div
                key="system"
                variants={iconVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
              >
                <Monitor className="h-[1.2rem] w-[1.2rem]" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {variant !== "icon-only" && (
            <span className={cn(
              "ml-2",
              variant === "default" ? "sr-only" : ""
            )}>
              {theme === "light" 
                ? "Light" 
                : theme === "dark" 
                  ? "Dark" 
                  : "System"}
            </span>
          )}
          
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
