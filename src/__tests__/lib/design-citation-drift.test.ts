import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * A `DESIGN.md:<n>` citation has to point at the thing it claims.
 *
 * Eleven comments in this codebase cite the design document by line number,
 * and eight of them were wrong — off by a consistent 14 to 15 lines, because
 * DESIGN.md gained content above them and nothing re-checked the references.
 * `DESIGN.md:281 specifies one focus treatment` pointed at a blank line.
 * `DESIGN.md:309's "any new section should introduce itself with one"` pointed
 * at "Internal Padding: 24px, 32px at sm".
 *
 * This is the same failure as the dead Sentry build options and the type rules
 * that could not see an inlined stylesheet: a reference that reads as
 * authoritative and resolves to nothing. It is worse than a missing comment,
 * because a reader who follows it finds real text and believes it.
 *
 * Two assertions, because a line number alone cannot be checked for meaning:
 * the cited line must exist and carry content, and any phrase quoted beside
 * the citation must actually appear in the document. The quote is what makes
 * the citation verifiable — a number can only be checked for being in range.
 */
const ROOTS = ["src", "e2e", "docs"];
const CITATION = /DESIGN\.md:(\d+)/g;

/** `"a 2px Forest Ink outline"` — a quoted run of at least four words. */
const QUOTED = /["“]([^"”\n]{16,120})["”]/g;

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(tsx?|css|md)$/.test(entry.name) ? [full] : [];
  });
}

interface Citation {
  file: string;
  line: number;
  cited: number;
  /** The rest of the line after the citation, where a quote would sit. */
  tail: string;
}

function collectCitations(): Citation[] {
  const out: Citation[] = [];

  for (const root of ROOTS) {
    for (const file of walk(path.join(process.cwd(), root))) {
      const relative = path.relative(process.cwd(), file);
      // This file names citations in its own prose; it is the checker, not a
      // consumer, and its examples are deliberately the broken historical ones.
      if (relative.endsWith("design-citation-drift.test.ts")) continue;

      const lines = fs.readFileSync(file, "utf-8").split("\n");
      lines.forEach((text, index) => {
        for (const match of text.matchAll(CITATION)) {
          out.push({
            file: relative,
            line: index + 1,
            cited: Number(match[1]),
            tail: text.slice(match.index ?? 0),
          });
        }
      });
    }
  }

  return out;
}

describe("DESIGN.md citations", () => {
  const designMd = fs.readFileSync(path.join(process.cwd(), "DESIGN.md"), "utf-8");
  const designLines = designMd.split("\n");
  const citations = collectCitations();

  it("finds the citations it is meant to guard", () => {
    // A checker that collects nothing passes forever. This is the floor: the
    // codebase had eleven when this was written, so zero means the collector
    // broke, not that the citations went away.
    expect(citations.length).toBeGreaterThan(5);
  });

  it("cites a line that exists and carries content", () => {
    const offenders = citations
      .filter(({ cited }) => {
        const text = designLines[cited - 1];
        return text === undefined || text.trim().length === 0;
      })
      .map(
        ({ file, line, cited }) =>
          `${file}:${line} cites DESIGN.md:${cited}, which is ${
            designLines[cited - 1] === undefined ? "past the end of the file" : "a blank line"
          }`
      );

    expect(
      offenders,
      [
        "A DESIGN.md citation must resolve to a line with content.",
        "DESIGN.md has gained and lost lines; the references did not follow.",
        "",
        ...offenders,
      ].join("\n")
    ).toEqual([]);
  });

  it("quotes text that is actually in the document", () => {
    const offenders: string[] = [];

    for (const { file, line, cited, tail } of citations) {
      for (const match of tail.matchAll(QUOTED)) {
        const quote = match[1].trim();
        // Skip anything that is plainly code or a class name rather than prose
        // from the document: those are quoted for other reasons.
        if (!/\s/.test(quote) || /[{};<>]|=>/.test(quote)) continue;
        // Comments wrap, so a quote may be split across source lines. Compare
        // on collapsed whitespace, and only flag a quote long enough to be
        // unambiguous.
        // Two normalisations, both learned from this test's first run:
        // a quote inside a TypeScript string literal arrives with its escapes
        // intact (`one\\"` rather than `one`), and a quote lifted into the
        // middle of a sentence is lower-cased at its first letter while
        // DESIGN.md capitalises it ("Any new section" -> "any new section").
        // Neither is a citation defect, so neither should fail the test.
        const needle = quote.replace(/\\/g, "").replace(/\s+/g, " ").toLowerCase();
        const haystack = designMd.replace(/\s+/g, " ").toLowerCase();
        if (!haystack.includes(needle)) {
          offenders.push(`${file}:${line} cites DESIGN.md:${cited} and quotes "${needle}", which is not in DESIGN.md`);
        }
      }
    }

    expect(
      offenders,
      [
        "A phrase quoted beside a DESIGN.md citation must appear in DESIGN.md.",
        "This is the half that can be checked for meaning rather than range.",
        "",
        ...offenders,
      ].join("\n")
    ).toEqual([]);
  });
});
