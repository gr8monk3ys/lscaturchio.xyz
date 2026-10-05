import type { MDXContent } from "mdx/types";

/**
 * An essay's rendered body: the default export of `<slug>/content.mdx`,
 * compiled by `@next/mdx` with the components in `mdx-components.tsx`.
 *
 * Only the body comes from here. Metadata, dates, reading time and the cover
 * come from the catalogue (`getBlogPost`), which parses the same file's meta
 * export; nothing reads the compiled `meta`.
 *
 * Its own module, imported by the essay route alone, for two reasons. The
 * template-literal import makes the bundler build a context over every
 * `src/app/blog/<slug>/content.mdx`, and any server module that imported this
 * would carry all of them. And tests stub this seam instead of compiling MDX.
 */
export async function loadEssayContent(slug: string): Promise<MDXContent> {
  const essay = await import(`@/app/blog/${slug}/content.mdx`);
  return essay.default;
}
