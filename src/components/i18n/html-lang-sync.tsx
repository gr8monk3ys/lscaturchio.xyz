"use client";

import { useEffect } from "react";

const GOOGLE_TRANSLATE_COOKIE = "googtrans";
const LOCALE_COOKIE = "site_locale";

const SUPPORTED_LANGUAGES = new Set(["en", "es", "zh-CN", "hi", "ar", "fr"]);
const SUPPORTED_LOCALE_SEGMENTS = new Set(["en", "es", "fr", "hi", "ar", "zh-cn"]);

const LOCALE_TO_LANG: Record<string, string> = {
  en: "en",
  es: "es",
  fr: "fr",
  hi: "hi",
  ar: "ar",
  "zh-cn": "zh-CN",
};

function getCookieValue(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1];
}

function parseLocaleCookie(cookieValue: string | undefined): string | null {
  if (!cookieValue) return null;
  const raw = decodeURIComponent(cookieValue);
  return SUPPORTED_LOCALE_SEGMENTS.has(raw) ? raw : null;
}

function getLocaleFromPathname(): string | null {
  if (typeof window === "undefined") return null;
  const parts = window.location.pathname.split("/").filter(Boolean);
  const maybeLocale = parts[0];
  if (!maybeLocale) return null;
  return SUPPORTED_LOCALE_SEGMENTS.has(maybeLocale) ? maybeLocale : null;
}

function parseGoogTransCookie(cookieValue: string | undefined): string {
  if (!cookieValue) return "en";

  try {
    const raw = decodeURIComponent(cookieValue);
    const parts = raw.split("/");
    const selected = parts[parts.length - 1];
    if (selected && SUPPORTED_LANGUAGES.has(selected)) {
      return selected;
    }
  } catch {
    // ignore
  }

  return "en";
}

export function HtmlLangSync() {
  useEffect(() => {
    const localeFromPath = getLocaleFromPathname();
    const localeFromCookie = parseLocaleCookie(getCookieValue(LOCALE_COOKIE));

    const selectedFromLocale = localeFromPath ?? localeFromCookie;
    const selected =
      (selectedFromLocale ? LOCALE_TO_LANG[selectedFromLocale] : null) ??
      parseGoogTransCookie(getCookieValue(GOOGLE_TRANSLATE_COOKIE));

    document.documentElement.lang = selected;
    document.documentElement.dir = selected === "ar" ? "rtl" : "ltr";
  }, []);

  return null;
}
