"use client";

import dynamic from "next/dynamic";
import { useEffect, useReducer } from "react";
import { getActiveLanguage, isRtlLanguage } from "@/lib/site-language";

const GoogleTranslateProvider = dynamic(
  () =>
    import("@/components/i18n/google-translate").then(
      (module) => module.GoogleTranslateProvider
    ),
  { ssr: false }
);

const HtmlLangSync = dynamic(
  () =>
    import("@/components/i18n/html-lang-sync").then(
      (module) => module.HtmlLangSync
    ),
  { ssr: false }
);

const PWARegister = dynamic(
  () => import("@/components/pwa-register").then((module) => module.PWARegister),
  { ssr: false }
);

const ScrollToTop = dynamic(
  () =>
    import("@/components/ui/scroll-to-top").then(
      (module) => module.ScrollToTop
    ),
  { ssr: false }
);

type FeatureState = {
  googleTranslate: boolean;
  htmlLangSync: boolean;
  pwaRegister: boolean;
  scrollToTop: boolean;
};

type FeatureKey = keyof FeatureState;

const INITIAL_FEATURE_STATE: FeatureState = {
  googleTranslate: false,
  htmlLangSync: false,
  pwaRegister: false,
  scrollToTop: false,
};

function featureReducer(state: FeatureState, key: FeatureKey): FeatureState {
  if (state[key]) {
    return state;
  }

  return {
    ...state,
    [key]: true,
  };
}

function scheduleIdleWork(callback: () => void, timeout = 1500) {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    const idleCallbackId = window.requestIdleCallback(callback, { timeout });
    return () => window.cancelIdleCallback(idleCallbackId);
  }

  const timeoutId = globalThis.setTimeout(callback, 1);
  return () => globalThis.clearTimeout(timeoutId);
}

export function ClientEnhancements() {
  const [features, enableFeature] = useReducer(
    featureReducer,
    INITIAL_FEATURE_STATE
  );

  useEffect(() => {
    const activeLanguage = getActiveLanguage();
    const shouldLoadGoogleTranslate = activeLanguage !== "en";
    const shouldSyncHtmlLanguage =
      shouldLoadGoogleTranslate || isRtlLanguage(activeLanguage);

    if (shouldSyncHtmlLanguage) {
      enableFeature("htmlLangSync");
    }

    if (shouldLoadGoogleTranslate) {
      enableFeature("googleTranslate");
    }

    const cancelPwaRegistration = scheduleIdleWork(() => {
      enableFeature("pwaRegister");
    }, 2500);

    const loadScrollToTop = () => {
      enableFeature("scrollToTop");
      window.removeEventListener("scroll", loadScrollToTop);
    };

    window.addEventListener("scroll", loadScrollToTop, { passive: true });

    return () => {
      cancelPwaRegistration();
      window.removeEventListener("scroll", loadScrollToTop);
    };
  }, []);

  return (
    <>
      {features.googleTranslate ? <GoogleTranslateProvider /> : null}
      {features.htmlLangSync ? <HtmlLangSync /> : null}
      {features.pwaRegister ? <PWARegister /> : null}
      {features.scrollToTop ? <ScrollToTop /> : null}
    </>
  );
}
