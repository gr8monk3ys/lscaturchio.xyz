import { describe, it, expect } from "vitest";
import {
  SITE_LOCALES,
  isLocaleSegment,
  localeToGoogleTranslate,
  parseLocaleCookie,
  stripLocalePrefix,
  withLocalePrefix,
} from "@/lib/site-locale";

describe("the locale table", () => {
  it("keeps every URL segment lowercase", () => {
    for (const entry of SITE_LOCALES) {
      expect(entry.locale).toBe(entry.locale.toLowerCase());
    }
  });

  it("spells Chinese lowercase in URLs and region-uppercase for Google", () => {
    expect(isLocaleSegment("zh-cn")).toBe(true);
    expect(isLocaleSegment("zh-CN")).toBe(false);
    expect(localeToGoogleTranslate("zh-cn")).toBe("zh-CN");
  });

  it("maps every other locale to itself", () => {
    for (const entry of SITE_LOCALES) {
      if (entry.locale === "zh-cn") continue;
      expect(localeToGoogleTranslate(entry.locale)).toBe(entry.locale);
    }
  });
});

describe("stripLocalePrefix", () => {
  it("splits a supported prefix off the path", () => {
    expect(stripLocalePrefix("/es/blog/post")).toEqual({
      locale: "es",
      barePath: "/blog/post",
    });
  });

  it("reduces a bare locale segment to the root path", () => {
    expect(stripLocalePrefix("/zh-cn")).toEqual({ locale: "zh-cn", barePath: "/" });
    expect(stripLocalePrefix("/zh-cn/")).toEqual({ locale: "zh-cn", barePath: "/" });
  });

  it("leaves an unsupported prefix in place", () => {
    expect(stripLocalePrefix("/de/blog").locale).toBeNull();
    expect(stripLocalePrefix("/zh-CN/blog").locale).toBeNull();
    expect(stripLocalePrefix("/blog")).toEqual({ locale: null, barePath: "/blog" });
  });

  it("normalizes empty and relative input to the root path", () => {
    expect(stripLocalePrefix("")).toEqual({ locale: null, barePath: "/" });
    expect(stripLocalePrefix("blog")).toEqual({ locale: null, barePath: "/blog" });
  });
});

describe("withLocalePrefix", () => {
  it("round-trips with stripLocalePrefix", () => {
    expect(withLocalePrefix("fr", "/blog")).toBe("/fr/blog");
    expect(stripLocalePrefix("/fr/blog").barePath).toBe("/blog");
  });

  it("adds no prefix for the default locale", () => {
    expect(withLocalePrefix("en", "/blog")).toBe("/blog");
  });

  it("turns the root path into a bare locale segment", () => {
    expect(withLocalePrefix("ar", "/")).toBe("/ar");
  });

  it("preserves a trailing slash rather than rewriting the URL shape", () => {
    expect(withLocalePrefix("es", "/blog/")).toBe("/es/blog/");
  });
});

describe("parseLocaleCookie", () => {
  it("accepts a known segment and falls back to English otherwise", () => {
    expect(parseLocaleCookie("hi")).toBe("hi");
    expect(parseLocaleCookie("zh-CN")).toBe("en");
    expect(parseLocaleCookie(undefined)).toBe("en");
    expect(parseLocaleCookie("")).toBe("en");
  });
});
