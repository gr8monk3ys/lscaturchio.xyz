import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * The palette's two invariants, checked against the stylesheet.
 *
 * DESIGN.md: *"dark mode is the same notebook at night"* — every ink lifts so
 * it stays legible on night paper. `--primary` goes 20% → 46%, `--foreground`
 * 11% → 98%, `--muted-foreground` 42% → 70%.
 *
 * `--destructive` went 60.2% → **30.6%**: the one token in the set that got
 * darker at night, because it was shadcn's untouched default and nobody had
 * looked. That measured 1.86:1 on night paper — failing not just the 4.5:1
 * body floor but the 3:1 large-text floor — and this palette renders error
 * text as body copy, in form validation and search failures. Its light value
 * failed too, at 3.58:1, and DESIGN.md recorded the failing value as the spec.
 *
 * A colour is the one kind of design decision that cannot be eyeballed, so
 * these are arithmetic rather than review.
 */

const CSS = fs.readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf-8");

/** Approximate Paper and night paper, for contrast maths. */
const BACKGROUNDS = { light: hslToRgb(38, 20, 97.5), dark: hslToRgb(220, 15, 7.8) };

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const sn = s / 100;
  const ln = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => ln - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(fg: [number, number, number], bg: [number, number, number]): number {
  const a = relativeLuminance(fg);
  const b = relativeLuminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/**
 * The `:root` block is light, the `.dark` block is night. Read each token's
 * `H S% L%` triple from both.
 */
function readTokens(): Map<string, { light?: [number, number, number]; dark?: [number, number, number] }> {
  const tokens = new Map<string, { light?: [number, number, number]; dark?: [number, number, number] }>();
  // Tokens are declared once per theme in source order: light first, dark second.
  const seen = new Map<string, number>();

  const pattern = /--([a-z-]+):\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*;/g;
  for (const match of CSS.matchAll(pattern)) {
    const [, name, h, s, l] = match;
    const count = (seen.get(name) ?? 0) + 1;
    seen.set(name, count);
    const triple: [number, number, number] = [Number(h), Number(s), Number(l)];
    const entry = tokens.get(name) ?? {};
    if (count === 1) entry.light = triple;
    else if (count === 2) entry.dark = triple;
    tokens.set(name, entry);
  }
  return tokens;
}

/**
 * Self-scoping: the tokens the site actually paints as text on the page.
 *
 * Hand-listing them was wrong twice over — it pulled in `--warning` and
 * `--info`, which have zero `text-*` uses and so owe nothing, and
 * `--secondary-foreground`, which is ink *on* the secondary surface and was
 * being measured against the page it never touches. Deriving the set from
 * usage means the rule covers what ships and nothing else.
 */
function inksPaintedAsText(): string[] {
  const roots = ["src/app", "src/components"];
  const found = new Set<string>();

  const walk = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return entry.name === "__tests__" ? [] : walk(full);
      return /\.tsx?$/.test(entry.name) ? [full] : [];
    });

  for (const root of roots) {
    const dir = path.join(process.cwd(), root);
    if (!fs.existsSync(dir)) continue;
    for (const file of walk(dir)) {
      for (const match of fs.readFileSync(file, "utf-8").matchAll(/\btext-([a-z-]+)\b/g)) {
        found.add(match[1]);
      }
    }
  }

  // Of those, the ones this stylesheet declares per theme.
  return ["foreground", "primary", "muted-foreground", "destructive", "success", "warning", "info"].filter(
    (name) => found.has(name)
  );
}

const INKS = inksPaintedAsText();

describe("palette", () => {
  const tokens = readTokens();

  it("lifts every ink in dark mode", () => {
    const offenders: string[] = [];

    for (const name of INKS) {
      const entry = tokens.get(name);
      if (!entry?.light || !entry?.dark) continue;
      const [, , lightL] = entry.light;
      const [, , darkL] = entry.dark;
      if (darkL <= lightL) {
        offenders.push(
          `--${name} is ${lightL}% light and ${darkL}% dark — it does not lift, so it darkens against night paper`
        );
      }
    }

    expect(
      offenders,
      [
        'DESIGN.md: "dark mode is the same notebook at night" — the ink lifts so it stays legible.',
        "--destructive was 60.2% light and 30.6% dark, the only token that got darker.",
        "",
        ...offenders,
      ].join("\n")
    ).toEqual([]);
  });

  it.each(["light", "dark"] as const)("clears 4.5:1 for body ink in %s mode", (theme) => {
    const offenders: string[] = [];

    for (const name of INKS) {
      const triple = tokens.get(name)?.[theme];
      if (!triple) continue;
      const ratio = contrast(hslToRgb(...triple), BACKGROUNDS[theme]);
      if (ratio < 4.5) {
        offenders.push(`--${name} measures ${ratio.toFixed(2)}:1 (needs 4.5:1 for body text)`);
      }
    }

    expect(
      offenders,
      [
        `Body ink must clear 4.5:1 against the ${theme} page.`,
        "--destructive measured 3.58:1 light and 1.86:1 dark, and renders as body copy.",
        "",
        ...offenders,
      ].join("\n")
    ).toEqual([]);
  });
});
