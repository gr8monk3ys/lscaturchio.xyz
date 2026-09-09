"use client"

import { FileText, List } from "lucide-react"

import { cn } from "@/lib/utils"

import { formatTime, type Chapter } from "./text-to-speech-types"

interface AudioPanelsProps {
  chapters: Chapter[]
  showChapters: boolean
  showTranscript: boolean
  transcript: string
  onJumpToChapter: (chapter: Chapter) => void
  onToggleChapters: () => void
  onToggleTranscript: () => void
}

export function AudioPanels({
  chapters,
  showChapters,
  showTranscript,
  transcript,
  onJumpToChapter,
  onToggleChapters,
  onToggleTranscript,
}: AudioPanelsProps): React.ReactElement {
  return (
    <>
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleChapters}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
              showChapters
                ? "neu-pressed text-foreground text-foreground"
                : "neu-button text-muted-foreground hover:text-primary text-muted-foreground hover:text-primary"
            )}
          >
            <List className="h-3.5 w-3.5" />
            Chapters
          </button>
          <button
            type="button"
            onClick={onToggleTranscript}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
              showTranscript
                ? "neu-pressed text-foreground text-foreground"
                : "neu-button text-muted-foreground hover:text-primary text-muted-foreground hover:text-primary"
            )}
          >
            <FileText className="h-3.5 w-3.5" />
            Transcript
          </button>
        </div>
        <span className="text-xs text-muted-foreground">
          {chapters.length > 1 ? "Chapters are approximate" : ""}
        </span>
      </div>

      {showChapters && chapters.length > 1 && (
        <div className="max-h-56 overflow-y-auto rounded-2xl border border-border/60 bg-background/60 p-3">
          <div className="space-y-1">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                type="button"
                onClick={() => onJumpToChapter(chapter)}
                className="w-full rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60"
              >
                <div className="flex items-center justify-between gap-3">
                  <div
                    className={cn(
                      "min-w-0 truncate",
                      chapter.level === 3
                        ? "pl-3 text-foreground text-muted-foreground"
                        : "text-foreground text-foreground"
                    )}
                  >
                    {chapter.title}
                  </div>
                  <div className="shrink-0 font-mono text-xs text-muted-foreground">
                    {formatTime(chapter.startTime)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {showTranscript && transcript && (
        <div className="max-h-56 overflow-y-auto rounded-2xl border border-border/60 bg-background/60 p-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {transcript}
          </p>
        </div>
      )}
    </>
  )
}
