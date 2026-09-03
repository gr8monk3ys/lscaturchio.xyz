import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import {
  listEssaySources,
  essaySlugFromPath,
  MalformedEssayError,
} from "@/lib/essay-sources";

/**
 * Pins the one predicate that answers "what counts as an essay". It used to be
 * re-answered in five places with four different predicates — the corpus sync
 * walked directories only, so a flat `foo.mdx` shipped on the site and was
 * never embedded. These fixtures cover all four shapes at once.
 */

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "essay-sources-"));
const blogDir = path.join(tmpRoot, "src", "app", "blog");

function mdx(title: string | null, date = "2024-01-01"): string {
  const meta = title
    ? [`  title: "${title}",`, `  date: "${date}",`].join("\n")
    : `  date: "${date}",`;
  return ["export const meta = {", meta, "};", "", "Body text.", ""].join("\n");
}

function write(relativePath: string, contents: string) {
  const full = path.join(blogDir, relativePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents, "utf-8");
}

beforeAll(() => {
  write("directory-essay/content.mdx", mdx("Directory essay"));
  write("flat-essay.mdx", mdx("Flat essay"));
  write("malformed-essay/content.mdx", mdx(null));
  write("dateless-essay/content.mdx", "export const meta = {\n  title: \"No date\",\n};\n");
  // Not essays: a nested non-`content` file, a README, and a component.
  write("directory-essay/notes.mdx", mdx("Notes are not an essay"));
  write("README.md", "not an essay");
  write("directory-essay/Diagram.tsx", "export default function D() { return null; }");
  vi.spyOn(process, "cwd").mockReturnValue(tmpRoot);
});

afterAll(() => {
  vi.restoreAllMocks();
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

describe("listEssaySources", () => {
  it("returns directory and flat essays, and nothing else", async () => {
    const slugs = (await listEssaySources()).map((e) => e.slug);

    expect(slugs).toEqual(["dateless-essay", "directory-essay", "flat-essay"]);
    // The flat essay is the case the corpus sync used to miss entirely.
    expect(slugs).toContain("flat-essay");
    // Malformed meta is dropped by default, not fatal.
    expect(slugs).not.toContain("malformed-essay");
    // A sibling .mdx inside an essay directory is not a second essay.
    expect(slugs).not.toContain("directory-essay/notes");
    expect(slugs).not.toContain("README");
  });

  it("hands back the source and parsed meta, read once", async () => {
    const flat = (await listEssaySources()).find((e) => e.slug === "flat-essay");

    expect(flat?.relativePath).toBe("flat-essay.mdx");
    expect(flat?.meta.title).toBe("Flat essay");
    expect(flat?.source).toContain("Body text.");
  });

  it("drops a dateless essay only when the caller asks for a date", async () => {
    const withDate = await listEssaySources({ requiredMeta: ["title", "date"] });

    expect(withDate.map((e) => e.slug)).toEqual(["directory-essay", "flat-essay"]);
  });

  it("fails loudly in strict mode — the corpus sync's CI gate", async () => {
    await expect(listEssaySources({ onMalformed: "throw" })).rejects.toThrow(
      MalformedEssayError
    );
    await expect(listEssaySources({ onMalformed: "throw" })).rejects.toThrow(
      /malformed-essay: could not parse meta\.title/
    );
  });

  it("honours an explicit blogDir over the cwd", async () => {
    const essays = await listEssaySources({ blogDir });

    expect(essays.map((e) => e.slug)).toContain("directory-essay");
  });
});

describe("essaySlugFromPath", () => {
  it("names both shapes the same way", () => {
    expect(essaySlugFromPath("foo/content.mdx")).toBe("foo");
    expect(essaySlugFromPath("foo.mdx")).toBe("foo");
  });
});
