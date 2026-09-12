'use client'

import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

type TriggerProps = {
  className?: string
  onOpen: () => void
}

export function CommandPaletteTrigger({ className, onOpen }: TriggerProps): React.ReactElement {
  return (
    <button
      type="button"
      /* The hook reads this to hand focus back when Escape closes the palette
         and there was no opener to remember — Cmd+K from `<body>`. A data
         attribute rather than a ref because the trigger renders in two places
         (desktop header, mobile bar) and only one is ever visible. */
      data-command-palette-trigger
      onClick={onOpen}
      className={cn(
        'flex items-center gap-2 rounded-lg border border-border/50 bg-muted/50 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
        className
      )}
    >
      <Search aria-hidden="true" className="h-4 w-4" />
      <span className="sr-only">Search</span>
      <span aria-hidden="true" className="hidden sm:inline">Search</span>
      <kbd
        aria-hidden="true"
        className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[0.72rem] font-medium"
      >
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  )
}
