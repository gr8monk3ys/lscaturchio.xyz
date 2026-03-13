"use client"

import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  type MouseEvent,
  type KeyboardEvent,
  type RefObject,
} from "react"
import {
  FileText,
  Headphones,
  List,
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

interface AudioPlayerProps {
  slug: string
  contentRef: RefObject<HTMLDivElement | null>
}

type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2

interface Chapter {
  id: string
  title: string
  level: number
  startTime: number
}

type PlayerState = {
  hasAudio: boolean | null
  isPlaying: boolean
  isLoading: boolean
  currentTime: number
  duration: number
  speed: PlaybackSpeed
  isMuted: boolean
  isExpanded: boolean
  showChapters: boolean
  showTranscript: boolean
  chapters: Chapter[]
  transcript: string
  useFallback: boolean
  fallbackPlaying: boolean
  fallbackSupported: boolean
}

type PlayerAction =
  | { type: "SET_AUDIO_SOURCE"; hasAudio: boolean; useFallback: boolean }
  | { type: "SET_FALLBACK_SUPPORTED"; value: boolean }
  | { type: "SET_TRANSCRIPT"; transcript: string }
  | { type: "SET_CHAPTERS"; chapters: Chapter[] }
  | { type: "SET_CURRENT_TIME"; currentTime: number }
  | { type: "SET_DURATION"; duration: number }
  | { type: "SET_LOADING"; value: boolean }
  | { type: "SET_PLAYING"; value: boolean }
  | { type: "RESET_PLAYBACK" }
  | { type: "SET_SPEED"; speed: PlaybackSpeed }
  | { type: "SET_MUTED"; value: boolean }
  | { type: "SET_EXPANDED"; value: boolean }
  | { type: "TOGGLE_CHAPTERS" }
  | { type: "TOGGLE_TRANSCRIPT" }
  | { type: "SET_FALLBACK_PLAYING"; value: boolean }

const SPEED_OPTIONS: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
const SKIP_SECONDS = 15

const INITIAL_STATE: PlayerState = {
  hasAudio: null,
  isPlaying: false,
  isLoading: false,
  currentTime: 0,
  duration: 0,
  speed: 1,
  isMuted: false,
  isExpanded: false,
  showChapters: false,
  showTranscript: false,
  chapters: [],
  transcript: "",
  useFallback: false,
  fallbackPlaying: false,
  fallbackSupported: false,
}

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case "SET_AUDIO_SOURCE":
      return {
        ...state,
        hasAudio: action.hasAudio,
        useFallback: action.useFallback,
      }
    case "SET_FALLBACK_SUPPORTED":
      return { ...state, fallbackSupported: action.value }
    case "SET_TRANSCRIPT":
      return { ...state, transcript: action.transcript }
    case "SET_CHAPTERS":
      return { ...state, chapters: action.chapters }
    case "SET_CURRENT_TIME":
      return { ...state, currentTime: action.currentTime }
    case "SET_DURATION":
      return { ...state, duration: action.duration }
    case "SET_LOADING":
      return { ...state, isLoading: action.value }
    case "SET_PLAYING":
      return { ...state, isPlaying: action.value }
    case "RESET_PLAYBACK":
      return { ...state, isPlaying: false, currentTime: 0 }
    case "SET_SPEED":
      return { ...state, speed: action.speed }
    case "SET_MUTED":
      return { ...state, isMuted: action.value }
    case "SET_EXPANDED":
      return { ...state, isExpanded: action.value }
    case "TOGGLE_CHAPTERS":
      return {
        ...state,
        showChapters: !state.showChapters,
        showTranscript: false,
      }
    case "TOGGLE_TRANSCRIPT":
      return {
        ...state,
        showTranscript: !state.showTranscript,
        showChapters: false,
      }
    case "SET_FALLBACK_PLAYING":
      return { ...state, fallbackPlaying: action.value }
    default:
      return state
  }
}

function getSafeDuration(audio: HTMLAudioElement): number {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    return audio.duration
  }

  if (audio.seekable.length > 0) {
    return audio.seekable.end(audio.seekable.length - 1)
  }

  if (audio.buffered.length > 0) {
    return audio.buffered.end(audio.buffered.length - 1)
  }

  return 0
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

