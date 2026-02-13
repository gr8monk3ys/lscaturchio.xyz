#!/usr/bin/env node

/**
 * Generate sleek project logo marks from GitHub repo names.
 *
 * By default this script:
 * 1. Fetches non-fork repos from GitHub user gr8monk3ys
 * 2. Builds a JSONL batch file in tmp/imagegen/
 * 3. Runs imagegen skill CLI to create /public/images/projects/logos/<slug>.webp
 *
 * Use --prepare-only to only write the jobs file.
 */

import fs from "fs";
import os from "os";
import path from "path";
import { spawnSync } from "child_process";

const ROOT = process.cwd();
const TMP_DIR = path.join(ROOT, "tmp", "imagegen");
const LOGO_DIR = path.join(ROOT, "public", "images", "projects", "logos");
const JOBS_FILE = path.join(TMP_DIR, "project-logos.jsonl");
const CODEX_HOME = process.env.CODEX_HOME || path.join(os.homedir(), ".codex");
const IMAGE_GEN_CLI = path.join(CODEX_HOME, "skills", "imagegen", "scripts", "image_gen.py");
const GITHUB_REPOS_URL = "https://api.github.com/users/gr8monk3ys/repos";

const args = new Set(process.argv.slice(2));
const prepareOnly = args.has("--prepare-only");
const force = args.has("--force");
const onlyMissing = args.has("--only-missing");

function getArgValue(flag, fallback) {
  const values = process.argv.slice(2);
  const index = values.findIndex((value) => value === flag);
  if (index === -1) return fallback;
  const next = values[index + 1];
  if (!next || next.startsWith("--")) return fallback;
  return next;
}

const model = getArgValue("--model", "gpt-image-1.5");
const size = getArgValue("--size", "1024x1024");
const quality = getArgValue("--quality", "low");

function slugify(value) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

async function fetchRepos() {
  const response = await fetch(GITHUB_REPOS_URL, {
    headers: { Accept: "application/vnd.github.v3+json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch repos (${response.status})`);
  }

  const repos = await response.json();
  return repos.filter((repo) => !repo.fork);
}

function createJob(repo) {
  const slug = slugify(repo.name);
  return {
    prompt: `Design a modern product logo symbol for the software project \"${repo.name}\". Make it recognizable as a standalone brand mark.`,
    out: `${slug}.webp`,
    use_case: "logo-brand-mark",
    subject: `Software project logo for ${repo.name}`,
    style:
      "Modern geometric vector logo, crisp edges, premium startup branding, clean shapes, subtle depth through layered forms",
    composition:
      "Centered mark with generous negative space, balanced symmetry, square canvas optimized for app icon use",
    palette:
      "Cool contemporary palette using deep navy, electric blue, violet, and neutral accents",
    constraints:
      "No text, letters, numbers, mascots, screenshots, UI mockups, or watermarks. Must read clearly at small sizes.",
    negative:
      "photorealism, noisy texture, cluttered details, gradients that reduce legibility, stock illustration style",
  };
}

function writeJobs(jobs) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
  fs.writeFileSync(JOBS_FILE, jobs.map((job) => JSON.stringify(job)).join("\n") + "\n", "utf-8");
}

function runGeneration() {
  if (!fs.existsSync(IMAGE_GEN_CLI)) {
    throw new Error(`Image generation CLI not found at ${IMAGE_GEN_CLI}`);
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set. Set it in your shell and rerun this script.");
  }

  fs.mkdirSync(LOGO_DIR, { recursive: true });

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
    LOGO_DIR,
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

  if (force) {
    cmdArgs.push("--force");
  }

  const result = spawnSync("uv", cmdArgs, {
    cwd: ROOT,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`Logo generation failed with exit code ${result.status}`);
  }
}

async function main() {
  const repos = await fetchRepos();
  const jobs = repos
    .map(createJob)
    .filter((job) => {
      if (!onlyMissing) return true;
      return !fs.existsSync(path.join(LOGO_DIR, job.out));
    });

  if (jobs.length === 0) {
    console.log("No logo jobs to run.");
    return;
  }

  writeJobs(jobs);
  console.log(`Prepared ${jobs.length} logo jobs: ${JOBS_FILE}`);

  if (prepareOnly) {
    console.log("Prepare-only mode enabled. No generation was run.");
    return;
  }

  runGeneration();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
