'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Search, X, Sparkles, Loader2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CommandCategory, CommandGroups, CommandItem } from './types'

function getCategoryLabel(category: CommandCategory): string {
  switch (category) {
    case 'navigation':
      return 'Pages'
    case 'action':
      return 'Actions'
    case 'blog':
      return 'Blog Posts'
    default:
      return category
  }
}

const LISTBOX_ID = 'command-palette-listbox'

type DialogProps = {
  commandCount: number
  groupedCommands: CommandGroups
  inputRef: React.RefObject<HTMLInputElement | null>
  isSearching: boolean
  listRef: React.RefObject<HTMLDivElement | null>
  onChangeQuery: (value: string) => void
  onClearQuery: () => void
  onClose: () => void
  onHoverIndex: (index: number) => void
  onSelectCommand: (command: CommandItem) => void
  query: string
  selectedIndex: number
}

export function CommandPaletteDialog({
  commandCount,
  groupedCommands,
  inputRef,
  isSearching,
  listRef,
  onChangeQuery,
  onClearQuery,
  onClose,
  onHoverIndex,
  onSelectCommand,
  query,
  selectedIndex,
}: DialogProps): React.ReactElement {
  let globalIndex = -1
  const activeOptionId =
    commandCount > 0 ? `${LISTBOX_ID}-option-${selectedIndex}` : undefined

  /**
   * Portalled to `document.body`, and it has to be.
   *
   * This dialog renders inside the header, and `.site-header` carries
   * `backdrop-filter: blur(12px)` — which makes it the containing block for
   * `position: fixed` descendants. So `inset-0` resolved to the header's 81px
   * box instead of the viewport: the scrim was measured at 1429x80 and covered
   * the nav bar only, and `top-[20%]` of 81px put the panel at ~16px, flush
   * under the top edge. A design review reported the palette "sits flush at
   * y=8 over the fixed nav" and that the masthead "reads through around it",
   * and this is why — the overlay was trapped in the bar that opened it.
   *
   * A scrim that covers 80px of a 900px viewport is not a scrim, so this is
   * the other half of the Scrim Rule: the colour was wrong *and* the
   * containing block was.
   */
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  useEffect(() => setPortalTarget(document.body), [])
  if (!portalTarget) return <></>

  return createPortal(
    <>
      {/* Ink at 25%, the value `.ask-scrim` already uses — not paper at 80%.
          This was `bg-background/80`, which is the page's own colour laid over
          the page, so it lightened instead of separating and the masthead read
          straight through it. The palette has no shadow (correctly: the Two
          Sheets Rule spends both of its elevated objects elsewhere), which left
          it with nothing at all to say it was a layer. A scrim is not a shadow,
          so the Flat Paper Rule survives — DESIGN.md now names it as the third
          sanctioned separation mechanism. */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close search"
        className="fixed inset-0 z-50 bg-foreground/25 backdrop-blur-xs"
      />

      <div
        className="fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2 px-4"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search and navigate"
          className="overflow-hidden rounded-xl border border-border bg-popover"
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => onChangeQuery(e.target.value)}
              placeholder="Search pages, blogs, or actions..."
              aria-label="Search pages, blogs, or actions"
              role="combobox"
              aria-expanded
              aria-autocomplete="list"
              aria-controls={LISTBOX_ID}
              aria-activedescendant={activeOptionId}
              className="flex-1 bg-transparent text-base placeholder:text-muted-foreground"
            />
            {isSearching && <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />}
            {query && !isSearching && (
              <button
                type="button"
                onClick={onClearQuery}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-[0.72rem] font-medium text-muted-foreground">
              ESC
            </kbd>
          </div>

          <div
            ref={listRef}
            id={LISTBOX_ID}
            data-lenis-prevent
            className="max-h-[60vh] overflow-y-auto p-2"
            role="listbox"
            aria-label="Search results"
          >
            {commandCount === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No results found for &quot;{query}&quot;</p>
                <p className="text-sm mt-1">Try searching for something else</p>
              </div>
            ) : (
              (Object.entries(groupedCommands) as [CommandCategory, CommandItem[]][]).map(
                ([category, commands]) => {
                  if (commands.length === 0) return null

                  return (
                    <div key={category} className="mb-2">
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {getCategoryLabel(category)}
                      </div>
                      {commands.map((command) => {
                        globalIndex += 1
                        const isSelected = globalIndex === selectedIndex

                        return (
                          <button
                            key={command.id}
                            type="button"
                            id={`${LISTBOX_ID}-option-${globalIndex}`}
                            tabIndex={-1}
                            data-index={globalIndex}
                            onClick={() => onSelectCommand(command)}
                            onMouseEnter={() => onHoverIndex(globalIndex)}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                              isSelected
                                ? 'bg-primary/10 text-foreground'
                                : 'text-muted-foreground hover:bg-muted'
                            )}
                            role="option"
                            aria-selected={isSelected}
                          >
                            <div
                              className={cn(
                                'shrink-0 p-1.5 rounded-md',
                                isSelected ? 'bg-primary/20' : 'bg-muted'
                              )}
                            >
                              {command.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-foreground truncate">{command.title}</div>
                              {command.description && (
                                <div className="text-sm text-muted-foreground truncate">
                                  {command.description}
                                </div>
                              )}
                            </div>
                            {isSelected && <ArrowRight className="h-4 w-4 shrink-0 text-primary" />}
                          </button>
                        )
                      })}
                    </div>
                  )
                }
              )
            )}
          </div>

          <div className="px-4 py-2 border-t border-border bg-muted/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded border bg-muted font-mono">↑↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded border bg-muted font-mono">↵</kbd>
                  select
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border bg-muted font-mono">esc</kbd>
                close
              </span>
            </div>
          </div>
        </div>
      </div>
    </>,
    portalTarget
  )
}
