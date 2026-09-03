import {
  GOOGLE_TRANSLATE_COOKIE,
  LOCALE_COOKIE,
  SITE_LOCALES,
  isLocaleSegment,
  localeToGoogleTranslate,
  stripLocalePrefix,
  type GoogleTranslateCode,
} from "@/lib/site-locale";

export { GOOGLE_TRANSLATE_COOKIE, LOCALE_COOKIE };

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

const LANGUAGE_CODE_SET = new Set<string>(
  SITE_LOCALES.map((entry) => entry.googleTranslate)
);

export function getCookieValue(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1];
}

export function parseGoogTransCookie(
  cookieValue: string | undefined
): LanguageCode {
  if (!cookieValue) {
    return "en";
  }

  const raw = decodeURIComponent(cookieValue);
  const parts = raw.split("/");
  const selected = parts[parts.length - 1];

  if (!selected || !LANGUAGE_CODE_SET.has(selected)) {
    return "en";
  }

  return selected as LanguageCode;
}

export function getActiveLanguageFromCookies(): LanguageCode {
  return parseGoogTransCookie(getCookieValue(GOOGLE_TRANSLATE_COOKIE));
}

export function getActiveLanguageFromLocaleCookie(): LanguageCode | null {
  const localeCookie = getCookieValue(LOCALE_COOKIE);
  if (!isLocaleSegment(localeCookie)) return null;
  return localeToGoogleTranslate(localeCookie);
}

export function getActiveLanguageFromPathname(
  pathname = typeof window !== "undefined" ? window.location.pathname : ""
): LanguageCode | null {
  if (!pathname) return null;
  const { locale } = stripLocalePrefix(pathname);
  if (!locale) return null;
  return localeToGoogleTranslate(locale);
}

export function getActiveLanguage(): LanguageCode {
  return (
    getActiveLanguageFromPathname() ??
    getActiveLanguageFromLocaleCookie() ??
    getActiveLanguageFromCookies()
  );
}

export function isRtlLanguage(language: string): boolean {
  return language === "ar";
}
