/**
 * The small amount of RSS reading the Letterboxd and Goodreads feeds need:
 * split a document into items and pull one tag's text out of an item. Regex
 * over a known feed shape, not a general XML parser — both feeds are flat.
 */

/** The `<item>` blocks of an RSS document, in feed order. */
export function rssItems(xml: string): string[] {
  return xml.split('<item>').slice(1);
}

export function decodeEntities(text: string): string {
  // &amp; must decode LAST: doing it first turns "&amp;lt;" into "&lt;" and
  // then into "<" — a double-unescape (CodeQL js/double-escaping).
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .trim();
}

/** CDATA-unwrapped raw value — no entity decoding (for HTML-bearing fields). '' when absent. */
export function rawTagValue(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  if (!m) return '';
  return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
}

/** A tag's decoded, trimmed text. '' when absent. */
export function tagValue(block: string, tag: string): string {
  return decodeEntities(rawTagValue(block, tag));
}
