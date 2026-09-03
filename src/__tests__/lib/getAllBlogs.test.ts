import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import {
  getPublishedBlogs,
  getTodayIsoDate,
  getBlogStats,
  splitHomepageBlogs,
} from "@/lib/blog-data";
import { calculateReadingTime } from "@/lib/reading-time";

/**
 * These tests go through the real read path — a fixture tree on disk, glob,
 * `extractBlogMeta`, the clamp — instead of hand-built records. The previous
 * suite tested the pure filter past the seam production actually uses, so a
 * future-dated post could be clamped to today upstream and the publication
 * filter downstream would still report green.
 */

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "blog-read-path-"));
const blogDir = path.join(tmpRoot, "src", "app", "blog");

function isoOffset(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function writePost(slug: string, date: string, body = "word ".repeat(400)) {
  const dir = path.join(blogDir, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "content.mdx"),
    [
      "export const meta = {",
      `  title: "${slug}",`,
      `  description: "d",`,
      `  date: "${date}",`,
      `  tags: ["fixture"],`,
      "};",
      "",
      body,
      "",
    ].join("\n"),
    "utf-8"
  );
}

async function loadBlogs() {
  // getAllBlogs caches at module scope for 60s; a fresh module per call keeps
  // the fixtures honest.
  vi.resetModules();
  const { getAllBlogs } = await import("@/lib/getAllBlogs");
  return getAllBlogs();
}

beforeAll(() => {
  writePost("past-post", isoOffset(-30));
  writePost("tomorrow-post", isoOffset(1));
  writePost("far-future-post", "2999-01-01");
  writePost("bad-date-post", "whenever");
  vi.spyOn(process, "cwd").mockReturnValue(tmpRoot);
});

afterAll(() => {
  vi.restoreAllMocks();
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

describe("getAllBlogs read seam", () => {
  it("decides publication from the raw date, before the display clamp", async () => {
    const blogs = await loadBlogs();
    const far = blogs.find((b) => b.slug === "far-future-post");

    expect(far).toBeDefined();
    // The clamp still runs, so a mis-dated post renders a sane date...
    expect(far?.date).toBe(getTodayIsoDate());
    // ...and that is exactly why the date can no longer answer "is it live?".
    // The flag was computed from "2999-01-01".
    expect(far?.published).toBe(false);
  });

  it("hides a far-future post from the published list, keeps the grace window", async () => {
    const slugs = getPublishedBlogs(await loadBlogs()).map((b) => b.slug);

    expect(slugs).toContain("past-post");
    expect(slugs).toContain("tomorrow-post"); // within the 24h grace period
    expect(slugs).not.toContain("far-future-post");
    expect(slugs).not.toContain("bad-date-post");
  });

  it("gives both homepage sections the same published set", async () => {
    const { recentBlogs, publishedBlogs } = splitHomepageBlogs(await loadBlogs());
    const published = new Set(publishedBlogs.map((b) => b.slug));

    expect(published.has("far-future-post")).toBe(false);
    expect(recentBlogs.every((b) => published.has(b.slug))).toBe(true);
  });

  it("computes reading time once, with the same formula the API reports", async () => {
    const blogs = await loadBlogs();
    const post = blogs.find((b) => b.slug === "past-post");

    expect(post?.readingTimeMinutes).toBe(calculateReadingTime(post!.content).minutes);
    expect(post?.words).toBe(calculateReadingTime(post!.content).words);
  });

  it("sums the same per-post minutes into the stats endpoint's totals", async () => {
    const blogs = await loadBlogs();
    const stats = getBlogStats(blogs);

    expect(stats.totalReadingTime).toBe(
      blogs.reduce((total, b) => total + b.readingTimeMinutes, 0)
    );
  });
});
