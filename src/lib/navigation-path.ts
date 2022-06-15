export function getHrefPath(href: string): string {
  return href.split("#")[0] || href;
}

export function isPathActive(pathname: string, href: string): boolean {
  const resolvedHref = getHrefPath(href);

  if (resolvedHref === "/") {
    return pathname === resolvedHref;
  }

  return pathname === resolvedHref || pathname.startsWith(`${resolvedHref}/`);
}
