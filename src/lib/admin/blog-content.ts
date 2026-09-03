import { compile } from "@mdx-js/mdx";
import { extractBlogMeta, type BlogMeta } from "@/lib/blog-meta";

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

// The portal always emits this exact shape; body extraction depends on it.
const META_BLOCK_RE = /export const meta = \{\n([\s\S]*?)\n\}/;

/**
 * Parse a post's meta for editing. Values are read with the site's canonical
 * AST parser (extractBlogMeta, the same one getAllBlogs uses), but form-based
 * editing additionally requires the standard block shape so extractBody can
 * split meta from body reliably. Anything else returns null and the caller
 * treats the file as not portal-editable.
 */
export function parseMeta(source: string): PostMeta | null {
  if (!META_BLOCK_RE.test(source)) return null;
  const meta = extractBlogMeta(source);
  if (!meta.title || !meta.description || !meta.date) return null;
  return { ...meta, tags: meta.tags ?? [] } as PostMeta;
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
