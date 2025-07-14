import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-0 px-2.5 py-0.5 text-xs font-space-mono font-semibold transition-all focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200 shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)] hover:shadow-[0.5px_0.5px_1px_rgba(0,0,0,0.05),-0.5px_-0.5px_1px_rgba(255,255,255,0.6)] dark:hover:shadow-[0.5px_0.5px_1px_rgba(0,0,0,0.2),-0.25px_-0.25px_0.5px_rgba(255,255,255,0.03)] hover:translate-y-[-1px]",
        secondary:
          "bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)] hover:shadow-[0.5px_0.5px_1px_rgba(0,0,0,0.05),-0.5px_-0.5px_1px_rgba(255,255,255,0.6)] dark:hover:shadow-[0.5px_0.5px_1px_rgba(0,0,0,0.2),-0.25px_-0.25px_0.5px_rgba(255,255,255,0.03)] hover:translate-y-[-1px]",
        destructive:
          "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)] hover:shadow-[0.5px_0.5px_1px_rgba(0,0,0,0.05),-0.5px_-0.5px_1px_rgba(255,255,255,0.6)] dark:hover:shadow-[0.5px_0.5px_1px_rgba(0,0,0,0.2),-0.25px_-0.25px_0.5px_rgba(255,255,255,0.03)] hover:translate-y-[-1px]",
        outline: "bg-transparent border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 hover:text-stone-800 dark:hover:bg-stone-800 dark:hover:text-stone-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
