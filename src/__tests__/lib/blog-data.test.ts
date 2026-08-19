import { describe, it, expect } from "vitest";
import {
  toBlogPreview,
  clampBlogDateToToday,
  getTodayIsoDate,
  parseBlogIsoDate,
  getBlogLastModified,
  getPublishedBlogs,
  sortBlogsByDateDescending,
  getBlogStats,
  splitHomepageBlogs,
} from "@/lib/blog-data";

const base = {
  slug: "x",
  title: "T",
  description: "D",
  date: "2025-02-13",
  tags: ["a"],
  image: "/img.webp",
};

describe("toBlogPreview", () => {
  it("passes stage through when present", () => {
    expect(toBlogPreview({ ...base, stage: "evergreen" as const }).stage).toBe(
      "evergreen"
    );
  });

  it("leaves stage undefined when absent", () => {
    expect(toBlogPreview(base).stage).toBeUndefined();
  });
});

describe("clampBlogDateToToday", () => {
  it("returns past dates unchanged", () => {
    expect(clampBlogDateToToday("2020-01-01")).toBe("2020-01-01");
  });

  it("clamps future dates to today", () => {
    expect(clampBlogDateToToday("2999-01-01")).toBe(getTodayIsoDate());
  });

  it("passes malformed dates through untouched", () => {
    expect(clampBlogDateToToday("not-a-date")).toBe("not-a-date");
  });
});

describe("parseBlogIsoDate / getBlogLastModified", () => {
  it("parses ISO dates and rejects malformed ones", () => {
    expect(parseBlogIsoDate("2025-02-13")?.getUTCFullYear()).toBe(2025);
    expect(parseBlogIsoDate("13/02/2025")).toBeUndefined();
    expect(parseBlogIsoDate(undefined)).toBeUndefined();
  });

  it("prefers updated over date, then the fallback", () => {
    const fallback = new Date("2000-01-01");
    expect(
      getBlogLastModified({ date: "2025-01-01", updated: "2025-06-01" }).toISOString()
    ).toContain("2025-06-01");
    expect(getBlogLastModified({ date: "2025-01-01" }).toISOString()).toContain(
      "2025-01-01"
    );
    expect(getBlogLastModified({ date: "bad" }, fallback)).toBe(fallback);
  });
});

describe("getPublishedBlogs", () => {
  const now = new Date("2025-06-15T12:00:00Z");
  const posts = [
    { slug: "old", date: "2025-01-01" },
    { slug: "tomorrow", date: "2025-06-16" },
    { slug: "far-future", date: "2025-08-01" },
    { slug: "bad-date", date: "whenever" },
  ].map((p) => ({ ...p, title: p.slug, description: "", tags: [] }));

  it("hides far-future posts but allows a one-day grace period", () => {
    const slugs = getPublishedBlogs(posts, now).map((b) => b.slug);
    expect(slugs).toContain("old");
    expect(slugs).toContain("tomorrow"); // within the 24h grace window
    expect(slugs).not.toContain("far-future");
  });

  it("drops posts with unparseable dates and sorts newest first", () => {
    const slugs = getPublishedBlogs(posts, now).map((b) => b.slug);
    expect(slugs).not.toContain("bad-date");
    expect(slugs).toEqual(["tomorrow", "old"]);
  });
});

describe("sortBlogsByDateDescending", () => {
  it("sorts by date string without mutating the input", () => {
    const input = [{ date: "2024-01-01" }, { date: "2025-01-01" }];
    const sorted = sortBlogsByDateDescending(input);
    expect(sorted.map((b) => b.date)).toEqual(["2025-01-01", "2024-01-01"]);
    expect(input[0].date).toBe("2024-01-01");
  });
});

describe("getBlogStats", () => {
  const post = (content: string, tags: string[]) => ({
    content,
    tags,
    date: "2025-01-01",
  });

  it("computes totals, averages, and top tags", () => {
    const stats = getBlogStats([
      post("x".repeat(1000), ["ai", "labor"]),
      post("x".repeat(2500), ["ai"]),
    ]);
    // 1000 chars -> ceil(1)*5 = 5 min; 2500 -> ceil(2.5)*5 = 15 min.
    expect(stats.totalPosts).toBe(2);
    expect(stats.totalReadingTime).toBe(20);
    expect(stats.avgReadingTime).toBe(10);
    expect(stats.topTags[0]).toEqual({ tag: "ai", count: 2 });
  });

  it("caps topTags at five and handles the empty corpus", () => {
    const many = getBlogStats([
      post("x", ["a", "b", "c", "d", "e", "f", "g"]),
    ]);
    expect(many.topTags).toHaveLength(5);
    const empty = getBlogStats([]);
    expect(empty.avgReadingTime).toBe(0);
    expect(empty.topTags).toEqual([]);
  });
});

describe("splitHomepageBlogs", () => {
  const now = new Date("2025-06-15T12:00:00Z");
  const mk = (slug: string, date: string) => ({
    slug,
    title: slug,
    description: "",
    date,
    tags: [],
  });
  const posts = Array.from({ length: 15 }, (_, i) =>
    mk(`post-${i}`, `2025-05-${String(15 - i).padStart(2, "0")}`)
  );

  it("splits recent from selected without overlap", () => {
    const { recentBlogs, selectedWriting } = splitHomepageBlogs(posts, { now });
    expect(recentBlogs).toHaveLength(3);
    expect(selectedWriting).toHaveLength(8);
    const recent = new Set(recentBlogs.map((b) => b.slug));
    expect(selectedWriting.some((b) => recent.has(b.slug))).toBe(false);
  });

  it("fills in the default cover image on previews", () => {
    const { recentBlogs } = splitHomepageBlogs([mk("bare", "2025-01-01")], { now });
    expect(recentBlogs[0].image).toContain("default");
  });
});
