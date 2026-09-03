import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/admin/slugify";
import {
  serializeMeta,
  parseMeta,
  extractBody,
  buildContentMdx,
  buildPageTsx,
  validateMdx,
  type PostMeta,
} from "@/lib/admin/blog-content";

const meta: PostMeta = {
  title: 'Testing "Quotes" & Ampersands',
  description: "A post.",
  date: "2026-08-14",
  image: "/images/blog/testing-quotes-ampersands.webp",
  tags: ["testing", "meta"],
  series: "The Test Series",
  seriesOrder: 2,
  stage: "seedling",
};

describe("slugify", () => {
  it("lowercases, strips punctuation, hyphenates", () => {
    expect(slugify('Testing "Quotes" & Ampersands!')).toBe("testing-quotes-ampersands");
  });
  it("collapses repeats and trims hyphens", () => {
    expect(slugify("--Hello   World--")).toBe("hello-world");
  });
});

describe("meta round-trip", () => {
  it("serializeMeta -> parseMeta is identity", () => {
    const mdx = buildContentMdx(meta, "## Hello\n\nBody text.");
    expect(parseMeta(mdx)).toEqual(meta);
    expect(extractBody(mdx)).toBe("## Hello\n\nBody text.");
  });

  it("omits absent optional fields", () => {
    const minimal: PostMeta = {
      title: "T",
      description: "D",
      date: "2026-01-01",
      tags: [],
    };
    const block = serializeMeta(minimal);
    expect(block).not.toContain("series");
    expect(block).not.toContain("image");
    expect(parseMeta(buildContentMdx(minimal, "x"))).toEqual(minimal);
  });

  it("parses an existing real-shaped post meta", () => {
    const source = `export const meta = {
  title: "Abolition Isn't What You Think",
  description: "Abolition is not the absence of safety.",
  date: "2026-01-31",
  image: "/images/blog/abolition.webp",
  tags: ["politics", "justice"],
  series: "The Carceral State",
  seriesOrder: 8,
  stage: "budding",
}

## Body
`;
    expect(parseMeta(source)?.title).toBe("Abolition Isn't What You Think");
    expect(parseMeta(source)?.seriesOrder).toBe(8);
  });

  it("returns null for a meta block it cannot parse", () => {
    expect(parseMeta("export const meta = {\n  title: someVariable,\n}\n")).toBeNull();
  });
});

describe("buildPageTsx", () => {
  it("embeds the slug in the blog path", () => {
    expect(buildPageTsx("my-post")).toContain('"/blog/my-post"');
  });

  it("hands the slug to BlogLayout so the shell never re-derives it", () => {
    expect(buildPageTsx("my-post")).toContain('<BlogLayout meta={meta} slug="my-post">');
  });
});

describe("validateMdx", () => {
  it("accepts valid mdx", async () => {
    expect((await validateMdx(buildContentMdx(meta, "# ok"))).ok).toBe(true);
  });
  it("rejects broken jsx with an error message", async () => {
    const result = await validateMdx("<Unclosed");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.length).toBeGreaterThan(0);
  });
});
