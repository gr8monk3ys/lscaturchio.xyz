"use client"

import { type MouseEvent, type KeyboardEvent, type RefObject } from "react"
import {
  Headphones,
  Loader2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import {
  formatTime,
  SKIP_SECONDS,
  type PlaybackSpeed,
} from "./text-to-speech-types"

export { AudioPanels } from "./audio-panels"

interface ListenButtonProps {
  label: string
  icon: "play" | "pause" | "headphones"
  onClick: () => void
}

export function ListenButton({ label, icon, onClick }: ListenButtonProps): React.ReactElement {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="flex items-center gap-2"
      aria-label={label}
    >
      {icon === "pause" && <Pause className="h-4 w-4" />}
      {icon === "play" && <Play className="h-4 w-4" />}
      {icon === "headphones" && <Headphones className="h-4 w-4" />}
      {label}
    </Button>
  )
}

interface ProgressBarProps {
  currentTime: number
  duration: number
  progress: number
  progressRef: RefObject<HTMLDivElement | null>
  onProgressClick: (event: MouseEvent<HTMLDivElement>) => void
  onProgressKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
}

export function ProgressBar({
  currentTime,
  duration,
  progress,
  progressRef,
  onProgressClick,
  onProgressKeyDown,
}: ProgressBarProps): React.ReactElement {
  return (
    <div className="space-y-1">
      <div
        ref={progressRef}
        onClick={onProgressClick}
        onKeyDown={onProgressKeyDown}
        role="slider"
        tabIndex={0}
        aria-label="Audio progress"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
        className="group relative h-2 w-full cursor-pointer rounded-full bg-muted"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100"
          style={{ left: `calc(${progress}% - 8px)` }}
        />
      </div>
      <div className="flex justify-between text-xs tabular-nums text-muted-foreground">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  )
}

interface TransportControlsProps {
  isLoading: boolean
  isMuted: boolean
  isPlaying: boolean
  speed: PlaybackSpeed
  onChangeSpeed: () => void
  onSkipBackward: () => void
  onSkipForward: () => void
  onToggleMute: () => void
  onTogglePlay: () => void
}

export function TransportControls({
  isLoading,
  isMuted,
  isPlaying,
  speed,
  onChangeSpeed,
  onSkipBackward,
  onSkipForward,
  onToggleMute,
  onTogglePlay,
}: TransportControlsProps): React.ReactElement {
  function renderPlayIcon(): React.ReactElement {
    if (isLoading) return <Loader2 className="h-5 w-5 animate-spin" />
    if (isPlaying) return <Pause className="h-5 w-5" />
    return <Play className="h-5 w-5" />
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        <button
          onClick={onSkipBackward}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/6 hover:text-primary"
          aria-label={`Skip back ${SKIP_SECONDS} seconds`}
          title={`-${SKIP_SECONDS}s`}
        >
          <SkipBack className="h-4 w-4" />
        </button>

        <button
          onClick={onTogglePlay}
          className={cn(
            "rounded-xl p-3 transition-colors",
            "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {renderPlayIcon()}
        </button>

        <button
          onClick={onSkipForward}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/6 hover:text-primary"
          aria-label={`Skip forward ${SKIP_SECONDS} seconds`}
          title={`+${SKIP_SECONDS}s`}
        >
          <SkipForward className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onChangeSpeed}
          className="min-w-12 rounded-lg px-2 py-1 text-center font-mono text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/6 hover:text-primary"
          aria-label={`Playback speed: ${speed}x. Click to change.`}
          title="Change playback speed"
        >
          {speed}x
        </button>

        <button
          onClick={onToggleMute}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-primary/6 hover:text-primary"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
