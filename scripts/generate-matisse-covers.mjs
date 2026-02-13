#!/usr/bin/env node

/**
 * Generate Henri Matisse-style blog cover images and update blog metadata.
 *
 * By default this script:
 * 1. Builds a JSONL batch prompt file in tmp/imagegen/
 * 2. Calls the imagegen skill CLI for generation
 * 3. Rewrites image paths in content.mdx and page.tsx to /images/blog/<slug>.webp
 *
 * Use --prepare-only to only write the JSONL file.
 */

import fs from "fs";
import path from "path";
import os from "os";
import { spawnSync } from "child_process";

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, "src", "app", "blog");
const BLOG_IMAGE_DIR = path.join(ROOT, "public", "images", "blog");
const TMP_DIR = path.join(ROOT, "tmp", "imagegen");
const JOBS_FILE = path.join(TMP_DIR, "matisse-covers.jsonl");
const CODEX_HOME = process.env.CODEX_HOME || path.join(os.homedir(), ".codex");
const IMAGE_GEN_CLI = path.join(CODEX_HOME, "skills", "imagegen", "scripts", "image_gen.py");

const args = new Set(process.argv.slice(2));
const prepareOnly = args.has("--prepare-only");
const updateOnly = args.has("--update-only");
const keepJobs = args.has("--keep-jobs");
const force = args.has("--force");
const onlyMissing = args.has("--only-missing");
const failFast = args.has("--fail-fast");
const allowMetadataMiss = args.has("--allow-metadata-miss");

function getArgValue(flag, fallback) {
  const values = process.argv.slice(2);
  const index = values.findIndex((value) => value === flag);
  if (index === -1) return fallback;
  const next = values[index + 1];
  if (!next || next.startsWith("--")) return fallback;
  return next;
}

const model = getArgValue("--model", "gpt-image-1.5");
const size = getArgValue("--size", "1536x1024");
const quality = getArgValue("--quality", "low");

