/**
 * Resolves the URL for a blog post's audio file.
 *
 * When `NEXT_PUBLIC_AUDIO_CDN_URL` is set (e.g. `https://cdn.example.com/audio`),
 * audio is served from that external origin. Otherwise, files are served from the
 * local `public/audio/` directory.
 */
export function getAudioUrl(slug: string): string {
  const cdnBase = process.env.NEXT_PUBLIC_AUDIO_CDN_URL

  if (cdnBase) {
    const base = cdnBase.endsWith('/') ? cdnBase.slice(0, -1) : cdnBase
    return `${base}/${slug}.mp3`
  }

  return `/audio/${slug}.mp3`
}

/**
 * Returns a fully-qualified audio URL suitable for RSS feeds and API responses.
 * If the audio URL is already absolute (CDN), it is returned as-is.
 * Otherwise the site origin is prepended.
 */
export function getAbsoluteAudioUrl(slug: string, siteUrl: string): string {
  const url = getAudioUrl(slug)
  return url.startsWith('http') ? url : `${siteUrl}${url}`
}
