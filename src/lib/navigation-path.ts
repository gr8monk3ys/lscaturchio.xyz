import { stripLocalePrefix } from "@/lib/site-locale";

export function getHrefPath(href: string): string {
  return href.split("#")[0] || href;
}

/**
 * Whether a nav item points at the page being read.
 *
 * Compared on the bare path. In a non-English locale the proxy rewrites
 * `/es/blog` to `/blog`, but `usePathname()` still reports `/es/blog`, so a
 * raw comparison against the nav's unprefixed hrefs marked nothing current:
 * the highlight and `aria-current="page"` both vanished for every reader
 * outside the default locale.
 */
export function isPathActive(pathname: string, href: string): boolean {
  const resolvedHref = getHrefPath(href);
  const current = stripLocalePrefix(pathname).barePath;

  if (resolvedHref === "/") {
    return current === resolvedHref;
  }

  return current === resolvedHref || current.startsWith(`${resolvedHref}/`);
}
