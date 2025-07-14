import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border-0 bg-stone-50 dark:bg-stone-800 px-3 py-2 text-sm text-stone-700 dark:text-stone-300 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-stone-700 dark:file:text-stone-300 placeholder:text-stone-500 dark:placeholder:text-stone-400 shadow-[1px_1px_2px_rgba(0,0,0,0.05),_-1px_-1px_2px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_2px_rgba(0,0,0,0.2),_-0.5px_-0.5px_1px_rgba(255,255,255,0.03)] focus-visible:outline-none focus-visible:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05),_inset_-1px_-1px_2px_rgba(255,255,255,0.7)] dark:focus-visible:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),_inset_-0.5px_-0.5px_1px_rgba(255,255,255,0.04)] transition-all disabled:cursor-not-allowed disabled:opacity-50 font-space-mono",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
