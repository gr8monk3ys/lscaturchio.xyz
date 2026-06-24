import { describe, it, expect } from "vitest";
import { toBlogPreview } from "@/lib/blog-data";

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
