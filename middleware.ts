import { NextRequest, NextResponse } from "next/server";

const LOCALE_COOKIE = "site_locale";
const GOOGLE_TRANSLATE_COOKIE = "googtrans";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const DEFAULT_LOCALE = "en";
const SUPPORTED_LOCALES = ["en", "es", "fr", "hi", "ar", "zh-cn"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const SUPPORTED_LOCALE_SET = new Set<string>(SUPPORTED_LOCALES);

const LOCALE_TO_GOOGLE_TRANSLATE: Record<Exclude<SupportedLocale, "en">, string> = {
  es: "es",
  fr: "fr",
  hi: "hi",
  ar: "ar",
  "zh-cn": "zh-CN",
};

function isPublicFile(pathname: string): boolean {
  // Treat anything with a file extension as a public/static file.
  return /\.[a-z0-9]+$/i.test(pathname);
}

function stripLocalePrefix(pathname: string): { locale: SupportedLocale | null; barePath: string } {
  const parts = pathname.split("/").filter(Boolean);
  const maybeLocale = parts[0];
  if (!maybeLocale || !SUPPORTED_LOCALE_SET.has(maybeLocale)) {
    return { locale: null, barePath: pathname };
  }

  const locale = maybeLocale as SupportedLocale;
  const rest = parts.slice(1).join("/");
  const barePath = `/${rest}`.replace(/\/$/, "") || "/";
  return { locale, barePath };
}

function withLocalePrefix(locale: SupportedLocale, barePath: string): string {
  const normalized = barePath.startsWith("/") ? barePath : `/${barePath}`;
  if (locale === DEFAULT_LOCALE) return normalized;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

function setLocaleCookies(response: NextResponse, locale: SupportedLocale): void {
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
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

  const translateCode = LOCALE_TO_GOOGLE_TRANSLATE[locale];
  const value = encodeURIComponent(`/en/${translateCode}`);
  response.cookies.set(GOOGLE_TRANSLATE_COOKIE, value, {
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
    sameSite: "lax",
  });
}

function parseLocaleCookie(value: string | undefined): SupportedLocale {
  if (!value) return DEFAULT_LOCALE;
  return SUPPORTED_LOCALE_SET.has(value) ? (value as SupportedLocale) : DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
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
