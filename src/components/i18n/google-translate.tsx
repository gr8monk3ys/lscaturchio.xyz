"use client";

import { Globe } from "lucide-react";
import Script from "next/script";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type GoogleTranslateConstructor = new (
  options: Record<string, unknown>,
  containerId: string
) => unknown;

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement?: GoogleTranslateConstructor & {
          InlineLayout?: {
            SIMPLE?: string;
          };
        };
      };
    };
  }
}

const GOOGLE_TRANSLATE_COOKIE = "googtrans";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const SITE_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Espanol" },
  { code: "zh-CN", label: "Chinese" },
  { code: "hi", label: "Hindi" },
  { code: "ar", label: "Arabic" },
  { code: "fr", label: "French" },
] as const;

type LanguageCode = (typeof SITE_LANGUAGES)[number]["code"];

const LANGUAGE_CODE_SET = new Set<string>(SITE_LANGUAGES.map((language) => language.code));

function parseGoogTransCookie(cookieValue: string | undefined): LanguageCode {
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

function getCookieValue(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1];
}

function getActiveLanguageFromCookies(): LanguageCode {
  return parseGoogTransCookie(getCookieValue(GOOGLE_TRANSLATE_COOKIE));
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

export function applyLanguage(language: LanguageCode): void {
  setGoogleTranslateCookie(language);
  if (typeof window !== "undefined") {
    window.location.reload();
  }
}

function initializeGoogleTranslateElement(): void {
  const GoogleTranslateElement = window.google?.translate?.TranslateElement;
  if (!GoogleTranslateElement) return;
  const container = document.getElementById("google_translate_element");
  if (container?.childElementCount) return;

  const InlineLayout = GoogleTranslateElement.InlineLayout;
  const layoutValue = InlineLayout?.SIMPLE ?? "SIMPLE";
  const includedLanguages = SITE_LANGUAGES.map((language) => language.code).join(",");

  new GoogleTranslateElement(
    {
      pageLanguage: "en",
      includedLanguages,
      autoDisplay: false,
      layout: layoutValue,
    },
    "google_translate_element"
  );
}

export function GoogleTranslateProvider() {
  useEffect(() => {
    window.googleTranslateElementInit = () => {
      initializeGoogleTranslateElement();
    };

    if (window.google?.translate?.TranslateElement) {
      initializeGoogleTranslateElement();
    }

    return () => {
      delete window.googleTranslateElementInit;
    };
  }, []);

  return (
    <>
      <div id="google_translate_element" className="sr-only" aria-hidden />
      <Script
        id="google-translate-script"
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  );
}

interface LanguageSwitcherProps {
  compact?: boolean;
  className?: string;
}

export function LanguageSwitcher({ compact = false, className }: LanguageSwitcherProps) {
  const [language, setLanguage] = useState<LanguageCode>("en");
  const ariaLabel = useMemo(() => "Select language", []);

  useEffect(() => {
    setLanguage(getActiveLanguageFromCookies());
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLanguage = event.target.value as LanguageCode;
    setLanguage(nextLanguage);
    applyLanguage(nextLanguage);
  };

  return (
    <label
      className={cn(
        "relative inline-flex items-center overflow-hidden rounded-xl border border-border bg-background text-sm text-foreground",
        compact ? "h-9 px-2.5" : "h-10 px-3",
        className
      )}
    >
      <Globe className={cn("mr-2 shrink-0 text-muted-foreground", compact ? "h-4 w-4" : "h-4 w-4")} />
      <select
        aria-label={ariaLabel}
        className={cn(
          "bg-transparent pr-1 text-foreground outline-none",
          compact ? "text-xs" : "text-sm"
        )}
        value={language}
        onChange={handleChange}
      >
        {SITE_LANGUAGES.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
