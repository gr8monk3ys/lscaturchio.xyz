"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabProps {
  text: string
  selected: boolean
  setSelected: (value: string) => void
  discount?: boolean
}

export function Tab({ text, selected, setSelected, discount = false }: TabProps) {
  return (
    <button
      onClick={() => setSelected(text)}
      className={cn(
        "relative flex h-9 items-center justify-center rounded-full px-4 text-sm font-space-mono transition duration-200 ease-in-out focus:outline-none",
        selected
          ? "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-100 shadow-neu-inset"
          : "hover:text-stone-700 dark:hover:text-stone-300"
      )}
    >
      {text}
      {discount && (
        <span className="absolute -right-2 -top-1 flex h-5 w-12 items-center justify-center rounded-full bg-emerald-600 text-xs text-white font-space-mono">
          -25%
        </span>
      )}
    </button>
  )
}
