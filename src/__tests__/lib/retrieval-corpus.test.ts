import { describe, it, expect } from "vitest";
import {
  buildCorpusDocument,
  corpusFileName,
  slugFromCorpusFileName,
} from "@/lib/retrieval-corpus";
import { parseMetaExport } from "@/lib/blog-meta";

// How the body is derived from MDX is pinned in essay-sources.test.ts; the
// corpus only wraps it.

describe("buildCorpusDocument", () => {
  it("uses the full parsed title — apostrophes must not truncate it", () => {
    // Regression: the hand-made corpus had "# Abolition Isn" because the
    // title was cut at the apostrophe. parseMetaExport parses with the TS
    // compiler, so the full string survives.
    const { meta } = parseMetaExport(
      `export const meta = {\n  title: "Abolition Isn't What You Think",\n};\n`
    );
    expect(meta.title).toBe("Abolition Isn't What You Think");
    const doc = buildCorpusDocument(meta.title as string, "## The Straw Man\n\nBody.");
    expect(doc).toBe("# Abolition Isn't What You Think\n\n## The Straw Man\n\nBody.\n");
  });
});

describe("corpus file naming", () => {
  it("round-trips slug <-> file name", () => {
    expect(corpusFileName("borders-are-new")).toBe("blog-borders-are-new.md");
    expect(slugFromCorpusFileName("blog-borders-are-new.md")).toBe("borders-are-new");
  });

  it("ignores non-corpus files", () => {
    expect(slugFromCorpusFileName("about.md")).toBeNull();
    expect(slugFromCorpusFileName("blog-notes.txt")).toBeNull();
  });
});
