import { NextRequest, NextResponse } from "next/server";

import {
  DEFAULT_LOCALE,
  GOOGLE_TRANSLATE_COOKIE,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE_SECONDS,
  localeToGoogleTranslate,
  parseLocaleCookie,
  stripLocalePrefix,
  withLocalePrefix,
  type LocaleSegment,
} from "@/lib/site-locale";

function isPublicFile(pathname: string): boolean {
  // Treat anything with a file extension as a public/static file.
  return /\.[a-z0-9]+$/i.test(pathname);
}

function setLocaleCookies(response: NextResponse, locale: LocaleSegment): void {
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE_SECONDS,
    sameSite: "lax",
  });

  if (locale === DEFAULT_LOCALE) {
    response.cookies.set(GOOGLE_TRANSLATE_COOKIE, "", {
      path: "/",
      maxAge: 0,
      sameSite: "lax",
    });
    return;
  }

  // The URL segment is lowercase (/zh-cn); Google Translate wants zh-CN.
  const translateCode = localeToGoogleTranslate(locale);
  const value = encodeURIComponent(`/en/${translateCode}`);
  response.cookies.set(GOOGLE_TRANSLATE_COOKIE, value, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE_SECONDS,
    sameSite: "lax",
  });
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never touch API routes, Next internals, or static assets.
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    isPublicFile(pathname)
  ) {
    return NextResponse.next();
  }

  const { locale: pathLocale, barePath } = stripLocalePrefix(pathname);
  const cookieLocale = parseLocaleCookie(request.cookies.get(LOCALE_COOKIE)?.value);

  // If the URL contains a locale prefix, it wins (and we rewrite internally).
  if (pathLocale) {
    // Treat /en/* as canonical without the /en prefix.
    if (pathLocale === DEFAULT_LOCALE) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = barePath;
      const response = NextResponse.redirect(redirectUrl);
      // Explicitly selecting English should clear any prior locale cookies.
      setLocaleCookies(response, DEFAULT_LOCALE);
      return response;
    }

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = barePath;
    const response = NextResponse.rewrite(rewriteUrl);
    setLocaleCookies(response, pathLocale);
    return response;
  }

  // If user has a non-default locale cookie, keep URLs consistently prefixed.
  if (cookieLocale !== DEFAULT_LOCALE) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = withLocalePrefix(cookieLocale, pathname);
    const response = NextResponse.redirect(redirectUrl);
    setLocaleCookies(response, cookieLocale);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|api/).*)"],
};