function extractTitle(content) {
  const match = content.match(/title:\s*["'`]([^"'`]+)["'`]/);
  return match ? match[1] : null;
}

function getBlogEntries() {
  const entries = fs.readdirSync(BLOG_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) => fs.existsSync(path.join(BLOG_DIR, slug, "content.mdx")))
    .sort();
}

function buildJobs(slugs) {
  const jobs = [];

  for (const slug of slugs) {
    if (onlyMissing) {
      const existingImage = path.join(BLOG_IMAGE_DIR, `${slug}.webp`);
      if (fs.existsSync(existingImage)) {
        continue;
      }
    }

    const contentPath = path.join(BLOG_DIR, slug, "content.mdx");
    const content = fs.readFileSync(contentPath, "utf-8");
    const title = extractTitle(content) || slug;

    jobs.push({
      prompt: `Create an abstract visual interpretation of the blog title "${title}" using symbolic forms and emotional color.`,
      out: `${slug}.webp`,
      use_case: "illustration-story",
      subject: `Blog title concept: ${title}`,
      style:
        "Henri Matisse-inspired cut-paper collage illustration, flat organic shapes, hand-cut edges, gouache paper texture",
      composition:
        "Horizontal editorial cover art, strong focal hierarchy, layered forms, breathing room for responsive crop",
      palette:
        "Mediterranean-inspired palette with deep blues, warm terracotta, muted cream, and botanical green accents",
      constraints:
        "No text, letters, numbers, logos, signatures, or watermarks. Keep composition clean and expressive.",
      negative:
        "photorealistic, 3D render, glossy gradients, UI elements, stock photo look, oversharpened details",
    });
  }

  return jobs;
}

function writeJobsFile(jobs) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
  const lines = jobs.map((job) => JSON.stringify(job));
  fs.writeFileSync(JOBS_FILE, lines.join("\n") + "\n", "utf-8");
}

function runGeneration() {
  if (!fs.existsSync(IMAGE_GEN_CLI)) {
    throw new Error(`Image generation CLI not found at ${IMAGE_GEN_CLI}`);
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is not set. Set it in your shell and rerun this script."
    );
  }

  fs.mkdirSync(BLOG_IMAGE_DIR, { recursive: true });

  const cmdArgs = [
    "run",
    "--with",
    "openai",
    "python3",
    IMAGE_GEN_CLI,
    "generate-batch",
    "--input",
    JOBS_FILE,
    "--out-dir",
    BLOG_IMAGE_DIR,
    "--size",
    size,
    "--quality",
    quality,
    "--model",
    model,
    "--output-format",
    "webp",
    "--concurrency",
    "3",
  ];

  if (failFast) {
    cmdArgs.push("--fail-fast");
  }

  if (force) {
    cmdArgs.push("--force");
  }

  const result = spawnSync("uv", cmdArgs, {
    cwd: ROOT,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`Image generation failed with exit code ${result.status}`);
  }
}

function replaceImageField(filePath, imagePath) {
  if (!fs.existsSync(filePath)) {
    return { status: "missing-file" };
  }

  const original = fs.readFileSync(filePath, "utf-8");
  const imageFieldRegex = /image:\s*["'`][^"'`]+["'`]/;

  if (!imageFieldRegex.test(original)) {
    return { status: "missing-field" };
  }

  const updated = original.replace(imageFieldRegex, `image: "${imagePath}"`);

  if (updated !== original) {
    fs.writeFileSync(filePath, updated, "utf-8");
    return { status: "updated" };
  }

  return { status: "already-set" };
}

function updateMetadataForGeneratedImages(slugs) {
  let updatedFiles = 0;
  let missingImages = 0;
  const metadataMisses = [];

  for (const slug of slugs) {
    const imagePath = `/images/blog/${slug}.webp`;
    const imageFilePath = path.join(BLOG_IMAGE_DIR, `${slug}.webp`);

    if (!fs.existsSync(imageFilePath)) {
      missingImages++;
      continue;
    }

    const contentPath = path.join(BLOG_DIR, slug, "content.mdx");
    const pagePath = path.join(BLOG_DIR, slug, "page.tsx");

    const contentResult = replaceImageField(contentPath, imagePath);
    if (contentResult.status === "updated") updatedFiles++;
    if (contentResult.status !== "updated" && contentResult.status !== "already-set") {
      metadataMisses.push(`${slug}/content.mdx (${contentResult.status})`);
    }

    const pageResult = replaceImageField(pagePath, imagePath);
    if (pageResult.status === "updated") updatedFiles++;
    if (pageResult.status !== "updated" && pageResult.status !== "already-set") {
      metadataMisses.push(`${slug}/page.tsx (${pageResult.status})`);
    }
  }

  return { updatedFiles, missingImages, metadataMisses };
}

function assertMetadataRewriteSucceeded(metadataMisses) {
  if (metadataMisses.length === 0) return;

  if (allowMetadataMiss) {
    console.warn(
      `Warning: ${metadataMisses.length} metadata files were not updated due to missing image fields/files.`
    );
    return;
  }

  const preview = metadataMisses.slice(0, 10).map((entry) => `  - ${entry}`).join("\n");
  const remainder =
    metadataMisses.length > 10
      ? `\n  ...and ${metadataMisses.length - 10} more`
      : "";

  throw new Error(
    `Metadata rewrite failed for ${metadataMisses.length} file(s):\n${preview}${remainder}\nRe-run with --allow-metadata-miss to ignore these failures.`
  );
}

function cleanup() {
  if (!keepJobs && fs.existsSync(JOBS_FILE)) {
    fs.unlinkSync(JOBS_FILE);
  }
}

async function main() {
  const slugs = getBlogEntries();
  const jobs = buildJobs(slugs);
  if (jobs.length === 0) {
    console.log("No image jobs to run.");
    if (updateOnly || onlyMissing) {
      const { updatedFiles, missingImages, metadataMisses } = updateMetadataForGeneratedImages(slugs);
      console.log(`Updated ${updatedFiles} metadata files.`);
      if (missingImages > 0) {
        console.log(
          `Skipped ${missingImages} blog entries because generated images were not found in public/images/blog/.`
        );
      }
      assertMetadataRewriteSucceeded(metadataMisses);
    }
    return;
  }
  writeJobsFile(jobs);

  console.log(`Prepared ${jobs.length} image jobs: ${JOBS_FILE}`);

  if (prepareOnly) {
    console.log("Prepare-only mode enabled. No generation or metadata updates were run.");
    return;
  }

  if (!updateOnly) {
    runGeneration();
  }

  const { updatedFiles, missingImages, metadataMisses } = updateMetadataForGeneratedImages(slugs);
  console.log(`Updated ${updatedFiles} metadata files.`);

  if (missingImages > 0) {
    console.log(
      `Skipped ${missingImages} blog entries because generated images were not found in public/images/blog/.`
    );
  }
  assertMetadataRewriteSucceeded(metadataMisses);

  cleanup();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
