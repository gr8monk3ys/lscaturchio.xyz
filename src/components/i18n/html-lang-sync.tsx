"use client";

import { useEffect } from "react";

const GOOGLE_TRANSLATE_COOKIE = "googtrans";

const SUPPORTED_LANGUAGES = new Set(["en", "es", "zh-CN", "hi", "ar", "fr"]);

function getCookieValue(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1];
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
    const selected = parseGoogTransCookie(getCookieValue(GOOGLE_TRANSLATE_COOKIE));
    document.documentElement.lang = selected;
    document.documentElement.dir = selected === "ar" ? "rtl" : "ltr";
  }, []);

  return null;
}

