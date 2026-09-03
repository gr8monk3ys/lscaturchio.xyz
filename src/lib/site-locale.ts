import { SITE_URL } from "@/lib/site-url";

/**
 * The single source of truth for the locale seam: the supported-locale table,
 * the URL prefix helpers, and the cookie names. `src/proxy.ts` and
 * `src/lib/site-language.ts` import from here rather than restating any of it.
 *
 * Three spellings of the same language coexist on purpose:
 *   - `locale`         the URL path segment. Lowercase, because it is a URL:  /zh-cn/blog
 *   - `hrefLang`       the value for <link rel="alternate" hreflang>:          zh-CN
 *   - `googleTranslate` what the Google Translate widget and its `googtrans`
 *                      cookie expect:                                          zh-CN
 *
 * The zh-cn / zh-CN difference is LOAD-BEARING, not drift. Collapsing it either
 * uppercases a URL segment or hands Google a code it does not recognise.
 * `localeToGoogleTranslate()` is the one named place that converts between them.
 */
export const SITE_LOCALES = [
  { locale: "en", hrefLang: "en", googleTranslate: "en" },
  { locale: "es", hrefLang: "es", googleTranslate: "es" },
  { locale: "fr", hrefLang: "fr", googleTranslate: "fr" },
  { locale: "hi", hrefLang: "hi", googleTranslate: "hi" },
  { locale: "ar", hrefLang: "ar", googleTranslate: "ar" },
  { locale: "zh-cn", hrefLang: "zh-CN", googleTranslate: "zh-CN" },
] as const;

export type LocaleSegment = (typeof SITE_LOCALES)[number]["locale"];
export type GoogleTranslateCode = (typeof SITE_LOCALES)[number]["googleTranslate"];

export const DEFAULT_LOCALE: LocaleSegment = "en";

/** Cookie the site sets to remember the reader's locale choice. */
export const LOCALE_COOKIE = "site_locale";
/** Cookie the Google Translate widget reads, formatted `/<from>/<to>`. */
export const GOOGLE_TRANSLATE_COOKIE = "googtrans";
export const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const LOCALE_SEGMENT_SET = new Set<string>(
  SITE_LOCALES.map((entry) => entry.locale)
);

const LOCALE_TO_GOOGLE_TRANSLATE = Object.fromEntries(
  SITE_LOCALES.map((entry) => [entry.locale, entry.googleTranslate])
) as Record<LocaleSegment, GoogleTranslateCode>;

function normalizePath(pathname: string): string {
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return withLeadingSlash.replace(/\/$/, "") || "/";
}

export function isLocaleSegment(
  value: string | null | undefined
): value is LocaleSegment {
  return !!value && LOCALE_SEGMENT_SET.has(value);
}

/**
 * Converts a URL path segment (`zh-cn`) to the code Google Translate wants
 * (`zh-CN`). Named rather than inlined so the casing change reads as deliberate.
 */
export function localeToGoogleTranslate(
  locale: LocaleSegment
): GoogleTranslateCode {
  return LOCALE_TO_GOOGLE_TRANSLATE[locale];
}

export function stripLocalePrefix(pathname: string): {
  locale: LocaleSegment | null;
  barePath: string;
} {
  const normalized = normalizePath(pathname || "/");
  const parts = normalized.split("/").filter(Boolean);
  const maybeLocale = parts[0];

  if (!isLocaleSegment(maybeLocale)) {
    return { locale: null, barePath: normalized };
  }

  const rest = parts.slice(1).join("/");
  return {
    locale: maybeLocale,
    barePath: normalizePath(rest ? `/${rest}` : "/"),
  };
}

/**
 * Re-attaches a locale prefix. Deliberately does NOT normalize a trailing
 * slash: the proxy feeds it the raw request pathname and a redirect must not
 * quietly change the shape of the URL it was given.
 */
export function withLocalePrefix(
  locale: LocaleSegment,
  barePath: string
): string {
  const normalized = barePath.startsWith("/") ? barePath : `/${barePath}`;
  if (locale === DEFAULT_LOCALE) return normalized;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

/** Reads the locale cookie, falling back to the default for anything unknown. */
export function parseLocaleCookie(value: string | undefined): LocaleSegment {
  return isLocaleSegment(value) ? value : DEFAULT_LOCALE;
}

export function absoluteSitePath(path: string): string {
  return `${SITE_URL}${normalizePath(path)}`;
}
