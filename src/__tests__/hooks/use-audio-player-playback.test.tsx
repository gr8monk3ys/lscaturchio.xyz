import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { KeyboardEvent, MouseEvent } from 'react';

import { useAudioPlayer } from '@/hooks/use-audio-player';

// A recorded post plays through an HTMLAudioElement the hook creates itself.
// happy-dom's Audio never loads anything, so this stand-in lets each test fire
// the media events a real element would and observe what the hook does to it.
class FakeAudio extends EventTarget {
  static last: FakeAudio | null = null;
  src = '';
  preload = '';
  currentTime = 0;
  duration = 120;
  playbackRate = 1;
  muted = false;
  seekable = { length: 0, end: () => 0 };
  play = vi.fn(() => {
    this.dispatchEvent(new Event('play'));
    return Promise.resolve();
  });
  pause = vi.fn(() => {
    this.dispatchEvent(new Event('pause'));
  });

  constructor() {
    super();
    FakeAudio.last = this;
  }
}

function fire(audio: FakeAudio, type: string): void {
  act(() => {
    audio.dispatchEvent(new Event(type));
  });
}

function renderLoadedPlayer() {
  const hook = renderHook(() =>
    useAudioPlayer({ slug: 'an-essay', audioSrc: 'https://cdn.example/an-essay.mp3' })
  );
  const audio = FakeAudio.last!;
  fire(audio, 'canplaythrough');
  return { ...hook, audio };
}

