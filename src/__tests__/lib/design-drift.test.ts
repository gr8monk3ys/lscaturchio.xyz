import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * A drift check for the design system, modelled on `count-drift.test.ts`.
 *
 * Five review cycles found the same classes of defect in different files: a raw
 * size class overriding a heading's clamp, a cold grey where a sand hairline
 * belongs, a shadow on a content surface, an image that lifts on hover, two
 * names for one destination. Each cycle they were fixed at the coordinates the
 * review supplied, and each following cycle found the siblings.
 *
 * DESIGN.md is a good document; the gap between it and the site was never
 * ambition, it was enforcement. `Heading`, `PageHead` and `label-link` are all
 * opt-in, and an opt-in system maintained by fixing named instances drifts back
 * at exactly the rate it is not checked. These rules are the ones worth making
 * mechanical: each maps to a named rule in DESIGN.md, and each has already been
 * violated more than once.
 *
 * Every allowance carries a reason. A growing ALLOWED list is the signal that a
 * rule is wrong; a shrinking one is the signal that it is working.
 */

const SCAN_ROOTS = ["src/app", "src/components"];

interface Rule {
  id: string;
  /** What DESIGN.md says, so a failure explains itself. */
  because: string;
  test: RegExp;
  /** Narrow the rule to markup that matters, when the raw regex is too broad. */
  appliesTo?: (line: string) => boolean;
}

const SIZE_CLASS = String.raw`(?:sm:|md:|lg:|xl:|2xl:)?text-(?:xs|sm|base|lg|[2-9]?xl)`;

