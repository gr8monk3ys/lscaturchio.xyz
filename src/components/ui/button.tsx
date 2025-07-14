"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "neu-button bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-100",
        destructive:
          "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 shadow-[3px_3px_6px_rgba(0,0,0,0.1),-3px_-3px_6px_rgba(255,255,255,0.7)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(255,255,255,0.04)] hover:shadow-[1px_1px_2px_rgba(0,0,0,0.1),-1px_-1px_2px_rgba(255,255,255,0.7)]",
        outline:
          "bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-100 shadow-[3px_3px_6px_rgba(0,0,0,0.1),-3px_-3px_6px_rgba(255,255,255,0.7)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(255,255,255,0.04)] border border-stone-200 dark:border-stone-700",
        secondary:
          "bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-100 shadow-[3px_3px_6px_rgba(0,0,0,0.1),-3px_-3px_6px_rgba(255,255,255,0.7)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(255,255,255,0.04)]",
        ghost: "hover:bg-stone-100 dark:hover:bg-stone-700 hover:shadow-[3px_3px_6px_rgba(0,0,0,0.1),-3px_-3px_6px_rgba(255,255,255,0.7)] dark:hover:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(255,255,255,0.04)]",
        link: "text-primary underline-offset-4 hover:underline",
        neumorphic: "neu-button",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
