/**
 * The single answer to "what counts as an essay, where does it live, and what
 * is its text".
 *
 * This used to be re-decided in five places with four different predicates:
 * `getAllBlogs` and three scripts globbed a flat `src/app/blog/foo.mdx` as well
 * as the directory shape, while the retrieval-corpus sync walked directories
 * only. Malformed front-matter was likewise a silent skip in one place and a
 * hard CI failure in another.
 *
 * Both are now stated here. An essay is `<slug>/content.mdx` and nothing else:
 * that is the one file `src/app/blog/[slug]` imports, so it is the only shape
 * that renders, and a shape the route cannot render must not be listed,
 * prerendered or embedded. `onMalformed` chooses between dropping a bad source
 * and failing loudly.
 *
 * The essay's text is derived here too. "Strip the meta export" was written
 * five times: a brace counter that miscounted a `}` inside a string, three
 * variants of a lazy `\{[\s\S]*?\}` that stops at the first `}`, and an
 * exact-shape regex in admin. Reading time stripped nothing and counted the
 * front-matter as prose. `EssaySource.body` is the one answer now, and the
 * meta block is wherever the compiler says it is (`parseMetaExport`).
 */
import glob from "fast-glob";
import * as path from "path";
import fs from "fs/promises";
import { parseMetaExport, type BlogMeta, type MetaExportSpan } from "./blog-meta";

/**
 * An essay is `<slug>/content.mdx`. Nothing else under the blog route is one,
 * including a flat `<slug>.mdx`, which the essay route has no import for.
 */
export const ESSAY_GLOB = ["*/content.mdx"];

/** Where the essays live, resolved at call time so tests can move the cwd. */
export function essayRoot(): string {
  return path.join(process.cwd(), "src", "app", "blog");
}

export interface EssaySource {
  /** URL slug, e.g. `against-optimization`. */
  slug: string;
  /** Path relative to the blog root, e.g. `against-optimization/content.mdx`. */
  relativePath: string;
  /** Absolute path on disk. */
  filePath: string;
  /** Raw MDX source — read once here so callers do not re-read it. */
  source: string;
  /** Front-matter parsed from `export const meta`. */
  meta: Partial<BlogMeta>;
  /**
   * The essay as plain markdown: the meta export, top-level imports and
   * lines that are only a JSX component tag are gone; everything inside a
   * fenced code block survives verbatim, and a tag's inner content is kept.
   * Reading time, the feed, the chat corpus and chat context all read this.
   */
  body: string;
}

/** Front-matter fields a caller can insist on. */
export type RequiredMetaField = "title" | "date";

interface EssayReadOptions {
  /** Defaults to `essayRoot()`. */
  blogDir?: string;
  /** Fields that must parse for a source to count. Defaults to `["title"]`. */
  requiredMeta?: RequiredMetaField[];
}

export interface ListEssaySourcesOptions extends EssayReadOptions {
  /**
   * What to do with a source that fails `requiredMeta`.
   * `"skip"` (default) drops it; `"throw"` raises `MalformedEssayError`, which
   * is how the retrieval-corpus sync keeps its CI gate.
   */
  onMalformed?: "skip" | "throw";
}

/** Thrown by `listEssaySources` in strict mode. */
export class MalformedEssayError extends Error {
  readonly slug: string;
  readonly relativePath: string;
  readonly missing: RequiredMetaField;

  constructor(slug: string, relativePath: string, missing: RequiredMetaField) {
    super(`${slug}: could not parse meta.${missing} from ${relativePath}`);
    this.name = "MalformedEssayError";
    this.slug = slug;
    this.relativePath = relativePath;
    this.missing = missing;
  }
}

/** `foo/content.mdx` names the essay `foo`. */
export function essaySlugFromPath(relativePath: string): string {
  return relativePath.replace(/\/content\.mdx$/, "");
}

/** The inverse: where essay `foo` lives. */
function essayPathForSlug(slug: string): string {
  return `${slug}/content.mdx`;
}

