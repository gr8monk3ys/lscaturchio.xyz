import { compile } from "@mdx-js/mdx";
import type { BlogStage } from "@/lib/blog-stage";

export interface PostMeta {
  title: string;
  description: string;
  date: string;
  image?: string;
  tags: string[];
  series?: string;
  seriesOrder?: number;
  stage?: BlogStage;
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/['".]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const META_KEY_ORDER = [
  "title",
  "description",
  "date",
  "image",
  "tags",
  "series",
  "seriesOrder",
  "stage",
] as const;

export function serializeMeta(meta: PostMeta): string {
  const lines: string[] = ["export const meta = {"];
  for (const key of META_KEY_ORDER) {
    const value = meta[key];
    if (value === undefined) continue;
    lines.push(`  ${key}: ${JSON.stringify(value)},`);
  }
  lines.push("}");
  return lines.join("\n");
}

const META_BLOCK_RE = /export const meta = \{\n([\s\S]*?)\n\}/;

/**
 * Parse a meta block back into a PostMeta. Portal-generated blocks always
 * match (one `key: <JSON value>,` per line); hand-written posts follow the
 * same shape today. Anything fancier (computed values, multi-line strings)
 * returns null and the caller falls back to treating the file as opaque.
 */
export function parseMeta(source: string): PostMeta | null {
  const match = source.match(META_BLOCK_RE);
  if (!match) return null;
  const result: Record<string, unknown> = {};
  for (const rawLine of match[1].split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const kv = line.match(/^(\w+):\s*(.*?),?$/);
    if (!kv) return null;
    try {
      result[kv[1]] = JSON.parse(kv[2]);
    } catch {
      return null;
    }
  }
  if (
    typeof result.title !== "string" ||
    typeof result.description !== "string" ||
    typeof result.date !== "string"
  ) {
    return null;
  }
  if (result.tags === undefined) result.tags = [];
  if (!Array.isArray(result.tags)) return null;
  return result as unknown as PostMeta;
}

export function extractBody(source: string): string {
  const match = source.match(META_BLOCK_RE);
  if (!match) return source;
  return source
    .slice((match.index ?? 0) + match[0].length)
    .replace(/^\n+/, "")
    .replace(/\n+$/, "");
}

export function buildContentMdx(meta: PostMeta, body: string): string {
  return `${serializeMeta(meta)}\n\n${body.trim()}\n`;
}

export function buildPageTsx(slug: string): string {
  return `import { BlogLayout } from "@/components/blog/BlogLayout";
import Content, { meta } from "./content.mdx";

import { buildBlogMetadata } from "@/lib/seo";
export const metadata = buildBlogMetadata(meta, "/blog/${slug}");

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
`;
}

export async function validateMdx(
  source: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await compile(source, { format: "mdx" });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
