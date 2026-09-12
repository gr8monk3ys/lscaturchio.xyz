import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * The OG card's palette must be DESIGN.md's palette.
 *
 * `src/app/api/og/route.tsx` renders through Satori, outside the document, so
 * it cannot read `var(--forest-ink)` and has to hardcode hex. That is a real
 * constraint, and it is also a hole: the file drifted to a complete parallel
 * palette — `#1b1b17` for Ink `#1a1f23`, `#5c574c` for Ink Muted `#606976`,
 * `#135c34` for Forest Ink `#184e35`, `#f7f4ed` for Paper `#f9f8f5` — under a
 * comment asserting it "matches the site". Four near-misses are harder to see
 * than one obvious error, and this is the image every link preview of the site
 * renders, so it was the most-published surface and the least-checked.
 *
 * Every other design rule is enforced against source that can use tokens.
 * This one has to be enforced against the literals, because literals are the
 * only thing Satori accepts.
 */
describe("OG card palette", () => {
  const designMd = fs.readFileSync(path.join(process.cwd(), "DESIGN.md"), "utf-8");
  const route = fs.readFileSync(
    path.join(process.cwd(), "src", "app", "api", "og", "route.tsx"),
    "utf-8"
  );

  /** `  forest-ink: "#184e35"` in the frontmatter palette block. */
  function token(name: string): string {
    const match = designMd.match(new RegExp(`^\\s*${name}:\\s*"(#[0-9a-fA-F]{6})"`, "m"));
    if (!match) throw new Error(`DESIGN.md declares no \`${name}\` token`);
    return match[1].toLowerCase();
  }

  /** `const GREEN = '#184e35';` — the declaration, never a comment. */
  function constant(name: string): string {
    const match = route.match(
      new RegExp(`^\\s*const ${name}\\s*=\\s*['"](#[0-9a-fA-F]{6})['"]`, "m")
    );
    if (!match) throw new Error(`og/route.tsx declares no \`${name}\` constant`);
    return match[1].toLowerCase();
  }

  const PAIRS: Array<[string, string]> = [
    ["INK", "ink"],
    ["MUTED", "ink-muted"],
    ["GREEN", "forest-ink"],
    ["PAPER", "paper"],
    ["HAIRLINE", "hairline"],
  ];

  for (const [constName, tokenName] of PAIRS) {
    it(`${constName} is DESIGN.md's ${tokenName}`, () => {
      expect(constant(constName)).toBe(token(tokenName));
    });
  }

  it("mixes its alpha tints from Forest Ink, not from some other green", () => {
    // `rgba(19, 92, 52, …)` shipped here — the decimal form of the rogue
    // `#135c34`, which is how the drift hid from a search for the hex.
    const forestInk = token("forest-ink");
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(forestInk.slice(i, i + 2), 16));
    const rgbaTints = [...route.matchAll(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,/g)];

    const strays = rgbaTints
      .map((m) => [Number(m[1]), Number(m[2]), Number(m[3])])
      // Ink-based tints are legitimate too; only greens must be Forest Ink.
      .filter(([tr, tg, tb]) => tg > tr && tg > tb)
      .filter(([tr, tg, tb]) => tr !== r || tg !== g || tb !== b)
      .map((t) => `rgba(${t.join(", ")}, …)`);

    expect(
      strays,
      `Every green tint on the OG card mixes from Forest Ink rgb(${r}, ${g}, ${b}).\n${strays.join("\n")}`
    ).toEqual([]);
  });
});
