import { SITE_URL } from "@/lib/site-url";

export const DEFAULT_LOCALE = "en";

export const SITE_LOCALES = [
  { locale: "en", hrefLang: "en" },
  { locale: "es", hrefLang: "es" },
  { locale: "fr", hrefLang: "fr" },
  { locale: "hi", hrefLang: "hi" },
  { locale: "ar", hrefLang: "ar" },
  { locale: "zh-cn", hrefLang: "zh-CN" },
] as const;

export type LocaleSegment = (typeof SITE_LOCALES)[number]["locale"];

const LOCALE_SEGMENT_SET = new Set<string>(
  SITE_LOCALES.map((entry) => entry.locale)
);

function normalizePath(pathname: string): string {
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return withLeadingSlash.replace(/\/$/, "") || "/";
}

export function isLocaleSegment(
  value: string | null | undefined
): value is LocaleSegment {
  return !!value && LOCALE_SEGMENT_SET.has(value);
}

export function stripLocalePrefix(pathname: string): {
  locale: LocaleSegment | null;
  barePath: string;
} {
  const normalized = normalizePath(pathname || "/");
  const parts = normalized.split("/").filter(Boolean);
  const maybeLocale = parts[0];

  if (!isLocaleSegment(maybeLocale)) {
    return { locale: null, barePath: normalized };
  }

  const rest = parts.slice(1).join("/");
  return {
    locale: maybeLocale,
    barePath: normalizePath(rest ? `/${rest}` : "/"),
  };
}

export function withLocalePrefix(
  locale: LocaleSegment,
  barePath: string
): string {
  const normalized = normalizePath(barePath || "/");
  if (locale === DEFAULT_LOCALE) return normalized;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

export function absoluteSitePath(path: string): string {
  return `${SITE_URL}${normalizePath(path)}`;
}
