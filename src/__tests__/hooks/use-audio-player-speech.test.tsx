import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useAudioPlayer } from '@/hooks/use-audio-player';

// Posts without a recording are read aloud by the browser's speech synthesis.
// That queue belongs to the window, not the component: a client-side
// navigation unmounts the player, and unless the hook cancels on the way out
// the old essay keeps talking over the next page.

describe('useAudioPlayer speech fallback', () => {
  const speak = vi.fn();
  const cancel = vi.fn();
  let prose: HTMLDivElement;

  beforeEach(() => {
    speak.mockReset();
    cancel.mockReset();
    vi.stubGlobal('speechSynthesis', { speak, cancel });
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      vi.fn(function (this: { text: string }, text: string) {
        this.text = text;
      })
    );
    prose = document.createElement('div');
    prose.className = 'prose-gallery';
    prose.textContent = 'An essay.';
    document.body.appendChild(prose);
  });

  afterEach(() => {
    prose.remove();
    vi.unstubAllGlobals();
  });

  it('stops reading when the player unmounts mid-essay', () => {
    const { result, unmount } = renderHook(() =>
      useAudioPlayer({ slug: 'an-essay', audioSrc: null })
    );

    act(() => result.current.toggleFallback());
    expect(speak).toHaveBeenCalledTimes(1);

    unmount();
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('leaves the speech queue alone on unmount when it never spoke', () => {
    const { unmount } = renderHook(() =>
      useAudioPlayer({ slug: 'an-essay', audioSrc: null })
    );

    unmount();
    expect(cancel).not.toHaveBeenCalled();
  });
});
