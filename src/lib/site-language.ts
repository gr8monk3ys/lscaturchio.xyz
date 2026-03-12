import {
  isLocaleSegment,
  stripLocalePrefix,
  withLocalePrefix,
  type LocaleSegment,
} from "@/lib/site-locale";

export const GOOGLE_TRANSLATE_COOKIE = "googtrans";
export const LOCALE_COOKIE = "site_locale";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

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

const LANGUAGE_TO_LOCALE_SEGMENT: Record<LanguageCode, LocaleSegment> = {
  en: "en",
  es: "es",
  fr: "fr",
  hi: "hi",
  ar: "ar",
  "zh-CN": "zh-cn",
};

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

function setGoogleTranslateCookie(language: LanguageCode): void {
  if (typeof document === "undefined") return;

  if (language === "en") {
    document.cookie = `${GOOGLE_TRANSLATE_COOKIE}=;path=/;max-age=0;SameSite=Lax`;
    return;
  }

  const value = encodeURIComponent(`/en/${language}`);
  document.cookie = `${GOOGLE_TRANSLATE_COOKIE}=${value};path=/;max-age=${COOKIE_MAX_AGE_SECONDS};SameSite=Lax`;
}

function setLocaleCookie(locale: LocaleSegment): void {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${COOKIE_MAX_AGE_SECONDS};SameSite=Lax`;
}

export function applyLanguage(language: LanguageCode): void {
  if (typeof window === "undefined") return;

  const locale = LANGUAGE_TO_LOCALE_SEGMENT[language];
  const { barePath } = stripLocalePrefix(window.location.pathname);

  setLocaleCookie(locale);
  setGoogleTranslateCookie(language);

  const targetPath = withLocalePrefix(locale, barePath);
  const targetUrl = `${targetPath}${window.location.search}${window.location.hash}`;
  window.location.assign(targetUrl);
}

export function isRtlLanguage(language: string): boolean {
  return language === "ar";
}
