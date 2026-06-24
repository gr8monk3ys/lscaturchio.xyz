import { describe, it, expect } from "vitest";
import {
  BLOG_STAGES,
  isBlogStage,
  filterByStage,
  STAGE_LABELS,
} from "@/lib/blog-stage";

describe("isBlogStage", () => {
  it("accepts the three known stages", () => {
    expect(isBlogStage("seedling")).toBe(true);
    expect(isBlogStage("budding")).toBe(true);
    expect(isBlogStage("evergreen")).toBe(true);
  });

  it("rejects unknown strings and non-strings", () => {
    expect(isBlogStage("evergeen")).toBe(false);
    expect(isBlogStage("")).toBe(false);
    expect(isBlogStage(undefined)).toBe(false);
    expect(isBlogStage(null)).toBe(false);
    expect(isBlogStage(3)).toBe(false);
  });
});

describe("filterByStage", () => {
  const posts = [
    { slug: "a", stage: "evergreen" as const },
    { slug: "b", stage: "seedling" as const },
    { slug: "c" },
  ];

  it("narrows to the matching stage", () => {
    expect(filterByStage(posts, "evergreen").map((p) => p.slug)).toEqual(["a"]);
  });

  it("returns all posts when the stage is empty or invalid", () => {
    expect(filterByStage(posts, "")).toHaveLength(3);
    expect(filterByStage(posts, "bogus")).toHaveLength(3);
  });
});

describe("STAGE_LABELS / BLOG_STAGES", () => {
  it("has an uppercase label for every stage in order", () => {
    expect(BLOG_STAGES).toEqual(["seedling", "budding", "evergreen"]);
    for (const stage of BLOG_STAGES) {
      expect(STAGE_LABELS[stage].label).toBe(stage.toUpperCase());
      expect(STAGE_LABELS[stage].blurb.length).toBeGreaterThan(0);
    }
  });
});
