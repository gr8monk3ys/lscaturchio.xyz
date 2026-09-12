'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Search, X, Loader2, ArrowRight } from 'lucide-react'
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
  searchFailed: boolean
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
  searchFailed,
  selectedIndex,
}: DialogProps): React.ReactElement {
  let globalIndex = -1
  const activeOptionId =
    commandCount > 0 ? `${LISTBOX_ID}-option-${selectedIndex}` : undefined

  /**
   * Keep Tab inside the dialog.
   *
   * It declares `aria-modal="true"` and had no trap, so Tab from the input ran
   * Clear search -> <body> -> the skip link -> the nav links behind the scrim:
   * focus landing on content that is visually obscured and semantically inert.
   * `aria-modal` is a promise to assistive tech that the rest of the page is
   * unavailable, and the tab order has to keep it.
   */
  const panelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [])

  /**
   * Portalled to `document.body`, and it has to be.
   *
   * This dialog renders inside the header, and `.site-header` carries
   * `backdrop-filter: blur(12px)` — which makes it the containing block for
   * `position: fixed` descendants. So `inset-0` resolved to the header's 81px
   * box instead of the viewport: the scrim measured 1429x80 and covered the
   * nav bar only, and `top-[20%]` of 81px put the panel at ~16px, flush under
   * the top edge. The overlay was trapped in the bar that opened it.
   *
   * Straight to `document.body`, with no `portalTarget` state in between.
   * That state is what broke keyboard opening: it started null, so the first
   * commit rendered nothing, and `openPalette`'s single
   * `requestAnimationFrame` fired before the input existed — so
   * `inputRef.current?.focus()` no-oped and every keystroke after Cmd+K went
   * to `<body>`. The dialog is only ever rendered when `isOpen`, which is
   * never true on the server, so `document` is always there and the state
   * bought nothing but a wasted render and that bug.
   */
  return createPortal(
    <>
      {/* The scrim: ink at 25%, and a div.
          The colour was `bg-background/80` — the page's own colour laid over
          the page, so it lightened instead of separating and the masthead read
          straight through it. It is now the ink-at-25% that `.ask-scrim`
          already used, which DESIGN.md names as the Scrim Rule: the palette
          correctly carries no shadow (the Two Sheets Rule spends both of its
          elevated objects elsewhere), so a scrim is the only separation
          mechanism left to it, and a scrim is not elevation.
          The element was a full-viewport `<button aria-label="Close search">`,
          which made the backdrop a tab stop announced as a button — a keyboard
          user's first Tab inside the dialog landed on it. A scrim is
          decoration with a convenience click; Escape is the keyboard
          affordance, and it already works and restores focus to the trigger. */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-50 bg-foreground/25 backdrop-blur-xs"
      />

      <div
        ref={panelRef}
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
            {/* `autoFocus`: mounting and focusing in one step.
                Focus was driven from `openPalette` through a single
                `requestAnimationFrame`, which is a race against this element
                existing — and the portal lost it. Letting the element that
                needs focus ask for it removes the timing question entirely. */}
            <input
              ref={inputRef}
              autoFocus
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
              /* Two states, two messages. A failed request used to render the
                 "no results" copy, so an unavailable search was indistinguishable
                 from an empty one — and the sparkle glyph read as magic
                 happening at the moment nothing had. */
              <div className="py-8 text-center text-muted-foreground">
                {searchFailed ? (
                  <>
                    <p className="text-foreground">Search is unavailable right now.</p>
                    <p className="mt-1 text-sm">
                      It may be rate limited. Try again in a moment, or browse from the
                      footer.
                    </p>
                  </>
                ) : (
                  <>
                    <p>No results found for &quot;{query}&quot;</p>
                    <p className="text-sm mt-1">Try searching for something else</p>
                  </>
                )}
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
    document.body
  )
}
