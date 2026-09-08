import { describe, it, expect } from "vitest";
import { spellCount, spellCountLower, pluralize } from "@/lib/spell-count";

describe("spellCountLower", () => {
  it("spells zero as 'no', because every caller uses it in a sentence", () => {
    expect(spellCountLower(0)).toBe("no");
  });

  it("spells the small counts a books or films page actually shows", () => {
    expect(spellCountLower(1)).toBe("one");
    expect(spellCountLower(6)).toBe("six");
    expect(spellCountLower(12)).toBe("twelve");
    expect(spellCountLower(19)).toBe("nineteen");
  });

  it("hyphenates the compound tens", () => {
    expect(spellCountLower(21)).toBe("twenty-one");
    expect(spellCountLower(83)).toBe("eighty-three");
    expect(spellCountLower(99)).toBe("ninety-nine");
  });

  it("does not hyphenate a round ten", () => {
    expect(spellCountLower(20)).toBe("twenty");
    expect(spellCountLower(90)).toBe("ninety");
  });

  it("handles hundreds", () => {
    expect(spellCountLower(100)).toBe("one hundred");
    expect(spellCountLower(150)).toBe("one hundred fifty");
    expect(spellCountLower(999)).toBe("nine hundred ninety-nine");
  });

  it("falls back to digits rather than throwing on out-of-range input", () => {
    // A wrong-looking number on the page is a smaller failure than a page
    // that will not render.
    expect(spellCountLower(1000)).toBe("1000");
    expect(spellCountLower(-1)).toBe("-1");
    expect(spellCountLower(1.5)).toBe("1.5");
  });
});

describe("spellCount", () => {
  it("capitalises for the start of a sentence", () => {
    expect(spellCount(6)).toBe("Six");
    expect(spellCount(83)).toBe("Eighty-three");
    expect(spellCount(0)).toBe("No");
  });
});

describe("pluralize", () => {
  it("keeps the singular only at one", () => {
    expect(pluralize(1, "book")).toBe("book");
    expect(pluralize(0, "book")).toBe("books");
    expect(pluralize(6, "book")).toBe("books");
  });

  it("takes an explicit plural for irregular nouns", () => {
    expect(pluralize(2, "entry", "entries")).toBe("entries");
  });
});
