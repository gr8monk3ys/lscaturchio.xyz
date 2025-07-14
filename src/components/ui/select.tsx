// Rule: UI and Styling - Use Tailwind CSS for styling
"use client"

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

// Rule: TypeScript Usage - Define strict types with interfaces
type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options?: { value: string; label: string }[];
  placeholder?: string;
  onValueChange?: (value: string) => void;
  value?: string;
}

// Rule: TypeScript Usage - Implement proper type handling
// Native select implementation as a fallback until Radix UI dependencies are installed
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options = [], placeholder, onValueChange, value, ...props }, ref) => {
    // Handle the Radix UI onValueChange API
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      // Call the onValueChange prop if provided
      if (onValueChange) {
        onValueChange(e.target.value);
      }
      
      // Call the original onChange if provided
      if (props.onChange) {
        props.onChange(e);
      }
    };
    
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "flex h-9 w-full appearance-none items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          value={value}
          onChange={handleChange}
          {...props}
        >
          {placeholder && (
            <option value="" disabled selected hidden>
              {placeholder}
            </option>
          )}
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 opacity-50" />
      </div>
    )
  }
)
Select.displayName = "Select"

// Rule: TypeScript Usage - Use proper prop types
// Facade components to maintain API compatibility with original Radix Select
type CommonSelectProps = {
  children?: React.ReactNode; // Make children optional
  [key: string]: any; // Allow any additional props
}

// Facade components that properly pass through all props
export const SelectTrigger = ({ children, ...props }: CommonSelectProps) => {
  return <div {...props}>{children}</div>
}

export const SelectValue = ({ children, ...props }: CommonSelectProps) => {
  return <span {...props}>{children}</span>
}

export const SelectContent = ({ children, ...props }: CommonSelectProps) => {
  return <div {...props}>{children}</div>
}

export const SelectItem = ({ children, value, ...props }: CommonSelectProps & { value: string }) => {
  return <option value={value} {...props}>{children}</option>
}

export const SelectGroup = ({ children, ...props }: CommonSelectProps) => {
  return <optgroup {...props}>{children}</optgroup>
}

export const SelectLabel = ({ children, ...props }: CommonSelectProps) => {
  return <span {...props}>{children}</span>
}

export const SelectSeparator = (props: Record<string, any>) => {
  return <hr {...props} className="my-1 border-t border-gray-200" />
}