function buildTranscript(root: HTMLDivElement): string {
  const text = (root.textContent || "").trim()
  return text.length > 40_000 ? `${text.slice(0, 40_000)}\n\n[truncated]` : text
}

function buildChapters(root: HTMLDivElement, duration: number): Chapter[] {
  const totalWords = countWords(root.textContent || "")
  if (!totalWords || duration <= 0) return []

  const headingEls = Array.from(root.querySelectorAll("h2, h3")) as HTMLElement[]
  const nextChapters: Chapter[] = [{ id: "start", title: "Start", level: 2, startTime: 0 }]

  for (const el of headingEls) {
    const title = (el.textContent || "").trim()
    if (!title) continue

    if (!el.id) {
      el.id = slugify(title)
    }

    let wordsBefore = 0
    try {
      const range = document.createRange()
      range.setStart(root, 0)
      range.setEnd(el, 0)
      wordsBefore = countWords(range.toString())
    } catch {
      wordsBefore = 0
    }

    const startTime = Math.max(0, Math.min(duration, (wordsBefore / totalWords) * duration))
    const level = Number.parseInt(el.tagName[1] ?? "2", 10) || 2
    nextChapters.push({ id: el.id, title, level, startTime })
  }

  const seen = new Set<string>()
  return nextChapters
    .filter((chapter) => {
      if (seen.has(chapter.id)) return false
      seen.add(chapter.id)
      return true
    })
    .sort((a, b) => a.startTime - b.startTime)
    .slice(0, 24)
}

function ListenButton({
  label,
  icon,
  onClick,
}: {
  label: string
  icon: "play" | "pause" | "headphones"
  onClick: () => void
}) {
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

function ProgressBar({
  currentTime,
  duration,
  progress,
  progressRef,
  onProgressClick,
  onProgressKeyDown,
}: {
  currentTime: number
  duration: number
  progress: number
  progressRef: RefObject<HTMLDivElement | null>
  onProgressClick: (event: MouseEvent<HTMLDivElement>) => void
  onProgressKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
}) {
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
        className="group relative h-2 w-full cursor-pointer rounded-full bg-stone-200 dark:bg-stone-700"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-stone-600 transition-[width] duration-100 dark:bg-stone-400"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-stone-700 opacity-0 shadow-xs transition-opacity group-hover:opacity-100 dark:bg-stone-300"
          style={{ left: `calc(${progress}% - 8px)` }}
        />
      </div>
      <div className="flex justify-between text-xs tabular-nums text-stone-500 dark:text-stone-400">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  )
}

function TransportControls({
  isLoading,
  isMuted,
  isPlaying,
  speed,
  onChangeSpeed,
  onSkipBackward,
  onSkipForward,
  onToggleMute,
  onTogglePlay,
}: {
  isLoading: boolean
  isMuted: boolean
  isPlaying: boolean
  speed: PlaybackSpeed
  onChangeSpeed: () => void
  onSkipBackward: () => void
  onSkipForward: () => void
  onToggleMute: () => void
  onTogglePlay: () => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        <button
          onClick={onSkipBackward}
          className="rounded-lg p-2 text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
          aria-label={`Skip back ${SKIP_SECONDS} seconds`}
          title={`-${SKIP_SECONDS}s`}
        >
          <SkipBack className="h-4 w-4" />
        </button>

        <button
          onClick={onTogglePlay}
          className={cn(
            "rounded-xl p-3 transition-colors",
            "bg-stone-800 text-white hover:bg-stone-700",
            "dark:bg-stone-200 dark:text-stone-900 dark:hover:bg-stone-300"
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

        <button
          onClick={onSkipForward}
          className="rounded-lg p-2 text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
          aria-label={`Skip forward ${SKIP_SECONDS} seconds`}
          title={`+${SKIP_SECONDS}s`}
        >
          <SkipForward className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onChangeSpeed}
          className="min-w-12 rounded-lg px-2 py-1 text-center font-mono text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
          aria-label={`Playback speed: ${speed}x. Click to change.`}
          title="Change playback speed"
        >
          {speed}x
        </button>

        <button
          onClick={onToggleMute}
          className="rounded-lg p-2 text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

function AudioPanels({
  chapters,
  showChapters,
  showTranscript,
  transcript,
  onJumpToChapter,
  onToggleChapters,
  onToggleTranscript,
}: {
  chapters: Chapter[]
  showChapters: boolean
  showTranscript: boolean
  transcript: string
  onJumpToChapter: (chapter: Chapter) => void
  onToggleChapters: () => void
  onToggleTranscript: () => void
}) {
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
                ? "neu-pressed text-stone-900 dark:text-stone-100"
                : "neu-button text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
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
                ? "neu-pressed text-stone-900 dark:text-stone-100"
                : "neu-button text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
            )}
          >
            <FileText className="h-3.5 w-3.5" />
            Transcript
          </button>
        </div>
        <span className="text-xs text-stone-500 dark:text-stone-400">
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
                        ? "pl-3 text-stone-700 dark:text-stone-300"
                        : "text-stone-900 dark:text-stone-100"
                    )}
                  >
                    {chapter.title}
                  </div>
                  <div className="shrink-0 font-mono text-xs text-stone-500 dark:text-stone-400">
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

