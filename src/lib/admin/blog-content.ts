import { compile } from "@mdx-js/mdx";
import { parseMetaExport, type BlogMeta } from "@/lib/blog-meta";

/** BlogMeta, minus the image requirement — portal posts may ship without one. */
export type PostMeta = Omit<BlogMeta, "image"> & { image?: string };

const META_KEY_ORDER = [
  "title",
  "description",
  "date",
  "updated",
  "image",
  "tags",
  "syndication",
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

/**
 * Parse a post's meta for editing, with the same parse that tells every other
 * reader where the meta block is (`parseMetaExport`). A save writes the meta
 * block and then `extractBody`'s text, so a post is only editable when the
 * block is the first thing in the file: anything above it would be dropped.
 * Anything else returns null and the caller treats the file as not
 * portal-editable.
 */
export function parseMeta(source: string): PostMeta | null {
  const { meta, span } = parseMetaExport(source);
  if (!span || source.slice(0, span.start).trim() !== "") return null;
  if (!meta.title || !meta.description || !meta.date) return null;
  return { ...meta, tags: meta.tags ?? [] } as PostMeta;
}

/**
 * Everything after the meta block, for the editor: the MDX as written, not
 * the derived plain body, because a save writes it back. The block ends where
 * the compiler says, so a hand-written `};` stays with the meta instead of
 * opening the body.
 */
export function extractBody(source: string): string {
  const { span } = parseMetaExport(source);
  if (!span) return source;
  return source
    .slice(span.end)
    .replace(/^[ \t]*\n+/, "")
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
    <BlogLayout meta={meta} slug="${slug}">
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
