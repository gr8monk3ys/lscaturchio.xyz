#!/usr/bin/env node

import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, "src", "app", "blog");
const IMAGE_DIR = path.join(ROOT, "public", "images", "blog");
const AUDIO_DIR = path.join(ROOT, "public", "audio");

const args = new Set(process.argv.slice(2));
const jsonOutput = args.has("--json");
const failOnMissing = args.has("--fail-on-missing");
const failOnOrphans = args.has("--fail-on-orphans");

function getArgValue(flag) {
  const values = process.argv.slice(2);
  const match = values.find((value) => value.startsWith(`${flag}=`));
  if (!match) return undefined;
  return Number(match.slice(flag.length + 1));
}

const maxImageMb = getArgValue("--max-image-mb");
const maxAudioMb = getArgValue("--max-audio-mb");

function listFiles(dirPath, ext) {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .filter((name) => name.endsWith(ext))
    .sort();
}

function sumBytes(dirPath, files) {
  return files.reduce((total, fileName) => {
    const filePath = path.join(dirPath, fileName);
    return total + fs.statSync(filePath).size;
  }, 0);
}

function bytesToMb(bytes) {
  return Math.round((bytes / (1024 * 1024)) * 100) / 100;
}

const slugs = fs
  .readdirSync(BLOG_DIR)
  .filter((slug) => fs.existsSync(path.join(BLOG_DIR, slug, "content.mdx")))
  .sort();

const imageFiles = listFiles(IMAGE_DIR, ".webp");
const audioFiles = listFiles(AUDIO_DIR, ".mp3");

const imageSlugs = new Set(imageFiles.map((name) => name.replace(/\.webp$/, "")));
const audioSlugs = new Set(audioFiles.map((name) => name.replace(/\.mp3$/, "")));

const missingImages = slugs.filter((slug) => !imageSlugs.has(slug));
const missingAudio = slugs.filter((slug) => !audioSlugs.has(slug));

const ignoreImageBasenames = new Set(["default", "default-cover"]);
const orphanImages = imageFiles
  .map((name) => name.replace(/\.webp$/, ""))
  .filter((basename) => !slugs.includes(basename) && !ignoreImageBasenames.has(basename));

const orphanAudio = audioFiles
  .map((name) => name.replace(/\.mp3$/, ""))
  .filter((basename) => !slugs.includes(basename));

const imageBytes = sumBytes(IMAGE_DIR, imageFiles);
const audioBytes = sumBytes(AUDIO_DIR, audioFiles);

const report = {
  blogCount: slugs.length,
  images: {
    count: imageFiles.length,
    totalMb: bytesToMb(imageBytes),
    missingSlugs: missingImages,
    orphanBasenames: orphanImages,
  },
  audio: {
    count: audioFiles.length,
    totalMb: bytesToMb(audioBytes),
    missingSlugs: missingAudio,
    orphanBasenames: orphanAudio,
  },
};

if (jsonOutput) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log("Media Audit");
  console.log(`- Blog slugs: ${report.blogCount}`);
  console.log(`- Images: ${report.images.count} files, ${report.images.totalMb} MB`);
  console.log(`- Audio: ${report.audio.count} files, ${report.audio.totalMb} MB`);
  console.log(`- Missing images: ${report.images.missingSlugs.length}`);
  console.log(`- Missing audio: ${report.audio.missingSlugs.length}`);
  console.log(`- Orphan images: ${report.images.orphanBasenames.length}`);
  console.log(`- Orphan audio: ${report.audio.orphanBasenames.length}`);
}

let shouldFail = false;

if (failOnMissing && (missingImages.length > 0 || missingAudio.length > 0)) {
  shouldFail = true;
}

if (failOnOrphans && (orphanImages.length > 0 || orphanAudio.length > 0)) {
  shouldFail = true;
}

if (typeof maxImageMb === "number" && !Number.isNaN(maxImageMb) && report.images.totalMb > maxImageMb) {
  shouldFail = true;
  if (!jsonOutput) {
    console.error(`Image budget exceeded: ${report.images.totalMb} MB > ${maxImageMb} MB`);
  }
}

if (typeof maxAudioMb === "number" && !Number.isNaN(maxAudioMb) && report.audio.totalMb > maxAudioMb) {
  shouldFail = true;
  if (!jsonOutput) {
    console.error(`Audio budget exceeded: ${report.audio.totalMb} MB > ${maxAudioMb} MB`);
  }
}

if (shouldFail) {
  process.exit(1);
}
