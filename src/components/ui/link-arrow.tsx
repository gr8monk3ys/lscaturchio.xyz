import { ArrowRight, ArrowUpRight } from "lucide-react";

/**
 * The arrow beside a link, chosen from the link's own destination.
 *
 * `↗` is a promise: it means the click leaves this site. The site was making
 * that promise on eight internal routes — every cell of the `/garden` index
 * (Now, Books, Movies, Music, Photography, Lab, Links, Guestbook) — plus the
 * home page's "Read the case study", the `/lab` search results, and, worst of
 * the set, a *same-page anchor* (`#case-study-<slug>`) that scrolls the reader
 * a few hundred pixels down the page they are already on. Meanwhile `/contact`
 * used the same glyph correctly for Calendly and a `mailto:`, so the glyph
 * meant both "leaves the site" and "goes to a page on it", which is to say it
 * meant nothing.
 *
 * A drift rule could have caught the eight cells. It could not have made the
 * next one impossible, because the arrow is a sibling of the `href` rather
 * than an attribute of it, so any rule has to guess at their relationship from
 * two different lines. Deriving the glyph from the destination removes the
 * choice instead of policing it: a caller cannot pass a `/garden` href and get
 * the external arrow, because there is no argument for the arrow.
 *
 * `no-direct-arrow-up-right` in design-drift.test.ts keeps this the only
 * module that names `ArrowUpRight`.
 */
export function LinkArrow({ href, className }: { href: string; className?: string }) {
  const Arrow = isExternalHref(href) ? ArrowUpRight : ArrowRight;
  return <Arrow aria-hidden="true" className={className} />;
}

/**
 * Whether following `href` leaves this site.
 *
 * `mailto:` and `tel:` count as leaving: they hand the reader to another
 * application, which is the thing the arrow is warning about. A protocol-
 * relative `//host` URL leaves too, and has to be tested before the bare `/`
 * check that would otherwise claim it as internal.
 */
export function isExternalHref(href: string): boolean {
  if (href.startsWith("//")) return true;
  if (href.startsWith("/") || href.startsWith("#") || href.startsWith("?")) return false;
  return /^[a-z][a-z0-9+.-]*:/i.test(href);
}