describe('useAudioPlayer with a recording', () => {
  let prose: HTMLDivElement;

  beforeEach(() => {
    FakeAudio.last = null;
    vi.stubGlobal('Audio', FakeAudio);
    prose = document.createElement('div');
    prose.className = 'prose-gallery';
    prose.innerHTML = '<h2 id="one">One</h2><p>First part of the essay.</p><h2 id="two">Two</h2><p>Second part.</p>';
    document.body.appendChild(prose);
  });

  afterEach(() => {
    prose.remove();
    vi.unstubAllGlobals();
  });

  it('loads the source lazily and switches to the recording once it can play', () => {
    const { result, audio } = renderLoadedPlayer();

    expect(audio.src).toBe('https://cdn.example/an-essay.mp3');
    expect(audio.preload).toBe('metadata');
    expect(result.current.state.hasAudio).toBe(true);
    expect(result.current.state.useFallback).toBe(false);
    expect(result.current.state.duration).toBe(120);
    expect(result.current.state.chapters.length).toBeGreaterThan(0);
  });

  it('falls back to speech when the recording fails to load', () => {
    const { result } = renderHook(() =>
      useAudioPlayer({ slug: 'an-essay', audioSrc: 'https://cdn.example/missing.mp3' })
    );

    fire(FakeAudio.last!, 'error');

    expect(result.current.state.hasAudio).toBe(false);
    expect(result.current.state.useFallback).toBe(true);
  });

  it('stops the element and drops its source on unmount', () => {
    const { unmount, audio } = renderLoadedPlayer();

    unmount();

    expect(audio.pause).toHaveBeenCalled();
    expect(audio.src).toBe('');
  });

  it('plays, expands the player, and pauses on the next toggle', () => {
    const { result, audio } = renderLoadedPlayer();

    act(() => result.current.togglePlay());
    expect(audio.play).toHaveBeenCalledTimes(1);
    expect(result.current.state.isPlaying).toBe(true);
    expect(result.current.state.isExpanded).toBe(true);

    act(() => result.current.togglePlay());
    expect(audio.pause).toHaveBeenCalledTimes(1);
    expect(result.current.state.isPlaying).toBe(false);
  });

  it('tracks time, loading and the end of playback from media events', () => {
    const { result, audio } = renderLoadedPlayer();

    audio.currentTime = 30;
    fire(audio, 'timeupdate');
    expect(result.current.state.currentTime).toBe(30);
    expect(result.current.progress).toBe(25);

    fire(audio, 'waiting');
    expect(result.current.state.isLoading).toBe(true);
    fire(audio, 'canplay');
    expect(result.current.state.isLoading).toBe(false);

    audio.duration = 200;
    fire(audio, 'durationchange');
    expect(result.current.state.duration).toBe(200);

    fire(audio, 'ended');
    expect(result.current.state.isPlaying).toBe(false);
  });

  it('skips within the bounds of the recording', () => {
    const { result, audio } = renderLoadedPlayer();

    audio.currentTime = 110;
    act(() => result.current.skipForward());
    expect(audio.currentTime).toBe(120);

    audio.currentTime = 5;
    act(() => result.current.skipBackward());
    expect(audio.currentTime).toBe(0);
  });

  it('maps arrow keys on the progress bar to skips', () => {
    const { result, audio } = renderLoadedPlayer();

    audio.currentTime = 50;
    act(() =>
      result.current.handleProgressKeyDown({ key: 'ArrowRight' } as KeyboardEvent<HTMLDivElement>)
    );
    expect(audio.currentTime).toBe(65);

    act(() =>
      result.current.handleProgressKeyDown({ key: 'ArrowLeft' } as KeyboardEvent<HTMLDivElement>)
    );
    expect(audio.currentTime).toBe(50);
  });

  it('cycles playback speed and wraps back to the slowest', () => {
    const { result, audio } = renderLoadedPlayer();

    act(() => result.current.changeSpeed());
    expect(audio.playbackRate).toBe(1.25);
    expect(result.current.state.speed).toBe(1.25);

    for (let i = 0; i < 3; i++) act(() => result.current.changeSpeed());
    expect(result.current.state.speed).toBe(2);

    act(() => result.current.changeSpeed());
    expect(result.current.state.speed).toBe(0.5);
  });

  it('toggles mute on the element and in state', () => {
    const { result, audio } = renderLoadedPlayer();

    act(() => result.current.toggleMute());
    expect(audio.muted).toBe(true);
    expect(result.current.state.isMuted).toBe(true);

    act(() => result.current.toggleMute());
    expect(audio.muted).toBe(false);
  });

  it('seeks to where the progress bar was clicked, clamped to the bar', () => {
    const { result, audio } = renderLoadedPlayer();
    const bar = document.createElement('div');
    bar.getBoundingClientRect = () => ({ left: 100, width: 200 }) as DOMRect;
    result.current.progressRef.current = bar;

    act(() =>
      result.current.handleProgressClick({ clientX: 150 } as MouseEvent<HTMLDivElement>)
    );
    expect(audio.currentTime).toBe(30);

    act(() =>
      result.current.handleProgressClick({ clientX: 900 } as MouseEvent<HTMLDivElement>)
    );
    expect(audio.currentTime).toBe(120);
  });

  it('jumps to a chapter and starts playing from it', () => {
    const { result, audio } = renderLoadedPlayer();

    act(() =>
      result.current.jumpToChapter({ id: 'two', title: 'Two', level: 2, startTime: 42 })
    );

    expect(audio.currentTime).toBe(42);
    expect(result.current.state.currentTime).toBe(42);
    expect(audio.play).toHaveBeenCalled();
  });

  it('ignores playback controls until a recording is ready', () => {
    const { result } = renderHook(() =>
      useAudioPlayer({ slug: 'an-essay', audioSrc: 'https://cdn.example/slow.mp3' })
    );
    const audio = FakeAudio.last!;

    act(() => {
      result.current.togglePlay();
      result.current.skipForward();
      result.current.skipBackward();
      result.current.changeSpeed();
      result.current.toggleMute();
      result.current.jumpToChapter({ id: 'one', title: 'One', level: 2, startTime: 10 });
      result.current.handleProgressClick({ clientX: 10 } as MouseEvent<HTMLDivElement>);
    });

    expect(audio.play).not.toHaveBeenCalled();
    expect(audio.currentTime).toBe(0);
    expect(result.current.state.speed).toBe(1);
  });
});
