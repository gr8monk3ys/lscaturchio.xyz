import { describe, it, expect } from "vitest";
import {
  buildCorpusDocument,
  corpusFileName,
  mdxToPlainMarkdown,
  slugFromCorpusFileName,
} from "@/lib/retrieval-corpus";
import { extractBlogMeta } from "@/lib/blog-meta";

const SAMPLE_MDX = `export const meta = {
  title: "Abolition Isn't What You Think",
  description: "It's a claim about what actually works.",
  date: "2026-02-08",
  tags: ["politics", "justice"],
  stage: "evergreen",
};

<AssumedAudience>
  Readers who assume the worst.
</AssumedAudience>

## The Straw Man

Some *markdown* body text.

\`\`\`ts
import { useState } from 'react';
export const meta = { fenced: true };
<CustomComponent prop="value" />
\`\`\`

Closing paragraph.
`;

describe("mdxToPlainMarkdown", () => {
  const result = mdxToPlainMarkdown(SAMPLE_MDX);

  it("removes the meta export block", () => {
    expect(result).not.toContain("export const meta = {\n  title");
    expect(result).not.toContain('date: "2026-02-08"');
  });

  it("removes JSX tag lines but keeps their inner content", () => {
    expect(result).not.toContain("<AssumedAudience>");
    expect(result).not.toContain("</AssumedAudience>");
    expect(result).toContain("Readers who assume the worst.");
  });

  it("leaves fenced code blocks untouched", () => {
    expect(result).toContain("import { useState } from 'react';");
    expect(result).toContain("export const meta = { fenced: true };");
    expect(result).toContain('<CustomComponent prop="value" />');
  });

  it("keeps markdown structure", () => {
    expect(result).toContain("## The Straw Man");
    expect(result).toContain("Some *markdown* body text.");
    expect(result).toContain("Closing paragraph.");
  });

  it("removes top-level import lines outside fences", () => {
    const withImport = `import { Thing } from "@/components/thing";\n\nBody.`;
    expect(mdxToPlainMarkdown(withImport)).toBe("Body.");
  });

  it("collapses runs of blank lines left by stripping", () => {
    expect(result).not.toMatch(/\n{3,}/);
  });
});

describe("buildCorpusDocument", () => {
  it("uses the full parsed title — apostrophes must not truncate it", () => {
    // Regression: the hand-made corpus had "# Abolition Isn" because the
    // title was cut at the apostrophe. extractBlogMeta parses with the TS
    // compiler, so the full string survives.
    const meta = extractBlogMeta(SAMPLE_MDX);
    expect(meta.title).toBe("Abolition Isn't What You Think");
    const doc = buildCorpusDocument(meta.title as string, SAMPLE_MDX);
    expect(doc.startsWith("# Abolition Isn't What You Think\n\n")).toBe(true);
    expect(doc.endsWith("\n")).toBe(true);
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
