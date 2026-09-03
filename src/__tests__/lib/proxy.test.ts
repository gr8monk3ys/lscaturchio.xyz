import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";

import { proxy } from "@/proxy";

/**
 * The test environment (happy-dom) strips `cookie` from request headers as a
 * forbidden header name, so the request's cookie jar is populated directly.
 */
function request(pathname: string, localeCookie?: string): NextRequest {
  const req = new NextRequest(new URL(`https://lscaturchio.xyz${pathname}`));
  if (localeCookie !== undefined) {
    req.cookies.set("site_locale", localeCookie);
  }
  return req;
}

/** NextResponse.next() marks itself with this header; a rewrite/redirect does not. */
function isPassThrough(response: Response): boolean {
  return response.headers.get("x-middleware-next") === "1";
}

function rewrittenTo(response: Response): string | null {
  const target = response.headers.get("x-middleware-rewrite");
  return target ? new URL(target).pathname : null;
}

function redirectedTo(response: Response): string | null {
  const target = response.headers.get("location");
  return target ? new URL(target, "https://lscaturchio.xyz").pathname : null;
}

describe("proxy", () => {
  describe("paths it must never touch", () => {
    it.each(["/api/chat", "/_next/static/chunk.js", "/favicon.ico"])(
      "passes %s straight through",
      (pathname) => {
        expect(isPassThrough(proxy(request(pathname)))).toBe(true);
      }
    );

    it.each(["/images/hero.png", "/my-data/blog-notes.md", "/robots.txt"])(
      "treats %s as a public file even with a locale cookie set",
      (pathname) => {
        const response = proxy(request(pathname, "es"));
        expect(isPassThrough(response)).toBe(true);
        expect(redirectedTo(response)).toBeNull();
      }
    );
  });

  describe("a bare path", () => {
    it("is left alone when there is no locale cookie", () => {
      const response = proxy(request("/blog"));
      expect(isPassThrough(response)).toBe(true);
      expect(rewrittenTo(response)).toBeNull();
    });

    it("is left alone when the cookie names the default locale", () => {
      expect(isPassThrough(proxy(request("/blog", "en")))).toBe(true);
    });

    it("is left alone when the cookie holds an unknown value", () => {
      expect(isPassThrough(proxy(request("/blog", "klingon")))).toBe(
        true
      );
    });

    it("is redirected to the cookie's locale prefix", () => {
      const response = proxy(request("/blog", "es"));
      expect(redirectedTo(response)).toBe("/es/blog");
    });

    it("redirects the site root to a bare locale segment", () => {
      expect(redirectedTo(proxy(request("/", "zh-cn")))).toBe("/zh-cn");
    });
  });

  describe("a supported locale prefix", () => {
    it("is rewritten to the bare path, not redirected", () => {
      const response = proxy(request("/es/blog"));
      expect(rewrittenTo(response)).toBe("/blog");
      expect(redirectedTo(response)).toBeNull();
    });

    it("rewrites a bare locale segment to the site root", () => {
      expect(rewrittenTo(proxy(request("/fr")))).toBe("/");
    });

    it("beats a conflicting locale cookie", () => {
      const response = proxy(request("/fr/blog", "es"));
      expect(rewrittenTo(response)).toBe("/blog");
      expect(response.cookies.get("site_locale")?.value).toBe("fr");
    });

    it("redirects /en/* to the unprefixed canonical path", () => {
      expect(redirectedTo(proxy(request("/en/blog")))).toBe("/blog");
    });
  });

  describe("an unsupported locale prefix", () => {
    it.each(["/de/blog", "/zh-CN/blog", "/ZH-CN"])(
      "leaves %s for the app to 404",
      (pathname) => {
        const response = proxy(request(pathname));
        expect(isPassThrough(response)).toBe(true);
        expect(rewrittenTo(response)).toBeNull();
      }
    );
  });

  describe("the cookies it sets", () => {
    it("records the locale segment and the Google Translate pair", () => {
      const response = proxy(request("/es/blog"));
      expect(response.cookies.get("site_locale")?.value).toBe("es");
      expect(
        decodeURIComponent(response.cookies.get("googtrans")?.value ?? "")
      ).toBe("/en/es");
    });

    it("uppercases the region for Google while the URL stays lowercase", () => {
      const response = proxy(request("/zh-cn/blog"));
      expect(response.cookies.get("site_locale")?.value).toBe("zh-cn");
      expect(
        decodeURIComponent(response.cookies.get("googtrans")?.value ?? "")
      ).toBe("/en/zh-CN");
    });

    it("clears googtrans when English is chosen explicitly", () => {
      const response = proxy(request("/en/blog"));
      const googtrans = response.cookies.get("googtrans");
      expect(googtrans?.value).toBe("");
      expect(googtrans?.maxAge).toBe(0);
      expect(response.cookies.get("site_locale")?.value).toBe("en");
    });

    it("persists the locale cookie for a year, scoped to the whole site", () => {
      const cookie = proxy(request("/ar")).cookies.get("site_locale");
      expect(cookie?.maxAge).toBe(60 * 60 * 24 * 365);
      expect(cookie?.path).toBe("/");
      expect(cookie?.sameSite).toBe("lax");
    });

    it("sets no cookies on a path it passes through", () => {
      expect(proxy(request("/blog")).cookies.getAll()).toHaveLength(0);
    });
  });
});
