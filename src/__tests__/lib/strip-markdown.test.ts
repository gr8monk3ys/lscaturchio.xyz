import { describe, it, expect } from "vitest";
import { stripMarkdown } from "@/lib/strip-markdown";

/**
 * The two cases in the first three tests are verbatim from `/lab`: a design
 * review found the semantic-search demo printing raw MDX in its result
 * snippets, on the one page whose whole job is to show that the author can
 * build retrieval.
 */
describe("stripMarkdown", () => {
  it("removes an ATX heading hash, the observed defect", () => {
    expect(
      stripMarkdown("# Building RAG Systems in Production People who've shipped…")
    ).toBe("Building RAG Systems in Production People who've shipped…");
  });

  it("removes a heading that arrives mid-string, not at a line start", () => {
    // The line-anchored version shipped and /lab still printed this, because
    // the corpus reaches the client collapsed onto one line.
    expect(stripMarkdown("I editorialize. ## Where RAG comes from next")).toBe(
      "I editorialize. Where RAG comes from next"
    );
  });

  it("leaves a hash that is not a heading alone", () => {
    expect(stripMarkdown("Written in C# for issue #1.")).toBe("Written in C# for issue #1.");
  });

  it("removes an UNMATCHED code fence", () => {
    // The likelier case by far, and the one that shipped: a snippet is a window
    // cut out of the middle of a document, so its fence usually has no partner.
    expect(stripMarkdown("``` The result is that vague queries still land…")).toBe(
      "The result is that vague queries still land…"
    );
  });

  it("removes a matched fence and everything inside it", () => {
    expect(stripMarkdown("before ```const x = 1``` after")).toBe("before after");
  });

  it("keeps the text of links and images, drops the syntax", () => {
    expect(stripMarkdown("Read [this one](/blog/x) and ![a chart](/c.png).")).toBe(
      "Read this one and a chart."
    );
  });

  it("unwraps bold, italics and inline code", () => {
    expect(stripMarkdown("Read **the essay** and _then_ `npm run x`.")).toBe(
      "Read the essay and then npm run x."
    );
  });

  it("strips blockquote and list markers", () => {
    expect(stripMarkdown("> A quote")).toBe("A quote");
    expect(stripMarkdown("- one\n- two")).toBe("one two");
    expect(stripMarkdown("1. first\n2. second")).toBe("first second");
  });

  it("collapses whitespace and trims", () => {
    expect(stripMarkdown("  a   b \n c  ")).toBe("a b c");
  });

  it("leaves ordinary prose untouched", () => {
    const prose = "Institutions are built to do what they actually do.";
    expect(stripMarkdown(prose)).toBe(prose);
  });

  it("does not mangle an em dash, a hyphen or an apostrophe", () => {
    // The list-marker rule matches `-` only at line start followed by a space,
    // so a mid-sentence hyphen has to survive.
    expect(stripMarkdown("A well-known case — and one it can't drop.")).toBe(
      "A well-known case — and one it can't drop."
    );
  });

  it("returns an empty string for empty input", () => {
    expect(stripMarkdown("")).toBe("");
    expect(stripMarkdown("   ")).toBe("");
  });
});
