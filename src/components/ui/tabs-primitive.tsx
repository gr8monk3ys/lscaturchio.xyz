"use client"

import * as React from "react"

type Orientation = "horizontal" | "vertical"

type TabsContextValue = {
  value?: string
  setValue: (value: string) => void
  orientation: Orientation
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabsContext(component: string) {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error(`${component} must be used within Tabs.Root`)
  }
  return context
}

interface RootProps extends React.ComponentPropsWithoutRef<"div"> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: Orientation
}

const Root = React.forwardRef<HTMLDivElement, RootProps>(
  ({ value: valueProp, defaultValue, onValueChange, orientation = "horizontal", ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    const isControlled = valueProp !== undefined
    const value = isControlled ? valueProp : internalValue

    const setValue = React.useCallback(
      (nextValue: string) => {
        if (!isControlled) {
          setInternalValue(nextValue)
        }
        onValueChange?.(nextValue)
      },
      [isControlled, onValueChange]
    )

    return (
      <TabsContext.Provider value={{ value, setValue, orientation }}>
        <div ref={ref} data-orientation={orientation} {...props} />
      </TabsContext.Provider>
    )
  }
)
Root.displayName = "TabsRoot"

type ListProps = React.ComponentPropsWithoutRef<"div">

const List = React.forwardRef<HTMLDivElement, ListProps>(({ ...props }, ref) => {
  const { orientation } = useTabsContext("Tabs.List")
  return <div ref={ref} role="tablist" aria-orientation={orientation} data-orientation={orientation} {...props} />
})
List.displayName = "TabsList"

interface TriggerProps extends React.ComponentPropsWithoutRef<"button"> {
  value: string
}

const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  ({ value, onClick, ...props }, ref) => {
    const { value: activeValue, setValue, orientation } = useTabsContext("Tabs.Trigger")
    const state = activeValue === value ? "active" : "inactive"

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        data-state={state}
        data-orientation={orientation}
        aria-selected={state === "active"}
        onClick={(event) => {
          setValue(value)
          onClick?.(event)
        }}
        {...props}
      />
    )
  }
)
Trigger.displayName = "TabsTrigger"

interface ContentProps extends React.ComponentPropsWithoutRef<"div"> {
  value: string
}

const Content = React.forwardRef<HTMLDivElement, ContentProps>(({ value, ...props }, ref) => {
  const { value: activeValue, orientation } = useTabsContext("Tabs.Content")
  const isActive = activeValue === value

  return (
    <div
      ref={ref}
      role="tabpanel"
      data-state={isActive ? "active" : "inactive"}
      data-orientation={orientation}
      hidden={!isActive}
      {...props}
    />
  )
})
Content.displayName = "TabsContent"

export { Root, List, Trigger, Content }
