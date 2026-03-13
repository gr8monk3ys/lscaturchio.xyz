"use client"

import { type RefObject } from "react"

import { useAudioPlayer } from "@/hooks/use-audio-player"

import {
  AudioPanels,
  ListenButton,
  ProgressBar,
  TransportControls,
} from "./audio-player-controls"

interface AudioPlayerProps {
  slug: string
  contentRef: RefObject<HTMLDivElement | null>
}

export function TextToSpeech({ slug, contentRef }: AudioPlayerProps): React.ReactElement | null {
  const {
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
  } = useAudioPlayer({ slug, contentRef })

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
