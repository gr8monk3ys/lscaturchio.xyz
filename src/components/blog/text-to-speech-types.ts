export type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2

export interface Chapter {
  id: string
  title: string
  level: number
  startTime: number
}

export type PlayerState = {
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

export type PlayerAction =
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

export const SPEED_OPTIONS: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
export const SKIP_SECONDS = 15

export const INITIAL_STATE: PlayerState = {
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

export function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
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

export function getSafeDuration(audio: HTMLAudioElement): number {
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

export function formatTime(seconds: number): string {
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

export function buildTranscript(root: HTMLDivElement): string {
  const text = (root.textContent || "").trim()
  return text.length > 40_000 ? `${text.slice(0, 40_000)}\n\n[truncated]` : text
}

export function buildChapters(root: HTMLDivElement, duration: number): Chapter[] {
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
