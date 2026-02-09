"use client"

import { useState, useEffect, useRef, useCallback, RefObject } from "react"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Headphones,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AudioPlayerProps {
  slug: string
  contentRef: RefObject<HTMLDivElement | null>
}

type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2

const SPEED_OPTIONS: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
const SKIP_SECONDS = 15

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function TextToSpeech({ slug, contentRef }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const [hasAudio, setHasAudio] = useState<boolean | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speed, setSpeed] = useState<PlaybackSpeed>(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  // Fallback to Web Speech API
  const [useFallback, setUseFallback] = useState(false)
  const [fallbackPlaying, setFallbackPlaying] = useState(false)
  const [fallbackSupported, setFallbackSupported] = useState(false)

  // Check if pre-generated audio exists
  useEffect(() => {
    const audioUrl = `/audio/${slug}.mp3`
    const audio = new Audio()

    const handleCanPlay = (): void => {
      setHasAudio(true)
      audioRef.current = audio
    }

    const handleError = (): void => {
      setHasAudio(false)
      setUseFallback(true)
      audio.removeEventListener("canplaythrough", handleCanPlay)
      audio.removeEventListener("error", handleError)
    }

    audio.addEventListener("canplaythrough", handleCanPlay)
    audio.addEventListener("error", handleError)
    audio.preload = "metadata"
    audio.src = audioUrl

    // Check Web Speech API support for fallback
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setFallbackSupported(true)
    }

    return () => {
      audio.removeEventListener("canplaythrough", handleCanPlay)
      audio.removeEventListener("error", handleError)
      audio.pause()
      audio.src = ""
    }
  }, [slug])

  // Audio element event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = (): void => setCurrentTime(audio.currentTime)
    const onDurationChange = (): void => setDuration(audio.duration)
    const onEnded = (): void => {
      setIsPlaying(false)
      setCurrentTime(0)
    }
    const onWaiting = (): void => setIsLoading(true)
    const onCanPlay = (): void => setIsLoading(false)
    const onPlay = (): void => {
      setIsPlaying(true)
      setIsLoading(false)
    }
    const onPause = (): void => setIsPlaying(false)

    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("durationchange", onDurationChange)
    audio.addEventListener("ended", onEnded)
    audio.addEventListener("waiting", onWaiting)
    audio.addEventListener("canplay", onCanPlay)
    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onPause)

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("durationchange", onDurationChange)
      audio.removeEventListener("ended", onEnded)
      audio.removeEventListener("waiting", onWaiting)
      audio.removeEventListener("canplay", onCanPlay)
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
    }
  }, [hasAudio])

  const togglePlay = useCallback((): void => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      setIsExpanded(true)
      audio.play()
    }
  }, [isPlaying])

  const skipForward = useCallback((): void => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.min(audio.currentTime + SKIP_SECONDS, duration)
  }, [duration])

  const skipBackward = useCallback((): void => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(audio.currentTime - SKIP_SECONDS, 0)
  }, [])

  const changeSpeed = useCallback((): void => {
    const audio = audioRef.current
    if (!audio) return
    const currentIndex = SPEED_OPTIONS.indexOf(speed)
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length
    const newSpeed = SPEED_OPTIONS[nextIndex]
    audio.playbackRate = newSpeed
    setSpeed(newSpeed)
  }, [speed])

  const toggleMute = useCallback((): void => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !audio.muted
    setIsMuted(!isMuted)
  }, [isMuted])

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      const audio = audioRef.current
      const bar = progressRef.current
      if (!audio || !bar || !duration) return

      const rect = bar.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      audio.currentTime = percent * duration
    },
    [duration]
  )

  // Web Speech API fallback
  const toggleFallback = useCallback((): void => {
    if (!contentRef.current) return

    if (fallbackPlaying) {
      window.speechSynthesis.cancel()
      setFallbackPlaying(false)
    } else {
      const utterance = new SpeechSynthesisUtterance()
      utterance.text = contentRef.current.textContent || ""
      utterance.rate = 0.9
      utterance.onend = () => setFallbackPlaying(false)
      window.speechSynthesis.speak(utterance)
      setFallbackPlaying(true)
    }
  }, [fallbackPlaying, contentRef])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  // Still checking for audio availability
  if (hasAudio === null) {
    return null
  }

  // No pre-generated audio: show fallback Web Speech API button
  if (useFallback && fallbackSupported) {
    return (
      <Button
        onClick={toggleFallback}
        variant="outline"
        className="flex items-center gap-2"
        aria-label={
          fallbackPlaying ? "Pause text-to-speech" : "Listen to article"
        }
      >
        {fallbackPlaying ? (
          <>
            <Pause className="h-4 w-4" /> Pause
          </>
        ) : (
          <>
            <Play className="h-4 w-4" /> Listen
          </>
        )}
      </Button>
    )
  }

  // No audio and no fallback support
  if (!hasAudio) {
    return null
  }

  // Full audio player with pre-generated audio
  return (
    <div className="w-full">
      {/* Collapsed state: just a listen button */}
      {!isExpanded && !isPlaying ? (
        <Button
          onClick={togglePlay}
          variant="outline"
          className="flex items-center gap-2"
          aria-label="Listen to article"
        >
          <Headphones className="h-4 w-4" />
          Listen to this article
        </Button>
      ) : (
        /* Expanded player */
        <div className="neu-flat-sm rounded-2xl p-4 space-y-3">
          {/* Progress bar */}
          <div className="space-y-1">
            <div
              ref={progressRef}
              onClick={handleProgressClick}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") skipForward()
                if (e.key === "ArrowLeft") skipBackward()
              }}
              role="slider"
              tabIndex={0}
              aria-label="Audio progress"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              className="group relative h-2 w-full cursor-pointer rounded-full bg-stone-200 dark:bg-stone-700"
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-stone-600 dark:bg-stone-400 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-stone-700 dark:bg-stone-300 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${progress}% - 8px)` }}
              />
            </div>
            <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400 tabular-nums">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* Skip back */}
              <button
                onClick={skipBackward}
                className="p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                aria-label={`Skip back ${SKIP_SECONDS} seconds`}
                title={`-${SKIP_SECONDS}s`}
              >
                <SkipBack className="h-4 w-4" />
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className={cn(
                  "p-3 rounded-xl transition-colors",
                  "bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900",
                  "hover:bg-stone-700 dark:hover:bg-stone-300"
                )}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </button>

              {/* Skip forward */}
              <button
                onClick={skipForward}
                className="p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                aria-label={`Skip forward ${SKIP_SECONDS} seconds`}
                title={`+${SKIP_SECONDS}s`}
              >
                <SkipForward className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              {/* Speed control */}
              <button
                onClick={changeSpeed}
                className="px-2 py-1 rounded-lg text-xs font-mono font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors min-w-[3rem] text-center"
                aria-label={`Playback speed: ${speed}x. Click to change.`}
                title="Change playback speed"
              >
                {speed}x
              </button>

              {/* Mute toggle */}
              <button
                onClick={toggleMute}
                className="p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