const RULES: Rule[] = [
  {
    id: "heading-size-override",
    because:
      "Heading and PageHead supply text-page-title. A size class in the same className lands in the same tailwind-merge group and silently replaces the clamp — the /books and /projects bug, twice.",
    test: new RegExp(
      String.raw`<(?:Heading|PageHead)[^>]*className="[^"]*\b${SIZE_CLASS}\b`
    ),
  },
  {
    id: "heading-component-tracking-override",
    because:
      "The same bug in the letter-spacing group. `heading-tracking-override` can only see a tracking class beside a ramp *token*, and Heading supplies its token internally — so `<Heading className=\"tracking-tight\">` slipped past both rules for the essay title on all 83 posts.",
    test: /<(?:Heading|PageHead)[^>]*className="[^"]*\btracking-(?:tight|tighter|wide|wider|widest)\b/,
  },
  {
    id: "neutral-grey",
    because:
      "The Sand Hairline Rule: every neutral is warm paper in light mode and cool night in dark. Tailwind's grey/slate/zinc/stone scales are neither.",
    test: /\b(?:bg|text|border|divide|ring)-(?:gray|grey|slate|zinc|stone|neutral)-\d{2,3}\b/,
  },
  {
    id: "content-shadow",
    because:
      "The Two Sheets Rule: the fixed navbar and the cta-primary ledge are the only elevated objects. A ring is a box-shadow too.",
    test: /\b(?:hover:)?(?:shadow-(?:sm|md|lg|xl|2xl|\[)|ring-2\b)/,
    appliesTo: (line) => !line.includes("focus") && !line.includes("site-header"),
  },
  {
    id: "heading-ramp",
    because:
      "The Fluid Heading Rule: headings scale with clamp(), not breakpoints, and the ramp lives in text-page-title / -section-title / -card-title / -subsection. A raw Tailwind step beside font-display is a sixth scale. The existing heading-size-override rule guards a door PageHead already bolted shut; this is the 44 open windows.",
    test: new RegExp(
      String.raw`font-display[^"]*\b(?:sm:|md:|lg:|xl:|2xl:)?text-(?:xs|sm|base|lg|[2-9]?xl|\[)`
    ),
    // `prose-*` variants are the typography plugin styling essay content, not
    // headings the ramp governs. The pull-quote is allowed its own size.
    appliesTo: (line) => !line.includes("prose-"),
  },
  {
    id: "display-scale-outside-ramp",
    because:
      "Above text-card-title (1.25rem) there is nothing but headings, so text-2xl and up belong to the ramp entirely. The heading-ramp rule only sees a size beside font-display, which misses every heading that never reached for the display font in the first place — section-heading.tsx, /tag, /secret and eighteen others set their own scale with font-bold and were invisible to it.",
    test: /\b(?:sm:|md:|lg:|xl:|2xl:)?text-(?:[2-9]xl)\b/,
    // Two voices legitimately reach this size without being headings: a mono
    // step number in the label voice, and a figure set in tabular numerals.
    // Neither borrows the heading ramp, so neither drifts from it.
    appliesTo: (line) =>
      !line.includes("prose-") &&
      !line.includes("label-mono") &&
      !line.includes("tabular-nums"),
  },
  {
    id: "heading-tracking-override",
    because:
      "The Fluid Heading Rule sets tracking per step and loosens it as size falls (-0.035 / -0.03 / -0.026 / -0.02 / -0.01em). A tracking-tight beside a ramp token replaces all five with one value, which is the size-override bug in a different property.",
    test: new RegExp(
      String.raw`(?:(?:text-(?:page|section|card)-title|text-subsection|text-display)[^"]*\btracking-(?:tight|tighter)\b|\btracking-(?:tight|tighter)\b[^"]*(?:text-(?:page|section|card)-title|text-subsection|text-display))`
    ),
  },
  {
    id: "width-scale",
    because:
      "page-width.ts defines the page scale as 2xl / 4xl / 6xl / none. These three are the tiers that were removed from it — 7xl and max-w-400 laid eleven routes out to 1280 and 1600px, 3xl and 5xl were a fourth and fifth scale — so this is a regression guard, not a coverage rule: it holds at zero matches by design and exists to stop them coming back. It does NOT check the smaller steps (xl, lg, md, sm, xs, prose, 36 uses), which are element measures rather than page widths and are correct where they appear.",
    // Named tiers only. An arbitrary value (`max-w-[300px]` on a portrait
    // plate) is an explicit one-off with intent; a fourth *named* tier is the
    // drift, because it reads as part of a scale that does not contain it.
    test: /\bmax-w-(?:3xl|5xl|7xl)\b/,
    appliesTo: (line) => /className/.test(line) && !/prose/.test(line),
  },
  {
    id: "ring-offset-without-paper",
    because:
      "Tailwind's default --tw-ring-offset-color is #fff, so `ring-offset-2` alone paints a pure-white gap between the element and its ring. On the night page that is a cold white halo around every focused nav item — the one place DESIGN.md is most specific (\"the same notebook at night\"). 13 of 15 sites had it; the two that did not were the skip link and the Button variants.",
    test: /\bring-offset-\d/,
    appliesTo: (line) => !line.includes("ring-offset-background"),
  },
  {
    id: "raw-signal-colour",
    because:
      "The four signal colours are tokens (--destructive, --success, --warning, --info). A raw Tailwind red/green/amber/blue on a public route bypasses them and usually has no dark-mode variant.",
    test: /\b(?:text|bg|border|ring)-(?:red|green|emerald|amber|yellow|blue|sky|indigo|violet|purple|pink|rose|orange|teal|cyan|lime|fuchsia)-\d{2,3}\b/,
  },
  {
    id: "image-hover-lift",
    because:
      "The Flat Paper Rule: a hovered surface changes tint and border colour, it does not rise. Scale on an image is a lift.",
    test: /\b(?:group-)?hover:scale-/,
  },
];

/** Each entry needs a reason. If you cannot write one, fix the code instead. */
const ALLOWED: Array<{ file: string; rule: string; reason: string }> = [];

