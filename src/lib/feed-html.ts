import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";

import { mdxToPlainMarkdown } from "@/lib/retrieval-corpus";

/**
 * An essay's content.mdx rendered to HTML for a feed's content:encoded.
 *
 * Feed readers show that field as HTML, so it cannot be the raw MDX source
 * (the meta export and markdown syntax used to reach subscribers verbatim).
 * The same MDX-to-markdown pass the chat corpus uses drops the meta export,
 * imports and component tag lines; micromark then renders the markdown.
 * micromark escapes raw HTML by default, so nothing in an essay can inject
 * markup into a reader.
 *
 * Root-relative links and images are made absolute: a reader resolves them
 * against its own origin otherwise.
 */
export function essayToFeedHtml(mdxSource: string, siteUrl: string): string {
  const html = micromark(mdxToPlainMarkdown(mdxSource), {
    extensions: [gfm()],
    htmlExtensions: [gfmHtml()],
  });
  const origin = siteUrl.replace(/\/+$/, "");
  return html.replace(/(\s(?:href|src)=")\/(?!\/)/g, `$1${origin}/`);
}
