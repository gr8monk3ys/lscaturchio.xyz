import { describe, it, expect } from "vitest";
import {
  toBlogPreview,
  clampBlogDateToToday,
  getTodayIsoDate,
  parseBlogIsoDate,
  getBlogLastModified,
  getPublishedBlogs,
  isBlogPublished,
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

describe("isBlogPublished", () => {
  const now = new Date("2025-06-15T12:00:00Z");

  it("publishes past dates and the one-day grace window, but not beyond", () => {
    expect(isBlogPublished("2025-01-01", now)).toBe(true);
    expect(isBlogPublished("2025-06-16", now)).toBe(true); // within 24h grace
    expect(isBlogPublished("2025-08-01", now)).toBe(false);
  });

  it("treats an unparseable date as unpublished", () => {
    expect(isBlogPublished("whenever", now)).toBe(false);
  });
});

describe("getPublishedBlogs", () => {
  const posts = [
    { slug: "old", date: "2025-01-01", published: true },
    { slug: "newer", date: "2025-06-01", published: true },
    { slug: "far-future", date: "2025-08-01", published: false },
  ];

  it("filters on the flag decided at the read seam, newest first", () => {
    expect(getPublishedBlogs(posts).map((b) => b.slug)).toEqual(["newer", "old"]);
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
  const post = (readingTimeMinutes: number, tags: string[]) => ({
    readingTimeMinutes,
    words: readingTimeMinutes * 200,
    tags,
  });

  it("sums the reading time already on the record rather than re-deriving it", () => {
    const stats = getBlogStats([post(5, ["ai", "labor"]), post(15, ["ai"])]);
    expect(stats.totalPosts).toBe(2);
    expect(stats.totalReadingTime).toBe(20);
    expect(stats.avgReadingTime).toBe(10);
    expect(stats.topTags[0]).toEqual({ tag: "ai", count: 2 });
  });

  it("caps topTags at five and handles the empty corpus", () => {
    const many = getBlogStats([
      post(1, ["a", "b", "c", "d", "e", "f", "g"]),
    ]);
    expect(many.topTags).toHaveLength(5);
    const empty = getBlogStats([]);
    expect(empty.avgReadingTime).toBe(0);
    expect(empty.topTags).toEqual([]);
  });
});

describe("splitHomepageBlogs", () => {
  const mk = (slug: string, date: string, published = true) => ({
    slug,
    title: slug,
    description: "",
    date,
    tags: [],
    published,
  });
  const posts = [
    ...Array.from({ length: 15 }, (_, i) =>
      mk(`post-${i}`, `2025-05-${String(15 - i).padStart(2, "0")}`)
    ),
    mk("unpublished", "2999-01-01", false),
  ];

  it("gives both homepage sections the same published set", () => {
    const { recentBlogs, publishedBlogs } = splitHomepageBlogs(posts);
    expect(publishedBlogs).toHaveLength(15);
    expect(publishedBlogs.map((b) => b.slug)).not.toContain("unpublished");
    expect(recentBlogs).toEqual(publishedBlogs.slice(0, 3));
  });

  it("fills in the default cover image on previews", () => {
    const { recentBlogs } = splitHomepageBlogs([mk("bare", "2025-01-01")]);
    expect(recentBlogs[0].image).toContain("default");
  });
});
