import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * A drift check for counts, modelled on the retrieval-corpus drift check.
 *
 * PRODUCT.md's second principle is "every number has a source, or it is not on
 * the page". The site enforces that well inside components — `BooksList` counts
 * its own five-star shelf, `/garden` derives "{MORE.length} more pages" — and
 * did not enforce it at all in `metadata` objects, which no test renders and no
 * check reads. So `/books` shipped "the three books I gave full marks" while the
 * page body four lines away correctly said six, and four separate strings
 * asserted "Eighty-three essays" with nothing to recheck them.
 *
 * This test fails when a literal count of one of the site's own collections is
 * typed into reader-facing source. Derive it instead: `spellCount(items.length)`.
 */

const SCAN_ROOTS = ["src/app", "src/components", "src/constants", "src/lib"];

/** The collections this site counts and therefore must never hand-type. */
const COUNTED_NOUNS = "essays?|books?|posts?|films?";

const SPELLED_NUMBER = [
  "one|two|three|four|five|six|seven|eight|nine|ten",
  "eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen",
  "twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety",
  "(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)-(?:one|two|three|four|five|six|seven|eight|nine)",
  "\\d{1,4}",
].join("|");

const COUNT_CLAIM = new RegExp(`\\b(?:${SPELLED_NUMBER})\\s+(?:${COUNTED_NOUNS})\\b`, "gi");

/**
 * Numbers that are arguments rather than inventory. Each entry needs a reason:
 * if you cannot write one, the number probably wants deriving.
 */
const ALLOWED: Array<{ file: string; match: string; reason: string }> = [
  {
    file: "src/constants/products.tsx",
    match: "fifteen posts",
    reason:
      "Verso's case study argues about gallery-going frequency (a feed with fifteen posts a year is not a feed). Not a count of anything this site holds.",
  },
];

/** Comments are where this codebase records the history of these bugs. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");
}

function walk(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__" || entry.name === "generated") return [];
      return walk(full);
    }
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

describe("count drift", () => {
  it("has no hand-typed count of the site's own collections in reader-facing source", () => {
    const offenders: string[] = [];

    for (const root of SCAN_ROOTS) {
      const dir = path.join(process.cwd(), root);
      if (!fs.existsSync(dir)) continue;

      for (const file of walk(dir)) {
        const relative = path.relative(process.cwd(), file);
        const source = stripComments(fs.readFileSync(file, "utf-8"));

        for (const match of source.matchAll(COUNT_CLAIM)) {
          const claim = match[0];
          const allowed = ALLOWED.some(
            (entry) =>
              entry.file === relative && entry.match.toLowerCase() === claim.toLowerCase()
          );
          if (allowed) continue;

          const line = source.slice(0, match.index).split("\n").length;
          offenders.push(`${relative}:${line} — "${claim}"`);
        }
      }
    }

    expect(
      offenders,
      [
        "Hand-typed counts found in reader-facing source.",
        "Derive them instead — `spellCount(items.length)` from @/lib/spell-count —",
        "or add an entry to ALLOWED with a reason if the number is an argument,",
        "not an inventory.",
        "",
        ...offenders,
      ].join("\n")
    ).toEqual([]);
  });
});