/** Same shape as the site's slug rule; anything else could leave the blog root. */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const FENCE_RE = /^(```|~~~)/;
const IMPORT_LINE_RE = /^import\s.+$/;
// A line that is only a JSX component tag (open, close, or self-closing),
// e.g. `<AssumedAudience>` / `</AssumedAudience>`. Inner content is kept.
const JSX_TAG_LINE_RE = /^\s*<\/?[A-Z][\w.]*(\s[^>]*)?\/?>?\s*$/;

function lineOf(source: string, offset: number): number {
  let line = 0;
  for (let i = 0; i < offset; i++) {
    if (source.charCodeAt(i) === 10) line++;
  }
  return line;
}

/**
 * Plain markdown from MDX. The meta export's lines are the ones the compiler
 * says it spans; imports and tag-only lines go by line, but only outside
 * fenced code, so code samples inside essays survive verbatim.
 */
function deriveBody(source: string, metaSpan: MetaExportSpan | null): string {
  const metaLines = metaSpan
    ? { first: lineOf(source, metaSpan.start), last: lineOf(source, metaSpan.end - 1) }
    : null;

  const out: string[] = [];
  let inFence = false;
  const lines = source.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (FENCE_RE.test(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    if (metaLines && i >= metaLines.first && i <= metaLines.last) continue;
    if (IMPORT_LINE_RE.test(line)) continue;
    if (JSX_TAG_LINE_RE.test(line)) continue;
    out.push(line);
  }

  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function firstMissingField(
  meta: Partial<BlogMeta>,
  required: RequiredMetaField[]
): RequiredMetaField | null {
  for (const field of required) {
    if (!meta[field]) return field;
  }
  return null;
}

type ReadResult =
  | { essay: EssaySource; missing: null }
  | { essay: null; missing: RequiredMetaField; slug: string };

async function readEssay(
  blogDir: string,
  relativePath: string,
  requiredMeta: RequiredMetaField[]
): Promise<ReadResult> {
  const filePath = path.join(blogDir, relativePath);
  const source = await fs.readFile(filePath, "utf-8");
  const { meta, span } = parseMetaExport(source);
  const slug = essaySlugFromPath(relativePath);

  const missing = firstMissingField(meta, requiredMeta);
  if (missing) return { essay: null, missing, slug };

  return {
    essay: { slug, relativePath, filePath, source, meta, body: deriveBody(source, span) },
    missing: null,
  };
}

/**
 * Every essay under the blog route, in slug order, with its source and meta.
 *
 * Slug order rather than filesystem order: the corpus sync and the link
 * suggester both emit per-essay artifacts, and `fast-glob` makes no ordering
 * promise.
 */
export async function listEssaySources(
  options: ListEssaySourcesOptions = {}
): Promise<EssaySource[]> {
  const blogDir = options.blogDir ?? essayRoot();
  const requiredMeta = options.requiredMeta ?? ["title"];
  const onMalformed = options.onMalformed ?? "skip";

  const relativePaths = await glob(ESSAY_GLOB, { cwd: blogDir });

  const sources = await Promise.all(
    relativePaths.map(async (relativePath): Promise<EssaySource | null> => {
      const result = await readEssay(blogDir, relativePath, requiredMeta);
      if (result.missing && onMalformed === "throw") {
        throw new MalformedEssayError(result.slug, relativePath, result.missing);
      }
      return result.essay;
    })
  );

  return sources
    .filter((entry): entry is EssaySource => entry !== null)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

/**
 * One essay by slug, or null when there is no such essay or its meta fails
 * `requiredMeta`. Reads one file rather than walking the root.
 */
export async function getEssaySource(
  slug: string,
  options: EssayReadOptions = {}
): Promise<EssaySource | null> {
  if (!SLUG_RE.test(slug)) return null;
  const blogDir = options.blogDir ?? essayRoot();
  const requiredMeta = options.requiredMeta ?? ["title"];

  try {
    return (await readEssay(blogDir, essayPathForSlug(slug), requiredMeta)).essay;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return null;
  }
}
