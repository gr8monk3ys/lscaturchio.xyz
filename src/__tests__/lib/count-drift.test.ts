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

/**
 * The collections this site counts and therefore must never hand-type.
 *
 * Widened after a review pointed out that the essay written *about* this guard
 * claimed it "greps the source for a hand-written count of anything the site
 * owns", while it actually read four nouns in `.ts`/`.tsx` — leaving the 83
 * MDX essays, the largest body of prose on the site, outside the boundary. An
 * overstated guard is worse than a modest one, because people trust it.
 */
const COUNTED_NOUNS = [
  "essays?",
  "books?",
  "posts?",
  "films?",
  "movies?",
  "projects?",
  "photos?",
  "albums?",
  "records?",
  "repos(?:itories)?",
  "calculators?",
  "services?",
  "shelves",
].join("|");

const SPELLED_NUMBER = [
  "one|two|three|four|five|six|seven|eight|nine|ten",
  "eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen",
  "twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety",
  "(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)-(?:one|two|three|four|five|six|seven|eight|nine)",
  // 1-3 digits only. Four digits are almost always a year in this corpus
  // ("a 1968 essay", "a 2019 book"), and a year before a noun is a date, not
  // a count.
  "\\d{1,3}",
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
  {
    file: "src/app/blog/art-technology/content.mdx",
    match: "151 records",
    reason: "A figure from the cited copyright litigation, not site inventory.",
  },
  {
    file: "src/app/blog/zorhan-mamdani-politics/content.mdx",
    match: "669 posts",
    reason: "A measured figure about someone else's account, not site inventory.",
  },
  {
    file: "src/components/books/BooksList.tsx",
    match: "three shelves",
    reason:
      "Goodreads gives every user exactly three built-in shelves. A fact about Goodreads, and it does not move when this library does.",
  },
  // The essay about this guard quotes the bug that motivated it, so it names
  // both the false count and the true one on purpose.
  {
    file: "src/app/blog/audit-only-checks-what-it-reaches/content.mdx",
    match: "Six books",
    reason: "The essay quotes the /books bug it is about.",
  },
  {
    file: "src/app/blog/audit-only-checks-what-it-reaches/content.mdx",
    match: "three books",
    reason: "The essay quotes the false count that motivated this guard.",
  },
  {
    file: "src/app/blog/audit-only-checks-what-it-reaches/content.mdx",
    match: "Three books",
    reason: "The same false count, quoted from the component comment.",
  },
  // Counts about the author's OWN projects that nothing in this repository can
  // derive. They are allowlisted rather than deleted because they are load
  // bearing claims, but each one is a hand-typed number about a moving target
  // and wants re-checking when that project changes. This is the weakest kind
  // of entry in this list and it should shrink, not grow.
  {
    file: "src/constants/products.tsx",
    match: "Thirty-seven services",
    reason:
      "pi-lab's Docker Compose stack count. External to this repo. Duplicated at src/app/uses/page.tsx — if one moves and the other does not, that is the /books bug again.",
  },
  {
    file: "src/constants/products.tsx",
    match: "37 services",
    reason: "Same pi-lab count in numeral form.",
  },
  {
    file: "src/app/uses/page.tsx",
    match: "thirty-seven services",
    reason: "The second copy of pi-lab's service count. See the products.tsx entry.",
  },
  {
    file: "src/constants/products.tsx",
    match: "70 repos",
    reason:
      "merge-gate's governed repo count, already hedged with a tilde. ~/code/CLAUDE.md currently says ~72, so this is drifting.",
  },
  {
    file: "src/constants/products.tsx",
    match: "56 calculators",
    reason: "HealthCalc's calculator count. External to this repo.",
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
    // `.mdx` included: the essays quote counts more than the components do.
    return /\.(?:tsx?|mdx)$/.test(entry.name) ? [full] : [];
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
