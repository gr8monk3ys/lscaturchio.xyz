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
  buildChapters,
  buildTranscript,
  getSafeDuration,
  INITIAL_STATE,
  playerReducer,
  SKIP_SECONDS,
  SPEED_OPTIONS,
  type Chapter,
  type PlayerState,
} from "@/components/blog/text-to-speech-types"
import { getAudioUrl } from "@/lib/audio-url"

interface UseAudioPlayerArgs {
  slug: string
  contentRef: RefObject<HTMLDivElement | null>
}

interface UseAudioPlayerReturn {
  state: PlayerState
  progressRef: RefObject<HTMLDivElement | null>
  progress: number
  togglePlay: () => void
  skipForward: () => void
  skipBackward: () => void
  changeSpeed: () => void
  toggleMute: () => void
  handleProgressClick: (event: MouseEvent<HTMLDivElement>) => void
  handleProgressKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
  toggleFallback: () => void
  jumpToChapter: (chapter: Chapter) => void
  dispatch: React.Dispatch<import("@/components/blog/text-to-speech-types").PlayerAction>
}

export function useAudioPlayer({ slug, contentRef }: UseAudioPlayerArgs): UseAudioPlayerReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [state, dispatch] = useReducer(playerReducer, INITIAL_STATE)

  useEffect(() => {
    const audioUrl = getAudioUrl(slug)
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

  return {
    state,
    progressRef,
    progress,
    togglePlay,
    skipForward,
    skipBackward,
    changeSpeed,
    toggleMute,
    handleProgressClick,
    handleProgressKeyDown,
    toggleFallback,
    jumpToChapter,
    dispatch,
  }
}
