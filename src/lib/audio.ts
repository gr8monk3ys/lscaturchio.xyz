import fs from "fs";
import path from "path";

export function getAudioFilePath(slug: string): string {
  return path.join(process.cwd(), "public", "audio", `${slug}.mp3`);
}

export function hasAudioForSlug(slug: string): boolean {
  try {
    return fs.existsSync(getAudioFilePath(slug));
  } catch {
    return false;
  }
}

export function getAudioByteLength(slug: string): number | null {
  try {
    const stat = fs.statSync(getAudioFilePath(slug));
    return Number.isFinite(stat.size) ? stat.size : null;
  } catch {
    return null;
  }
}

