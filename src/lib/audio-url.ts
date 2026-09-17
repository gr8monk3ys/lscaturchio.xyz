import { hasAudioForSlug } from "@/lib/audio"

/**
 * The URL of a blog post's audio, or `null` when this deployment has none to
 * serve for that post. Always absolute when it is not null, so it is usable
 * directly as an RSS enclosure or an API field.
 *
 * There are two ways to have no audio, and both used to produce a URL anyway:
 *
 *  - The post has no recording. `src/generated/audio-manifest.ts` lists the
 *    MP3s that exist; a slug absent from it has none.
 *  - The deployment has no audio origin. MP3s live in the Vercel Blob store
 *    named by `NEXT_PUBLIC_AUDIO_CDN_URL` (migrated 2026-08-17, see
 *    docs/operations.md "Serving Audio From A CDN"), and `public/audio/*.mp3`
 *    is gitignored. The old `/audio/<slug>.mp3` fallback therefore pointed at
 *    a file that is in no checkout and no build: a guaranteed 404, not a
 *    fallback.
 *
 * The second case is what the Lighthouse job hit. Its build does not set
 * `NEXT_PUBLIC_AUDIO_CDN_URL`, so the essay player requested
 * `/audio/<slug>.mp3`, got a 404, and Chrome logged it. `errors-in-console` is
 * weighted 1/26 of best-practices — exactly the four points
 * /blog/building-rag-systems was losing.
 *
 * `null` means "do not request audio". Callers must not turn it back into a
 * URL string.
 */
export function getAudioUrl(slug: string): string | null {
  if (!hasAudioForSlug(slug)) return null

  const cdnBase = process.env.NEXT_PUBLIC_AUDIO_CDN_URL
  if (!cdnBase) return null

  const base = cdnBase.endsWith("/") ? cdnBase.slice(0, -1) : cdnBase
  return `${base}/${slug}.mp3`
}
