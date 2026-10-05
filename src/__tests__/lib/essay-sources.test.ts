import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import {
  listEssaySources,
  getEssaySource,
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

describe("EssaySource.body", () => {
  // Every hard case for "strip the meta export" in one essay. The old rules
  // each failed one of these: a brace counter ended the meta at the `}` inside
  // the title and leaked the rest into the body; a lazy `\{[\s\S]*?\}` stopped
  // at the nested object; reading time stripped nothing at all.
  const HARD = [
    'import { Sidenote } from "@/components/sidenote";',
    "",
    "export const meta = {",
    '  title: "Braces } in a string",',
    "  description: \"An apostrophe's fine, and so is a { brace.\",",
    '  date: "2024-01-01",',
    "  extra: { nested: { deep: true } },",
    "};",
    "",
    "<AssumedAudience>",
    "  Readers who assume the worst.",
    "</AssumedAudience>",
    "",
    "## A heading",
    "",
    "Prose with an inline <span>tag</span>.",
    "",
    "```ts",
    'import { useState } from "react";',
    "export const meta = { fenced: true };",
    '<CustomComponent prop="value" />',
    "```",
    "",
    "",
    "",
    "Closing paragraph.",
    "",
  ].join("\n");

  const bodyDir = path.join(tmpRoot, "body-fixtures");

  beforeAll(() => {
    fs.mkdirSync(path.join(bodyDir, "hard-cases"), { recursive: true });
    fs.writeFileSync(path.join(bodyDir, "hard-cases", "content.mdx"), HARD, "utf-8");
    // A flat essay whose meta closes without a semicolon, the common shape.
    fs.writeFileSync(
      path.join(bodyDir, "flat-body.mdx"),
      'export const meta = {\n  title: "Flat",\n}\n\n## Only section\n\nFlat body.\n',
      "utf-8"
    );
  });

  it("is the essay as plain markdown, whatever the meta block holds", async () => {
    const essay = await getEssaySource("hard-cases", { blogDir: bodyDir });

    expect(essay?.meta.title).toBe("Braces } in a string");
    expect(essay?.body).toBe(
      [
        "Readers who assume the worst.",
        "",
        "## A heading",
        "",
        "Prose with an inline <span>tag</span>.",
        "",
        // Code samples survive verbatim, meta-lookalike and all.
        "```ts",
        'import { useState } from "react";',
        "export const meta = { fenced: true };",
        '<CustomComponent prop="value" />',
        "```",
        "",
        "Closing paragraph.",
      ].join("\n")
    );
  });

  it("derives a flat essay's body the same way", async () => {
    const essay = await getEssaySource("flat-body", { blogDir: bodyDir });

    expect(essay?.relativePath).toBe("flat-body.mdx");
    expect(essay?.body).toBe("## Only section\n\nFlat body.");
  });
});

describe("getEssaySource", () => {
  it("finds an essay in either shape", async () => {
    expect((await getEssaySource("directory-essay", { blogDir }))?.relativePath).toBe(
      "directory-essay/content.mdx"
    );
    expect((await getEssaySource("flat-essay", { blogDir }))?.relativePath).toBe(
      "flat-essay.mdx"
    );
  });

  it("is null for no essay, a malformed one, or a slug that is not a slug", async () => {
    expect(await getEssaySource("no-such-essay", { blogDir })).toBeNull();
    expect(await getEssaySource("malformed-essay", { blogDir })).toBeNull();
    expect(await getEssaySource("../blog/flat-essay", { blogDir })).toBeNull();
  });
});

describe("essaySlugFromPath", () => {
  it("names both shapes the same way", () => {
    expect(essaySlugFromPath("foo/content.mdx")).toBe("foo");
    expect(essaySlugFromPath("foo.mdx")).toBe("foo");
  });
});
