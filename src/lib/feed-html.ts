import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";

/**
 * An essay's body rendered to HTML for a feed's content:encoded.
 *
 * Feed readers show that field as HTML, so it cannot be the raw MDX source
 * (the meta export and markdown syntax used to reach subscribers verbatim).
 * It takes `BlogPost.body` — the plain markdown `essay-sources` derives, with
 * the meta export, imports and component tag lines already gone — and
 * micromark renders it. micromark escapes raw HTML by default, so nothing in
 * an essay can inject markup into a reader.
 *
 * Root-relative links and images are made absolute: a reader resolves them
 * against its own origin otherwise.
 */
export function essayToFeedHtml(body: string, siteUrl: string): string {
  const html = micromark(body, {
    extensions: [gfm()],
    htmlExtensions: [gfmHtml()],
  });
  const origin = siteUrl.replace(/\/+$/, "");
  return html.replace(/(\s(?:href|src)=")\/(?!\/)/g, `$1${origin}/`);
}
