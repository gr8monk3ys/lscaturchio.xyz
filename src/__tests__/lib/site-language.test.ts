import { describe, it, expect } from "vitest";
import {
  SITE_LANGUAGES,
  getActiveLanguage,
  isRtlLanguage,
} from "@/lib/site-language";

// The environment is injectable precisely so the precedence rule can be
// asserted without touching document.cookie or window.location.
describe("getActiveLanguage", () => {
  it("prefers the URL prefix over both cookies", () => {
    expect(
      getActiveLanguage({
        pathname: "/fr/blog",
        cookies: `site_locale=es; googtrans=${encodeURIComponent("/en/hi")}`,
      })
    ).toBe("fr");
  });

  it("falls back to the site locale cookie when the URL has no prefix", () => {
    expect(
      getActiveLanguage({
        pathname: "/blog",
        cookies: `site_locale=es; googtrans=${encodeURIComponent("/en/hi")}`,
      })
    ).toBe("es");
  });

  it("falls back to the googtrans cookie last", () => {
    expect(
      getActiveLanguage({
        pathname: "/blog",
        cookies: `googtrans=${encodeURIComponent("/en/hi")}`,
      })
    ).toBe("hi");
  });

  it("defaults to English when nothing answers", () => {
    expect(getActiveLanguage({})).toBe("en");
    expect(getActiveLanguage({ pathname: "/blog", cookies: "" })).toBe("en");
  });

  it("ignores a googtrans cookie naming a language the site does not carry", () => {
    expect(
      getActiveLanguage({ cookies: `googtrans=${encodeURIComponent("/en/tlh")}` })
    ).toBe("en");
  });

  it("ignores a locale cookie that is not a real segment", () => {
    expect(getActiveLanguage({ cookies: "site_locale=nonsense" })).toBe("en");
  });

  it("maps a URL segment to its Google Translate code, not the segment", () => {
    // The segment is lowercase (zh-cn); the code is not (zh-CN).
    expect(getActiveLanguage({ pathname: "/zh-cn/about" })).toBe("zh-CN");
  });

  it("does not mistake a path that merely starts with those letters", () => {
    expect(getActiveLanguage({ pathname: "/essays" })).toBe("en");
  });
});

describe("SITE_LANGUAGES", () => {
  it("leads with English and carries unique codes", () => {
    expect(SITE_LANGUAGES[0].code).toBe("en");
    const codes = SITE_LANGUAGES.map((entry) => entry.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("is resolvable: every listed language can be reached from a URL", () => {
    for (const { code } of SITE_LANGUAGES) {
      const segment = code.toLowerCase();
      expect(getActiveLanguage({ pathname: `/${segment}/blog` })).toBe(code);
    }
  });
});

describe("isRtlLanguage", () => {
  it("is true for Arabic only", () => {
    expect(isRtlLanguage("ar")).toBe(true);
    for (const { code } of SITE_LANGUAGES.filter((l) => l.code !== "ar")) {
      expect(isRtlLanguage(code)).toBe(false);
    }
  });
});