export function TextToSpeech({ slug, contentRef }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [state, dispatch] = useReducer(playerReducer, INITIAL_STATE)

  useEffect(() => {
    const audioUrl = `/audio/${slug}.mp3`
    const audio = new Audio()

    const handleCanPlay = (): void => {
      audioRef.current = audio
      dispatch({ type: "SET_AUDIO_SOURCE", hasAudio: true, useFallback: false })
    }

    const handleError = (): void => {
      dispatch({ type: "SET_AUDIO_SOURCE", hasAudio: false, useFallback: true })
      audio.removeEventListener("canplaythrough", handleCanPlay)
      audio.removeEventListener("error", handleError)
    }

    audio.addEventListener("canplaythrough", handleCanPlay)
    audio.addEventListener("error", handleError)
    audio.preload = "metadata"
    audio.src = audioUrl

    dispatch({
      type: "SET_FALLBACK_SUPPORTED",
      value: typeof window !== "undefined" && Boolean(window.speechSynthesis),
    })

    return () => {
      audio.removeEventListener("canplaythrough", handleCanPlay)
      audio.removeEventListener("error", handleError)
      audio.pause()
      audio.src = ""
    }
  }, [slug])

  useEffect(() => {
    const root = contentRef.current
    if (!root) return

    dispatch({ type: "SET_TRANSCRIPT", transcript: buildTranscript(root) })
  }, [contentRef, slug])

  useEffect(() => {
    const root = contentRef.current
    if (!root || state.duration <= 0) return

    dispatch({ type: "SET_CHAPTERS", chapters: buildChapters(root, state.duration) })
  }, [contentRef, state.duration])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateDuration = (): void => {
      dispatch({ type: "SET_DURATION", duration: getSafeDuration(audio) })
    }

    const onTimeUpdate = (): void => {
      dispatch({ type: "SET_CURRENT_TIME", currentTime: audio.currentTime })
    }

    const onEnded = (): void => dispatch({ type: "RESET_PLAYBACK" })
    const onWaiting = (): void => dispatch({ type: "SET_LOADING", value: true })
    const onCanPlay = (): void => dispatch({ type: "SET_LOADING", value: false })
    const onLoadedMetadata = (): void => updateDuration()
    const onPlay = (): void => {
      dispatch({ type: "SET_PLAYING", value: true })
      dispatch({ type: "SET_LOADING", value: false })
    }
    const onPause = (): void => dispatch({ type: "SET_PLAYING", value: false })

    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("durationchange", onLoadedMetadata)
    audio.addEventListener("ended", onEnded)
    audio.addEventListener("waiting", onWaiting)
    audio.addEventListener("canplay", onCanPlay)
    audio.addEventListener("loadedmetadata", onLoadedMetadata)
    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onPause)

    updateDuration()

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("durationchange", onLoadedMetadata)
      audio.removeEventListener("ended", onEnded)
      audio.removeEventListener("waiting", onWaiting)
      audio.removeEventListener("canplay", onCanPlay)
      audio.removeEventListener("loadedmetadata", onLoadedMetadata)
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
    }
  }, [state.hasAudio])

  const togglePlay = useCallback((): void => {
    const audio = audioRef.current
    if (!audio) return

    if (state.isPlaying) {
      audio.pause()
      return
    }

    dispatch({ type: "SET_EXPANDED", value: true })
    void audio.play()
  }, [state.isPlaying])

  const skipForward = useCallback((): void => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.min(audio.currentTime + SKIP_SECONDS, state.duration)
  }, [state.duration])

  const skipBackward = useCallback((): void => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(audio.currentTime - SKIP_SECONDS, 0)
  }, [])

  const changeSpeed = useCallback((): void => {
    const audio = audioRef.current
    if (!audio) return

    const currentIndex = SPEED_OPTIONS.indexOf(state.speed)
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length
    const nextSpeed = SPEED_OPTIONS[nextIndex]

    audio.playbackRate = nextSpeed
    dispatch({ type: "SET_SPEED", speed: nextSpeed })
  }, [state.speed])

  const toggleMute = useCallback((): void => {
    const audio = audioRef.current
    if (!audio) return

    const nextMuted = !audio.muted
    audio.muted = nextMuted
    dispatch({ type: "SET_MUTED", value: nextMuted })
  }, [])

  const handleProgressClick = useCallback((event: MouseEvent<HTMLDivElement>): void => {
    const audio = audioRef.current
    const bar = progressRef.current
    if (!audio || !bar) return

    const totalDuration = getSafeDuration(audio)
    if (!totalDuration) return

    const rect = bar.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
    audio.currentTime = percent * totalDuration
    dispatch({ type: "SET_CURRENT_TIME", currentTime: audio.currentTime })
    dispatch({ type: "SET_DURATION", duration: totalDuration })
  }, [])

  const handleProgressKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>): void => {
      if (event.key === "ArrowRight") skipForward()
      if (event.key === "ArrowLeft") skipBackward()
    },
    [skipBackward, skipForward]
  )

  const toggleFallback = useCallback((): void => {
    if (!contentRef.current || typeof window === "undefined" || !window.speechSynthesis) {
      return
    }

    if (state.fallbackPlaying) {
      window.speechSynthesis.cancel()
      dispatch({ type: "SET_FALLBACK_PLAYING", value: false })
      return
    }

    const utterance = new SpeechSynthesisUtterance(contentRef.current.textContent || "")
    utterance.rate = 0.9
    utterance.onend = () => dispatch({ type: "SET_FALLBACK_PLAYING", value: false })
    window.speechSynthesis.speak(utterance)
    dispatch({ type: "SET_FALLBACK_PLAYING", value: true })
  }, [contentRef, state.fallbackPlaying])

  const jumpToChapter = useCallback((chapter: Chapter): void => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = chapter.startTime
    dispatch({ type: "SET_CURRENT_TIME", currentTime: chapter.startTime })
    void audio.play()
  }, [])

  const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0

  if (state.hasAudio === null) {
    return null
  }

  if (state.useFallback && state.fallbackSupported) {
    return (
      <ListenButton
        label={state.fallbackPlaying ? "Pause text-to-speech" : "Listen to article"}
        icon={state.fallbackPlaying ? "pause" : "play"}
        onClick={toggleFallback}
      />
    )
  }

  if (!state.hasAudio) {
    return null
  }

  if (!state.isExpanded && !state.isPlaying) {
    return (
      <ListenButton
        label="Listen to this article"
        icon="headphones"
        onClick={togglePlay}
      />
    )
  }

  return (
    <div className="w-full">
      <div className="neu-flat-sm space-y-3 rounded-2xl p-4">
        <ProgressBar
          currentTime={state.currentTime}
          duration={state.duration}
          progress={progress}
          progressRef={progressRef}
          onProgressClick={handleProgressClick}
          onProgressKeyDown={handleProgressKeyDown}
        />

        <TransportControls
          isLoading={state.isLoading}
          isMuted={state.isMuted}
          isPlaying={state.isPlaying}
          speed={state.speed}
          onChangeSpeed={changeSpeed}
          onSkipBackward={skipBackward}
          onSkipForward={skipForward}
          onToggleMute={toggleMute}
          onTogglePlay={togglePlay}
        />

        <AudioPanels
          chapters={state.chapters}
          showChapters={state.showChapters}
          showTranscript={state.showTranscript}
          transcript={state.transcript}
          onJumpToChapter={jumpToChapter}
          onToggleChapters={() => dispatch({ type: "TOGGLE_CHAPTERS" })}
          onToggleTranscript={() => dispatch({ type: "TOGGLE_TRANSCRIPT" })}
        />
      </div>
    </div>
  )
}
