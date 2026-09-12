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

  it("removes an UNMATCHED code fence, and its language tag with it", () => {
    // The likelier case by far, and the one that shipped: a snippet is a window
    // cut out of the middle of a document, so its fence usually has no partner.
    expect(stripMarkdown("``` The result is that vague queries still land…")).toBe(
      "The result is that vague queries still land…"
    );
    // An opening fence carries a language, which was left sitting inline as if
    // it were prose: the live demo read "} python class AIService: …".
    expect(stripMarkdown("```python class AIService: pass")).toBe("class AIService: pass");
    // …including when the newline between fence and tag flattened to a space.
    expect(stripMarkdown("``` python class AIService: pass")).toBe("class AIService: pass");
    // But a capitalised sentence after a bare fence is prose, not a language.
    expect(stripMarkdown("``` The result is that vague queries still land…")).toBe(
      "The result is that vague queries still land…"
    );
    // And a lowercase ordinary word is not a language either.
    expect(stripMarkdown("``` the audit only checks what it can reach")).toBe(
      "the audit only checks what it can reach"
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

  it("unwraps asterisk emphasis and inline code, and leaves underscores alone", () => {
    expect(stripMarkdown("Read **the essay** and *then* `npm run x`.")).toBe(
      "Read the essay and then npm run x."
    );
  });

  it("leaves underscores inside identifiers alone", () => {
    // A /lab snippet rendered `def init(self, privacymode="strict"): self.
    // privacymode = privacymode` — that is `__init__`, `privacy_mode` and
    // `local_inference` with their underscores eaten by the italics rule.
    expect(stripMarkdown("def __init__(self, privacy_mode): self.local_inference(x)")).toBe(
      "def __init__(self, privacy_mode): self.local_inference(x)"
    );
    expect(stripMarkdown("a snake_case name and MAX_RETRIES")).toBe(
      "a snake_case name and MAX_RETRIES"
    );
  });

  it("leaves underscore emphasis markers visible, by design", () => {
    // The trade this module makes. Two attempts tried to tell `__bold__` from
    // `__init__` with lookaheads; the second passed its tests and still
    // shipped `def init__(self` to the live page. A visible `_marker_` in a
    // plain-text preview is far cheaper than a corrupted identifier on the
    // page whose job is to prove the author can build retrieval.
    expect(stripMarkdown("this is _emphatic_ prose")).toBe("this is _emphatic_ prose");
  });

  it("survives TWO dunders in one snippet — the case that shipped broken", () => {
    // `__(.*?)__(?!\()` backtracks to the later delimiter and strips across
    // the pair. Verified in the browser this time, not only here.
    expect(
      stripMarkdown('class AIService: def __init__(self, privacy_mode="strict"): self.__init__')
    ).toBe('class AIService: def __init__(self, privacy_mode="strict"): self.__init__');
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
