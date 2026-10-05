import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import { createEssayCatalogue } from "@/lib/getAllBlogs";
import { calculateReadingTime } from "@/lib/reading-time";

/**
 * The catalogue's interface, exercised through the real read path: a fixture
 * tree on disk, glob, `extractBlogMeta`, the clamp. The clock and the essay
 * root are injected, so nothing here mocks `process.cwd` or the date.
 *
 * Every default query must leave the scheduled post out. That one property is
 * what used to be re-checked route by route (RSS, sitemap, /api/posts), and
 * forgotten on eleven others.
 */

const NOW = new Date("2026-06-15T12:00:00Z");
const TODAY = "2026-06-15";

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "essay-catalogue-"));

interface FixturePost {
  slug: string;
  date: string;
  tags?: string[];
  series?: string;
  seriesOrder?: number;
  words?: number;
}

function writePost({ slug, date, tags = [], series, seriesOrder, words = 400 }: FixturePost) {
  const dir = path.join(tmpRoot, slug);
  fs.mkdirSync(dir, { recursive: true });
  const meta = [
    "export const meta = {",
    `  title: "${slug}",`,
    `  description: "d",`,
    `  date: "${date}",`,
    `  tags: ${JSON.stringify(tags)},`,
    series ? `  series: "${series}",` : "",
    seriesOrder ? `  seriesOrder: ${seriesOrder},` : "",
    "};",
  ].filter(Boolean);
  fs.writeFileSync(
    path.join(dir, "content.mdx"),
    [...meta, "", "word ".repeat(words), ""].join("\n"),
    "utf-8"
  );
}

function catalogue() {
  return createEssayCatalogue({ blogDir: tmpRoot, now: () => NOW });
}

beforeAll(() => {
  writePost({ slug: "old-politics", date: "2026-01-10", tags: ["Politics"], series: "S", seriesOrder: 2, words: 1000 });
  writePost({ slug: "new-philosophy", date: "2026-05-01", tags: ["philosophy", "politics"], series: "S", seriesOrder: 1, words: 2200 });
  writePost({ slug: "untagged", date: "2026-03-01", tags: ["nonsense"] });
  // Within the 24h grace window, so live.
  writePost({ slug: "tomorrow", date: "2026-06-16", tags: ["economics"] });
  // Scheduled: carries a tag, a theme and a series that live posts also use.
  writePost({ slug: "scheduled", date: "2026-07-01", tags: ["politics", "scheduled-only"], series: "S", seriesOrder: 3 });
  writePost({ slug: "bad-date", date: "whenever", tags: ["politics"] });
});

afterAll(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

const slugs = (posts: Array<{ slug: string }>) => posts.map((p) => p.slug);

describe("getAllBlogs", () => {
  it("answers published essays only, newest first", async () => {
    expect(slugs(await catalogue().getAllBlogs())).toEqual([
      "tomorrow",
      "new-philosophy",
      "untagged",
      "old-politics",
    ]);
  });

  it("includes scheduled essays only when asked", async () => {
    const all = await catalogue().getAllBlogs({ includeScheduled: true });

    expect(slugs(all)).toContain("scheduled");
    expect(slugs(all)).toContain("bad-date");
    expect(all.find((b) => b.slug === "scheduled")?.published).toBe(false);
  });

  it("decides publication from the raw date, before the display clamp", async () => {
    const all = await catalogue().getAllBlogs({ includeScheduled: true });
    const scheduled = all.find((b) => b.slug === "scheduled");

    // The clamp, against the injected clock, still gives a sane display date,
    // which is exactly why the date can no longer answer "is it live?".
    expect(scheduled?.date).toBe(TODAY);
    expect(scheduled?.published).toBe(false);
  });

  it("judges publication against the injected clock", async () => {
    const later = createEssayCatalogue({
      blogDir: tmpRoot,
      now: () => new Date("2026-07-02T00:00:00Z"),
    });

    expect(slugs(await later.getAllBlogs())).toContain("scheduled");
  });

  it("computes reading time once, with the formula the API reports", async () => {
    const post = (await catalogue().getAllBlogs()).find((b) => b.slug === "untagged")!;

    expect(post.readingTimeMinutes).toBe(calculateReadingTime(post.content).minutes);
    expect(post.words).toBe(calculateReadingTime(post.content).words);
  });
});

describe("getBlogsByTag", () => {
  it("matches case-insensitively and trims, published only", async () => {
    const c = catalogue();

    expect(slugs(await c.getBlogsByTag("politics"))).toEqual(["new-philosophy", "old-politics"]);
    expect(slugs(await c.getBlogsByTag("  POLITICS "))).toEqual(["new-philosophy", "old-politics"]);
  });

  it("finds nothing for a tag only a scheduled essay carries", async () => {
    expect(await catalogue().getBlogsByTag("scheduled-only")).toEqual([]);
    expect(await catalogue().getBlogsByTag("")).toEqual([]);
  });
});

describe("getBlogsInTheme", () => {
  it("uses all-themes membership: any matching tag counts", async () => {
    const c = catalogue();

    // new-philosophy's first tag is philosophy, so its primary theme is
    // philosophy-self, but it still belongs to the politics hub.
    expect(slugs(await c.getBlogsInTheme("power-institutions"))).toEqual([
      "new-philosophy",
      "old-politics",
    ]);
    expect(slugs(await c.getBlogsInTheme("philosophy-self"))).toEqual(["new-philosophy"]);
  });

  it("leaves scheduled essays out", async () => {
    const inTheme = await catalogue().getBlogsInTheme("power-institutions");
    expect(slugs(inTheme)).not.toContain("scheduled");
  });
});

describe("listSeries", () => {
  it("groups published essays in reading order with real reading-time totals", async () => {
    const all = await catalogue().getAllBlogs();
    const minutes = (slug: string) => all.find((b) => b.slug === slug)!.readingTimeMinutes;

    const [series] = await catalogue().listSeries();

    expect(series.name).toBe("S");
    expect(slugs(series.posts)).toEqual(["new-philosophy", "old-politics"]);
    expect(series.totalPosts).toBe(2);
    expect(series.totalReadingTime).toBe(minutes("new-philosophy") + minutes("old-politics"));
    // Not the old flat five minutes a post.
    expect(series.totalReadingTime).not.toBe(series.totalPosts * 5);
  });
});

describe("getReadingTimeMinutes", () => {
  it("resolves a scheduled essay, because its route renders", async () => {
    const minutes = await catalogue().getReadingTimeMinutes("scheduled");
    expect(minutes).toBeGreaterThan(0);
  });

  it("is undefined for a slug with no source", async () => {
    expect(await catalogue().getReadingTimeMinutes("nope")).toBeUndefined();
  });
});
