import fs from "fs/promises";
import path from "path";
import glob from "fast-glob";
import { extractBlogMeta } from "../src/lib/blog-meta";

type Cache = Record<string, string[]>;

function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://lscaturchio.xyz";
  return raw.replace(/\/+$/, "");
}

function getTodayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function clampToToday(date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const today = getTodayIso();
  return date > today ? today : date;
}

function stripMdx(source: string): string {
  let s = source;
  s = s.replace(/export\s+const\s+meta\s*=\s*\{[\s\S]*?\}\s*;?\s*/m, "");
  s = s.replace(/^import\s+.*$/gm, "");
  return s;
}

function cleanUrl(u: string): string {
  let s = u.trim();
  // Drop common trailing punctuation from markdown/prose contexts.
  while (/[).,;:\]]$/.test(s)) s = s.slice(0, -1);
  return s;
}

function extractExternalLinks(mdx: string, siteUrl: string): string[] {
  const s = stripMdx(mdx);
  const out = new Set<string>();

  const patterns: Array<{ re: RegExp; group: number }> = [
    { re: /\[[^\]]*?\]\((https?:\/\/[^)\s]+)\)/g, group: 1 }, // markdown links
    { re: /href=["'](https?:\/\/[^"']+)["']/g, group: 1 }, // html links
    { re: /\bhttps?:\/\/[^\s<>"')\]]+/g, group: 0 }, // bare urls
  ];

  for (const { re, group } of patterns) {
    // Avoid iterator-based APIs (`matchAll`) because TS target is ES5.
    const rx = new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`);
    let match: RegExpExecArray | null;
    while ((match = rx.exec(s)) !== null) {
      const raw = match[group];
      if (!raw) continue;
      const cleaned = cleanUrl(raw);
      if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) continue;
      out.add(cleaned);
    }
  }

  const siteHost = new URL(siteUrl).hostname.replace(/^www\./, "");

  return Array.from(out)
    .filter((href) => {
      try {
        const url = new URL(href);
        const host = url.hostname.replace(/^www\./, "");
        if (host === siteHost) return false; // skip internal links
        return true;
      } catch {
        return false;
      }
    })
    .sort();
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length) as R[];
  let index = 0;

  const workers = Array.from({ length: Math.max(1, concurrency) }).map(async () => {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
    }
  });

  await Promise.all(workers);
  return results;
}

async function sendWebmention(params: { token: string; source: string; target: string }): Promise<{ ok: boolean; status: number; text: string }> {
  const body = new URLSearchParams({
    token: params.token,
    source: params.source,
    target: params.target,
  });

  const res = await fetch("https://webmention.io/api/mentions", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const text = await res.text().catch(() => "");
  return { ok: res.ok, status: res.status, text };
}

function parseArgs(argv: string[]): { slug?: string; dryRun: boolean } {
  const out: { slug?: string; dryRun: boolean } = { dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") out.dryRun = true;
    if (a === "--slug") out.slug = argv[i + 1];
  }
  return out;
}

async function main(): Promise<void> {
  const { slug, dryRun } = parseArgs(process.argv.slice(2));
  const token = process.env.WEBMENTION_IO_TOKEN;
  if (!token) {
    console.error("Missing WEBMENTION_IO_TOKEN. Set it to send webmentions via webmention.io.");
    process.exit(1);
  }

  const siteUrl = getSiteUrl();
  const blogRoot = path.join(process.cwd(), "src", "app", "blog");
  const blogFileNames = await glob(["*.mdx", "*/content.mdx"], { cwd: blogRoot });

  const cachePath = path.join(process.cwd(), "tmp", "webmentions-sent.json");
  const cache = (await readJsonFile<Cache>(cachePath)) ?? {};

  const targetsBySource: Array<{ source: string; slug: string; targets: string[] }> = [];

  for (const rel of blogFileNames) {
    const postSlug = rel.replace(/(\/content)?\.mdx$/, "");
    if (slug && postSlug !== slug) continue;

    const full = path.join(blogRoot, rel);
    const content = await fs.readFile(full, "utf-8");
    const meta = extractBlogMeta(content);

    // Skip posts that are future-dated in source (belt + suspenders).
    const safeDate = meta.date ? clampToToday(meta.date) : null;
    if (meta.date && safeDate && meta.date !== safeDate) {
      // Still allow sending, but avoid accidental pre-publish spam.
      continue;
    }

    const source = `${siteUrl}/blog/${postSlug}`;
    const targets = extractExternalLinks(content, siteUrl);
    if (targets.length === 0) continue;
    targetsBySource.push({ source, slug: postSlug, targets });
  }

  const jobs: Array<{ source: string; target: string }> = [];
  for (const row of targetsBySource) {
    const prev = new Set(cache[row.source] ?? []);
    for (const t of row.targets) {
      if (!prev.has(t)) jobs.push({ source: row.source, target: t });
    }
  }

  if (jobs.length === 0) {
    console.log("No new webmentions to send.");
    return;
  }

  console.log(`Found ${jobs.length} new webmentions to send${dryRun ? " (dry-run)" : ""}.`);

  let ok = 0;
  let failed = 0;

  await mapWithConcurrency(jobs, 4, async (job) => {
    if (dryRun) {
      ok++;
      return;
    }

    const res = await sendWebmention({ token, source: job.source, target: job.target });
    if (res.ok) {
      ok++;
      return;
    }
    failed++;
    console.error(`Failed: ${job.source} -> ${job.target} (${res.status})`);
  });

  // Update cache so reruns only send diffs.
  for (const row of targetsBySource) {
    cache[row.source] = row.targets;
  }
  await writeJsonFile(cachePath, cache);

  console.log(`Done. ok=${ok}, failed=${failed}. Cache: ${path.relative(process.cwd(), cachePath)}`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
