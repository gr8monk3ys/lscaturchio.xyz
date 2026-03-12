"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { SITE_LANGUAGES, getActiveLanguage } from "@/lib/site-language";

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
  const [shouldLoadScript] = useState(() => getActiveLanguage() !== "en");

  useEffect(() => {
    if (!shouldLoadScript) return;

    window.googleTranslateElementInit = () => {
      initializeGoogleTranslateElement();
    };

    if (window.google?.translate?.TranslateElement) {
      initializeGoogleTranslateElement();
    }

    return () => {
      delete window.googleTranslateElementInit;
    };
  }, [shouldLoadScript]);

  return (
    <>
      <div id="google_translate_element" className="sr-only" aria-hidden suppressHydrationWarning />
      {shouldLoadScript && (
        <Script
          id="google-translate-script"
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
