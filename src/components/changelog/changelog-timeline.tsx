"use client"

import { CHANGELOG } from '@/constants/changelog'

/**
 * A wall label per change type, in one ink.
 *
 * This used to be four icons on four tinted backgrounds — green, blue, orange
 * and purple, none of which are in the palette — plus a Sparkles glyph on the
 * highlight row. That was a second colour system carrying information the word
 * already carries.
 */
const CHANGE_LABELS: Record<string, string> = {
  added: 'Added',
  changed: 'Changed',
  fixed: 'Fixed',
  highlight: 'Highlight',
}

export function ChangelogTimeline() {
  return (
    <div className="space-y-12">
      {/* Static rows: an entrance animation here can be missed under
          `LazyMotion strict`, leaving the whole changelog invisible. */}
      {CHANGELOG.map((entry, index) => (
        <div
          key={entry.version}
          id={`v-${entry.version.replace(/\./g, "-")}`}
          className="relative"
        >
          {/* Timeline line */}
          {index < CHANGELOG.length - 1 && (
            /* 1px sand, not 2px grey. The Sand Hairline Rule says rules are
               1px Hairline, "never thicker" and never neutral grey. */
            <div className="absolute left-[15px] top-12 bottom-0 w-px bg-border" />
          )}

          {/* Version header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold z-10">
              {entry.version.split('.')[0]}
            </div>
            <div>
              <h3 className="text-2xl font-bold">Version {entry.version}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(entry.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Changes list */}
          <div className="ml-12 border-t border-border">
            {entry.changes.map((change, changeIndex) => {
              const label = CHANGE_LABELS[change.type] ?? change.type

              return (
                <div
                  key={changeIndex}
                  className="grid grid-cols-[6rem_1fr] items-baseline gap-x-4 border-b border-border py-2.5 last:border-b-0"
                >
                  <span className="label-mono">{label}</span>
                  <p className={`text-sm ${change.type === 'highlight' ? 'font-medium text-foreground' : ''}`}>
                    {change.text}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
