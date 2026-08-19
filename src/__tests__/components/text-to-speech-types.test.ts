import { describe, it, expect } from 'vitest';
import {
  playerReducer,
  INITIAL_STATE,
  SPEED_OPTIONS,
  formatTime,
  getSafeDuration,
  buildTranscript,
  buildChapters,
  type PlayerAction,
} from '@/components/blog/text-to-speech-types';

describe('playerReducer', () => {
  it('records the audio source decision', () => {
    const next = playerReducer(INITIAL_STATE, {
      type: 'SET_AUDIO_SOURCE',
      hasAudio: true,
      useFallback: false,
    });
    expect(next.hasAudio).toBe(true);
    expect(next.useFallback).toBe(false);
  });

  it('handles simple value setters', () => {
    const actions: [PlayerAction, keyof typeof INITIAL_STATE, unknown][] = [
      [{ type: 'SET_FALLBACK_SUPPORTED', value: true }, 'fallbackSupported', true],
      [{ type: 'SET_TRANSCRIPT', transcript: 'hello' }, 'transcript', 'hello'],
      [{ type: 'SET_CURRENT_TIME', currentTime: 12 }, 'currentTime', 12],
      [{ type: 'SET_DURATION', duration: 300 }, 'duration', 300],
      [{ type: 'SET_LOADING', value: true }, 'isLoading', true],
      [{ type: 'SET_PLAYING', value: true }, 'isPlaying', true],
      [{ type: 'SET_SPEED', speed: 1.5 }, 'speed', 1.5],
      [{ type: 'SET_MUTED', value: true }, 'isMuted', true],
      [{ type: 'SET_EXPANDED', value: true }, 'isExpanded', true],
      [{ type: 'SET_FALLBACK_PLAYING', value: true }, 'fallbackPlaying', true],
    ];
    for (const [action, key, expected] of actions) {
      expect(playerReducer(INITIAL_STATE, action)[key]).toBe(expected);
    }
  });

  it('stores chapters', () => {
    const chapters = [{ id: 'start', title: 'Start', level: 2, startTime: 0 }];
    expect(playerReducer(INITIAL_STATE, { type: 'SET_CHAPTERS', chapters }).chapters).toBe(
      chapters
    );
  });

  it('resets playback position and play state together', () => {
    const playing = { ...INITIAL_STATE, isPlaying: true, currentTime: 42 };
    const next = playerReducer(playing, { type: 'RESET_PLAYBACK' });
    expect(next.isPlaying).toBe(false);
    expect(next.currentTime).toBe(0);
  });

  it('makes the chapters and transcript panels mutually exclusive', () => {
    let state = playerReducer(INITIAL_STATE, { type: 'TOGGLE_TRANSCRIPT' });
    expect(state.showTranscript).toBe(true);
    state = playerReducer(state, { type: 'TOGGLE_CHAPTERS' });
    expect(state.showChapters).toBe(true);
    expect(state.showTranscript).toBe(false);
    state = playerReducer(state, { type: 'TOGGLE_TRANSCRIPT' });
    expect(state.showTranscript).toBe(true);
    expect(state.showChapters).toBe(false);
  });

  it('offers the standard speed ladder', () => {
    expect(SPEED_OPTIONS).toEqual([0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]);
  });
});

describe('formatTime', () => {
  it('formats minutes and zero-padded seconds', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(600)).toBe('10:00');
  });

  it('treats invalid input as zero', () => {
    expect(formatTime(-3)).toBe('0:00');
    expect(formatTime(NaN)).toBe('0:00');
    expect(formatTime(Infinity)).toBe('0:00');
  });
});

describe('getSafeDuration', () => {
  const ranges = (ends: number[]) => ({
    length: ends.length,
    end: (i: number) => ends[i],
  });
  const audio = (over: object) =>
    ({ duration: NaN, seekable: ranges([]), buffered: ranges([]), ...over }) as unknown as HTMLAudioElement;

  it('prefers a finite positive duration', () => {
    expect(getSafeDuration(audio({ duration: 120 }))).toBe(120);
  });

  it('falls back to the seekable range for streams', () => {
    expect(getSafeDuration(audio({ seekable: ranges([90, 180]) }))).toBe(180);
  });

  it('falls back to the buffered range next', () => {
    expect(getSafeDuration(audio({ buffered: ranges([45]) }))).toBe(45);
  });

  it('returns 0 when nothing is known', () => {
    expect(getSafeDuration(audio({}))).toBe(0);
  });
});

describe('buildTranscript', () => {
  it('returns trimmed text content', () => {
    const root = document.createElement('div');
    root.textContent = '  some article text  ';
    expect(buildTranscript(root)).toBe('some article text');
  });

  it('truncates very long articles at 40k characters', () => {
    const root = document.createElement('div');
    root.textContent = 'x'.repeat(50_000);
    const transcript = buildTranscript(root);
    expect(transcript.endsWith('[truncated]')).toBe(true);
    expect(transcript.length).toBeLessThan(50_000);
  });
});

describe('buildChapters', () => {
  function makeArticle(html: string): HTMLDivElement {
    const root = document.createElement('div');
    root.innerHTML = html;
    document.body.appendChild(root);
    return root;
  }

  it('returns no chapters without words or duration', () => {
    expect(buildChapters(makeArticle(''), 100)).toEqual([]);
    expect(buildChapters(makeArticle('<p>words</p>'), 0)).toEqual([]);
  });

  it('always starts with a Start chapter and slugifies heading ids', () => {
    const root = makeArticle(
      '<p>intro words here</p><h2>The First Section!</h2><p>more words</p>'
    );
    const chapters = buildChapters(root, 100);
    expect(chapters[0]).toMatchObject({ id: 'start', title: 'Start', startTime: 0 });
    expect(chapters[1].id).toBe('the-first-section');
    expect(chapters[1].level).toBe(2);
  });

  it('estimates start times proportionally to words before each heading', () => {
    const root = makeArticle(
      '<p>one two three four five</p><h2>Half</h2><p>six seven eight nine ten</p>'
    );
    const chapters = buildChapters(root, 100);
    const half = chapters.find((c) => c.title === 'Half')!;
    expect(half.startTime).toBeGreaterThan(0);
    expect(half.startTime).toBeLessThanOrEqual(100);
  });

  it('keeps existing heading ids and skips empty headings', () => {
    const root = makeArticle(
      '<p>words words</p><h3 id="kept">Kept</h3><h2>   </h2><p>tail</p>'
    );
    const chapters = buildChapters(root, 60);
    expect(chapters.map((c) => c.id)).toContain('kept');
    expect(chapters).toHaveLength(2); // start + kept; the blank heading is skipped
    expect(chapters.find((c) => c.id === 'kept')?.level).toBe(3);
  });

  it('drops duplicate ids', () => {
    const root = makeArticle(
      '<p>a b c</p><h2 id="dup">One</h2><p>d e</p><h2 id="dup">Two</h2><p>f</p>'
    );
    const ids = buildChapters(root, 100).map((c) => c.id);
    expect(ids.filter((id) => id === 'dup')).toHaveLength(1);
  });
});
