import { afterEach, describe, expect, it, vi } from 'vitest';

import { AUDIO_BYTES_BY_SLUG } from '@/generated/audio-manifest';
import { getAudioUrl } from '@/lib/audio-url';

const SLUG_WITH_AUDIO = Object.keys(AUDIO_BYTES_BY_SLUG)[0];
const SLUG_WITHOUT_AUDIO = 'a-slug-that-has-no-recording';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getAudioUrl', () => {
  it('serves the CDN copy when an audio origin is configured', () => {
    vi.stubEnv('NEXT_PUBLIC_AUDIO_CDN_URL', 'https://cdn.example.com/audio');

    expect(getAudioUrl(SLUG_WITH_AUDIO)).toBe(
      `https://cdn.example.com/audio/${SLUG_WITH_AUDIO}.mp3`
    );
  });

  it('tolerates a trailing slash on the origin', () => {
    vi.stubEnv('NEXT_PUBLIC_AUDIO_CDN_URL', 'https://cdn.example.com/audio/');

    expect(getAudioUrl(SLUG_WITH_AUDIO)).toBe(
      `https://cdn.example.com/audio/${SLUG_WITH_AUDIO}.mp3`
    );
  });

  // The regression this file exists for. Without a CDN origin the old code
  // returned `/audio/<slug>.mp3`, a path no build contains (public/audio/*.mp3
  // is gitignored), so the essay player requested it and Chrome logged a 404 —
  // four best-practices points in Lighthouse, on every essay, in every
  // deployment without the variable.
  it('returns null — never a local path — when no audio origin is configured', () => {
    vi.stubEnv('NEXT_PUBLIC_AUDIO_CDN_URL', '');

    expect(getAudioUrl(SLUG_WITH_AUDIO)).toBeNull();
  });

  it('returns null for a post with no recording', () => {
    vi.stubEnv('NEXT_PUBLIC_AUDIO_CDN_URL', 'https://cdn.example.com/audio');

    expect(getAudioUrl(SLUG_WITHOUT_AUDIO)).toBeNull();
  });

  it('is absolute whenever it is not null, so feeds and API responses can use it as-is', () => {
    vi.stubEnv('NEXT_PUBLIC_AUDIO_CDN_URL', 'https://cdn.example.com/audio');

    expect(getAudioUrl(SLUG_WITH_AUDIO)?.startsWith('https://')).toBe(true);
  });
});
