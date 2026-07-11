import {
  isLocaleSegment,
  stripLocalePrefix,
  type LocaleSegment,
} from "@/lib/site-locale";

export const GOOGLE_TRANSLATE_COOKIE = "googtrans";
export const LOCALE_COOKIE = "site_locale";

export const SITE_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Espanol" },
  { code: "zh-CN", label: "Chinese" },
  { code: "hi", label: "Hindi" },
  { code: "ar", label: "Arabic" },
  { code: "fr", label: "French" },
] as const;

export type LanguageCode = (typeof SITE_LANGUAGES)[number]["code"];

const LANGUAGE_CODE_SET = new Set<string>(
  SITE_LANGUAGES.map((language) => language.code)
);

const LOCALE_SEGMENT_TO_LANGUAGE: Record<LocaleSegment, LanguageCode> = {
  en: "en",
  es: "es",
  fr: "fr",
  hi: "hi",
  ar: "ar",
  "zh-cn": "zh-CN",
};

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
  return LOCALE_SEGMENT_TO_LANGUAGE[localeCookie];
}

export function getActiveLanguageFromPathname(
  pathname = typeof window !== "undefined" ? window.location.pathname : ""
): LanguageCode | null {
  if (!pathname) return null;
  const { locale } = stripLocalePrefix(pathname);
  if (!locale) return null;
  return LOCALE_SEGMENT_TO_LANGUAGE[locale];
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
