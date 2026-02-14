"use client";

import { usePathname } from "next/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lscaturchio.xyz";

const LOCALES = [
  { locale: "en", hrefLang: "en" },
  { locale: "es", hrefLang: "es" },
  { locale: "fr", hrefLang: "fr" },
  { locale: "hi", hrefLang: "hi" },
  { locale: "ar", hrefLang: "ar" },
  { locale: "zh-cn", hrefLang: "zh-CN" },
] as const;

const LOCALE_SEGMENT_SET = new Set<string>(LOCALES.map((entry) => entry.locale));

function stripLocalePrefix(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  const maybeLocale = parts[0];

  if (maybeLocale && LOCALE_SEGMENT_SET.has(maybeLocale)) {
    const rest = parts.slice(1).join("/");
    return `/${rest}`.replace(/\/$/, "") || "/";
  }

  return (pathname || "/").replace(/\/$/, "") || "/";
}

function withLocalePrefix(locale: string, barePath: string): string {
  const normalized = (barePath || "/").startsWith("/") ? (barePath || "/") : `/${barePath || ""}`;
  if (locale === "en") return normalized;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

function absolute(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function HreflangLinks() {
  const pathname = usePathname() || "/";
  const barePath = stripLocalePrefix(pathname);

  const xDefaultHref = absolute(withLocalePrefix("en", barePath));

  return (
    <>
      <link rel="alternate" hrefLang="x-default" href={xDefaultHref} />
      {LOCALES.map((entry) => (
        <link
          key={entry.locale}
          rel="alternate"
          hrefLang={entry.hrefLang}
          href={absolute(withLocalePrefix(entry.locale, barePath))}
        />
      ))}
    </>
  );
}

