import { AUDIO_BYTES_BY_SLUG } from "@/generated/audio-manifest";

export function hasAudioForSlug(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(AUDIO_BYTES_BY_SLUG, slug);
}

export function getAudioByteLength(slug: string): number | null {
  const size = AUDIO_BYTES_BY_SLUG[slug];
  return Number.isFinite(size) ? size : null;
}
