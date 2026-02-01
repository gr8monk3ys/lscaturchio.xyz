"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

// ============================================
// Tab List Variants (Container for triggers)
// ============================================
const tabsListVariants = cva(
  "inline-flex items-center justify-center gap-1 p-1 text-muted-foreground",
  {
    variants: {
      variant: {
        default: "neu-flat-sm rounded-xl",
        pills: "bg-transparent gap-2",
        underline: "bg-transparent border-b border-border gap-0 p-0 rounded-none",
      },
      orientation: {
        horizontal: "flex-row w-full",
        vertical: "flex-col h-full w-auto items-stretch",
      },
    },
    defaultVariants: {
      variant: "default",
      orientation: "horizontal",
    },
  }
)

// ============================================
// Tab Trigger Variants (Individual tab buttons)
// ============================================
const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: [
          "rounded-lg",
          "data-[state=active]:neu-pressed-sm data-[state=active]:text-foreground",
          "data-[state=inactive]:hover:text-foreground/80",
        ],
        pills: [
          "rounded-xl",
          "data-[state=active]:neu-button data-[state=active]:text-foreground",
          "data-[state=inactive]:hover:neu-flat-sm data-[state=inactive]:hover:text-foreground/80",
        ],
        underline: [
          "rounded-none border-b-2 border-transparent",
          "data-[state=active]:border-primary data-[state=active]:text-foreground",
          "data-[state=inactive]:hover:text-foreground/80 data-[state=inactive]:hover:border-muted-foreground/30",
        ],
      },
      orientation: {
        horizontal: "",
        vertical: "w-full justify-start",
      },
    },
    defaultVariants: {
      variant: "default",
      orientation: "horizontal",
    },
  }
)

// ============================================
// Types
// ============================================
type TabsContextValue = {
  variant: "default" | "pills" | "underline"
  orientation: "horizontal" | "vertical"
}

const TabsContext = React.createContext<TabsContextValue>({
  variant: "default",
  orientation: "horizontal",
})

// ============================================
// Tabs Root Component
// ============================================
interface TabsProps
  extends Omit<React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>, "orientation"> {
  /** Visual variant of the tabs */
  variant?: "default" | "pills" | "underline"
  /** Orientation of the tabs */
  orientation?: "horizontal" | "vertical"
}

const Tabs = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Root>,
  TabsProps
>(({ className, variant = "default", orientation = "horizontal", ...props }, ref) => (
  <TabsContext.Provider value={{ variant: variant ?? "default", orientation: orientation ?? "horizontal" }}>
    <TabsPrimitive.Root
      ref={ref}
      orientation={orientation ?? "horizontal"}
      className={cn(
        "w-full",
        orientation === "vertical" && "flex flex-row gap-4",
        className
      )}
      {...props}
    />
  </TabsContext.Provider>
))
Tabs.displayName = TabsPrimitive.Root.displayName

// ============================================
// TabsList Component
// ============================================
interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant: variantProp, orientation: orientationProp, ...props }, ref) => {
  const context = React.useContext(TabsContext)
  const variant = variantProp ?? context.variant
  const orientation = orientationProp ?? context.orientation

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(tabsListVariants({ variant, orientation, className }))}
      {...props}
    />
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

// ============================================
// TabsTrigger Component (with optional animation)
// ============================================
interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {
  /** Enable Framer Motion animation on tab change */
  animated?: boolean
}

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant: variantProp, orientation: orientationProp, animated = false, ...props }, ref) => {
  const context = React.useContext(TabsContext)
  const variant = variantProp ?? context.variant
  const orientation = orientationProp ?? context.orientation

  const trigger = (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(tabsTriggerVariants({ variant, orientation, className }))}
      {...props}
    />
  )

  if (animated) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
      >
        {trigger}
      </motion.div>
    )
  }

  return trigger
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

// ============================================
// TabsContent Component
// ============================================
interface TabsContentProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {
  /** Enable Framer Motion fade animation on content change */
  animated?: boolean
}

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(({ className, animated = false, ...props }, ref) => {
  const content = (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  )

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {content}
      </motion.div>
    )
  }

  return content
})
TabsContent.displayName = TabsPrimitive.Content.displayName

// ============================================
// Animated Tab Indicator (for underline variant)
// ============================================
interface TabIndicatorProps {
  /** The currently active tab value */
  activeTab: string
  /** Array of tab values in order */
  tabs: string[]
  /** Width of each tab (for calculation) */
  tabWidth?: number
  className?: string
}

const TabIndicator = React.forwardRef<HTMLDivElement, TabIndicatorProps>(
  ({ activeTab, tabs, tabWidth = 100, className }, ref) => {
    const activeIndex = tabs.indexOf(activeTab)

    return (
      <motion.div
        ref={ref}
        className={cn(
          "absolute bottom-0 h-0.5 bg-primary rounded-full",
          className
        )}
        initial={false}
        animate={{
          x: activeIndex * tabWidth,
          width: tabWidth,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      />
    )
  }
)
TabIndicator.displayName = "TabIndicator"

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabIndicator,
  tabsListVariants,
  tabsTriggerVariants,
}

export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps, TabIndicatorProps }
