import {
  GOOGLE_TRANSLATE_COOKIE,
  LOCALE_COOKIE,
  SITE_LOCALES,
  isLocaleSegment,
  localeToGoogleTranslate,
  stripLocalePrefix,
  type GoogleTranslateCode,
} from "@/lib/site-locale";

/**
 * Which language the reader is currently in.
 *
 * There are three sources that can answer it — the locale prefix on the URL,
 * this site's own locale cookie, and Google Translate's `googtrans` cookie —
 * and they disagree. The precedence between them is the whole point of this
 * module, so it is resolved here rather than advertised.
 *
 * This used to export four separate resolvers plus their two helpers, and a
 * caller had to know which one to reach for and in what order. None of those
 * five names had a single call site outside this file; the two re-exported
 * cookie constants had none either, because `proxy.ts` imports them from
 * `site-locale.ts` directly.
 */

/**
 * A language code here is a Google Translate code (`zh-CN`), not a URL segment
 * (`zh-cn`). The locale table in `site-locale.ts` owns the mapping between them.
 */
export type LanguageCode = GoogleTranslateCode;

/** Display order and labels for the language picker. Codes come from the table. */
export const SITE_LANGUAGES: readonly { code: LanguageCode; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Espanol" },
  { code: "zh-CN", label: "Chinese" },
  { code: "hi", label: "Hindi" },
  { code: "ar", label: "Arabic" },
  { code: "fr", label: "French" },
];

const DEFAULT_LANGUAGE: LanguageCode = "en";

const LANGUAGE_CODE_SET = new Set<string>(
  SITE_LOCALES.map((entry) => entry.googleTranslate)
);

/**
 * Where the answer is read from. Defaults to the live browser; tests pass a
 * literal instead, which is the seam that made the precedence rule testable
 * without touching `document.cookie`.
 */
export interface LanguageEnvironment {
  /** Path including any locale prefix, e.g. "/es/blog". */
  pathname?: string;
  /** A raw `document.cookie` string. */
  cookies?: string;
}

function readBrowserEnvironment(): LanguageEnvironment {
  if (typeof window === "undefined") return {};
  return {
    pathname: window.location.pathname,
    cookies: typeof document === "undefined" ? undefined : document.cookie,
  };
}

function readCookie(cookies: string | undefined, name: string): string | undefined {
  if (!cookies) return undefined;
  const match = cookies.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1];
}

/** `googtrans` is "/from/to"; only the trailing segment names the target. */
function fromGoogleTranslateCookie(
  cookies: string | undefined
): LanguageCode | null {
  const raw = readCookie(cookies, GOOGLE_TRANSLATE_COOKIE);
  if (!raw) return null;

  const parts = decodeURIComponent(raw).split("/");
  const selected = parts[parts.length - 1];

  return selected && LANGUAGE_CODE_SET.has(selected)
    ? (selected as LanguageCode)
    : null;
}

function fromLocaleCookie(cookies: string | undefined): LanguageCode | null {
  const locale = readCookie(cookies, LOCALE_COOKIE);
  return isLocaleSegment(locale) ? localeToGoogleTranslate(locale) : null;
}

function fromPathname(pathname: string | undefined): LanguageCode | null {
  if (!pathname) return null;
  const { locale } = stripLocalePrefix(pathname);
  return locale ? localeToGoogleTranslate(locale) : null;
}

/**
 * The reader's language. Precedence is URL prefix, then this site's locale
 * cookie, then Google Translate's — the URL wins because it is the thing the
 * reader can see and share.
 */
export function getActiveLanguage(
  environment: LanguageEnvironment = readBrowserEnvironment()
): LanguageCode {
  return (
    fromPathname(environment.pathname) ??
    fromLocaleCookie(environment.cookies) ??
    fromGoogleTranslateCookie(environment.cookies) ??
    DEFAULT_LANGUAGE
  );
}

export function isRtlLanguage(language: string): boolean {
  return language === "ar";
}