function stripComments(source: string): string {
  return (
    source
      // Keep one newline per line removed, or every line number this file
      // reports below the first block comment is wrong. A 13-line comment in
      // `globals.css`-adjacent components shifted reported coordinates by 13,
      // which sends the reader to an innocent line and makes the gate look
      // like it is hallucinating.
      .replace(/\/\*[\s\S]*?\*\//g, (match) => "\n".repeat((match.match(/\n/g) ?? []).length))
      .replace(/^[ \t]*\/\/.*$/gm, "")
  );
}

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "__tests__" ? [] : walk(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

describe("design drift", () => {
  it.each(RULES)("$id", (rule) => {
    const offenders: string[] = [];

    for (const root of SCAN_ROOTS) {
      const dir = path.join(process.cwd(), root);
      if (!fs.existsSync(dir)) continue;

      for (const file of walk(dir)) {
        const relative = path.relative(process.cwd(), file);
        if (ALLOWED.some((a) => a.file === relative && a.rule === rule.id)) continue;

        const lines = stripComments(fs.readFileSync(file, "utf-8")).split("\n");
        lines.forEach((line, index) => {
          if (!rule.test.test(line)) return;
          if (rule.appliesTo && !rule.appliesTo(line)) return;
          offenders.push(`${relative}:${index + 1} — ${line.trim().slice(0, 110)}`);
        });
      }
    }

    expect(offenders, [`${rule.id}: ${rule.because}`, "", ...offenders].join("\n")).toEqual([]);
  });
});

describe("heading case", () => {
  /**
   * `docs/writing-style.md:72`: "Title Case Headings. Headings are sentence
   * case." Nine UI headings were Title Case anyway, six of which I fixed by
   * eye and then found three more on the same page — which is the argument for
   * checking rather than reading.
   *
   * Literal headings only. An interpolated one (`{row.label}`, `{meta.title}`)
   * carries content, and essay titles are the author's own casing decision,
   * not this rule's business.
   *
   * The signal is capitalised words that are not proper nouns: a heading of
   * four or more words with three or more of them capitalised past the first.
   * Two-word headings are excluded because most of them are names.
   */
  const FUNCTION_WORDS = new Set([
    "a", "an", "the", "and", "or", "but", "of", "in", "on", "at", "to", "for",
    "is", "as", "by", "with", "from", "not", "this", "that", "your", "its",
  ]);

  /** Each entry needs a reason. Proper nouns belong here, nothing else does. */
  const ALLOWED_HEADINGS: Array<{ text: string; reason: string }> = [
    { text: "Lorenzo Scaturchio", reason: "A person's name." },
  ];

  it("writes UI headings in sentence case", () => {
    const offenders: string[] = [];

    for (const root of SCAN_ROOTS) {
      const dir = path.join(process.cwd(), root);
      if (!fs.existsSync(dir)) continue;

      for (const file of walk(dir)) {
        const relative = path.relative(process.cwd(), file);
        // API routes build email bodies, not pages. The one heading in there
        // ("New Contact Form Submission") is an internal notification to the
        // site's owner, and the site's style guide governs the site.
        if (relative.startsWith(path.join("src", "app", "api"))) continue;

        const source = fs.readFileSync(file, "utf-8");

        for (const match of source.matchAll(/<h[1-6][^>]*>([^<>{}]+)<\/h[1-6]>/g)) {
          const text = match[1].replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
          if (!text) continue;
          if (ALLOWED_HEADINGS.some((a) => a.text === text)) continue;

          const words = text.split(" ").filter(Boolean);
          if (words.length < 4) continue;

          const past = words.slice(1).filter((w) => /^[A-Za-z]/.test(w));
          const capitalised = past.filter(
            (w) => !FUNCTION_WORDS.has(w.toLowerCase()) && /^[A-Z]/.test(w)
          );

          if (capitalised.length >= 3) {
            const line = source.slice(0, match.index).split("\n").length;
            offenders.push(`${relative}:${line} — "${text}"`);
          }
        }
      }
    }

    expect(
      offenders,
      [
        'writing-style.md: "Headings are sentence case."',
        "",
        ...offenders,
      ].join("\n")
    ).toEqual([]);
  });
});

describe("navigation vocabulary", () => {
  it("gives every destination exactly one name", async () => {
    const navlinks = await import("@/constants/navlinks");
    const namesByHref = new Map<string, Set<string>>();

    const collect = (items: unknown): void => {
      if (Array.isArray(items)) {
        items.forEach(collect);
        return;
      }
      if (!items || typeof items !== "object") return;
      const record = items as Record<string, unknown>;
      if (typeof record.href === "string" && typeof record.name === "string") {
        const set = namesByHref.get(record.href) ?? new Set<string>();
        set.add(record.name);
        namesByHref.set(record.href, set);
      }
      Object.values(record).forEach(collect);
    };

    Object.values(navlinks).forEach(collect);

    const conflicts = [...namesByHref.entries()]
      .filter(([, names]) => names.size > 1)
      .map(([href, names]) => `${href} is called ${[...names].map((n) => `"${n}"`).join(" and ")}`);

    expect(
      conflicts,
      [
        "One destination, two names, in two persistent navigations.",
        "The header said Writing and Hire me; the footer said Blog and Work With Me.",
        "",
        ...conflicts,
      ].join("\n")
    ).toEqual([]);
  });
});
