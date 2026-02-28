"use client";

import dynamic from "next/dynamic";

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

export function ClientEnhancements() {
  return (
    <>
      <GoogleTranslateProvider />
      <HtmlLangSync />
      <PWARegister />
      <ScrollToTop />
    </>
  );
}
