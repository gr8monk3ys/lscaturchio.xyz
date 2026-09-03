/**
 * The single answer to "what counts as an essay, and where does it live".
 *
 * This used to be re-decided in five places with four different predicates:
 * `getAllBlogs` and three scripts globbed the flat and nested MDX shapes, while the
 * retrieval-corpus sync walked directories only — so a flat
 * `src/app/blog/foo.mdx` would render on the site and be webmentioned but never
 * reach the chat corpus. Malformed front-matter was likewise a silent skip in
 * one place and a hard CI failure in another.
 *
 * Both of those are now stated here, explicitly, as options: the walk covers
 * flat and directory essays alike, and `onMalformed` chooses between dropping a
 * bad source and failing loudly.
 */
import glob from "fast-glob";
import * as path from "path";
import fs from "fs/promises";
import { extractBlogMeta, type BlogMeta } from "./blog-meta";

/**
 * An essay is either `<slug>/content.mdx` or a flat `<slug>.mdx`. Nothing else
 * under the blog route is one.
 */
export const ESSAY_GLOB = ["*.mdx", "*/content.mdx"];

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
}

/** Front-matter fields a caller can insist on. */
export type RequiredMetaField = "title" | "date";

export interface ListEssaySourcesOptions {
  /** Defaults to `essayRoot()`. */
  blogDir?: string;
  /** Fields that must parse for a source to count. Defaults to `["title"]`. */
  requiredMeta?: RequiredMetaField[];
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

/** `foo/content.mdx` and `foo.mdx` both name the essay `foo`. */
export function essaySlugFromPath(relativePath: string): string {
  return relativePath.replace(/(\/content)?\.mdx$/, "");
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
      const filePath = path.join(blogDir, relativePath);
      const source = await fs.readFile(filePath, "utf-8");
      const meta = extractBlogMeta(source);
      const slug = essaySlugFromPath(relativePath);

      const missing = firstMissingField(meta, requiredMeta);
      if (missing) {
        if (onMalformed === "throw") {
          throw new MalformedEssayError(slug, relativePath, missing);
        }
        return null;
      }

      return { slug, relativePath, filePath, source, meta };
    })
  );

  return sources
    .filter((entry): entry is EssaySource => entry !== null)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}
