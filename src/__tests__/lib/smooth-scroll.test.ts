import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  HEADER_OFFSET,
  pauseScroller,
  prefersReducedMotion,
  resumeScroller,
  scrollToElement,
  scrollToY,
  setScroller,
} from "@/lib/smooth-scroll";

/**
 * The site's one scroll authority.
 *
 * Before this module there were four independent `behavior: "smooth"` calls and
 * three of them ignored `prefers-reduced-motion`, against DESIGN.md's line that
 * every motion collapses to none. So the reduced-motion branch is the point of
 * most of these cases: it is the behaviour that was missing, and it is
 * invisible unless you go looking for it.
 */

type FakeScroller = {
  scrollTo: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  start: ReturnType<typeof vi.fn>;
};

function fakeScroller(): FakeScroller {
  return { scrollTo: vi.fn(), stop: vi.fn(), start: vi.fn() };
}

function setReducedMotion(reduce: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduce && query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

let windowScrollTo: ReturnType<typeof vi.fn>;

beforeEach(() => {
  setReducedMotion(false);
  windowScrollTo = vi.fn();
  vi.stubGlobal("scrollTo", windowScrollTo);
  setScroller(null);
});

afterEach(() => {
  setScroller(null);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("prefersReducedMotion", () => {
  it("reports the media query", () => {
    setReducedMotion(true);
    expect(prefersReducedMotion()).toBe(true);
    setReducedMotion(false);
    expect(prefersReducedMotion()).toBe(false);
  });
});

describe("scrollToY", () => {
  it("uses the scroller when one is running", () => {
    const scroller = fakeScroller();
    setScroller(scroller as never);

    scrollToY(400);

    expect(scroller.scrollTo).toHaveBeenCalledWith(400);
    expect(windowScrollTo).not.toHaveBeenCalled();
  });

  it("falls back to native smooth scrolling with no scroller", () => {
    scrollToY(400);
    expect(windowScrollTo).toHaveBeenCalledWith({ top: 400, behavior: "smooth" });
  });

  it("jumps instantly under reduced motion, even with a scroller running", () => {
    // The scroller is never constructed under reduced motion in practice, but
    // a reader can flip the preference mid-session, and the helper must not
    // animate in that window either.
    setReducedMotion(true);
    const scroller = fakeScroller();
    setScroller(scroller as never);

    scrollToY(400);

    expect(scroller.scrollTo).not.toHaveBeenCalled();
    expect(windowScrollTo).toHaveBeenCalledWith({ top: 400, behavior: "auto" });
  });

  it("jumps instantly when the caller asks", () => {
    scrollToY(400, { immediate: true });
    expect(windowScrollTo).toHaveBeenCalledWith({ top: 400, behavior: "auto" });
  });
});

describe("scrollToElement", () => {
  function plantTarget(id = "retrieval") {
    const el = document.createElement("h2");
    el.id = id;
    el.scrollIntoView = vi.fn();
    document.body.appendChild(el);
    return el;
  }

  it("clears the fixed header by passing the offset explicitly", () => {
    // CSS `scroll-margin-top` is honoured by native scrollIntoView and ignored
    // by a library's own scrollTo, so the 112px has to travel with the call or
    // every anchor lands underneath the navbar.
    const el = plantTarget();
    const scroller = fakeScroller();
    setScroller(scroller as never);

    scrollToElement("retrieval");

    expect(scroller.scrollTo).toHaveBeenCalledWith(el, { offset: -HEADER_OFFSET });
  });

  it("takes an element as readily as an id", () => {
    const el = plantTarget();
    const scroller = fakeScroller();
    setScroller(scroller as never);

    scrollToElement(el);

    expect(scroller.scrollTo).toHaveBeenCalledWith(el, { offset: -HEADER_OFFSET });
  });

  it("accepts a zero offset for a target inside its own scroll pane", () => {
    const el = plantTarget();
    const scroller = fakeScroller();
    setScroller(scroller as never);

    scrollToElement(el, { offset: 0 });

    expect(scroller.scrollTo).toHaveBeenCalledWith(el, { offset: 0 });
  });

  it("does not subtract the header twice on the native path", () => {
    // `scroll-margin-top` already accounts for it there.
    const el = plantTarget();

    scrollToElement("retrieval");

    expect(el.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
  });

  it("jumps instantly under reduced motion", () => {
    setReducedMotion(true);
    const el = plantTarget();

    scrollToElement("retrieval");

    expect(el.scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
  });

  it("does nothing when the target is missing", () => {
    const scroller = fakeScroller();
    setScroller(scroller as never);

    expect(() => scrollToElement("no-such-heading")).not.toThrow();
    expect(scroller.scrollTo).not.toHaveBeenCalled();
  });
});

describe("pause and resume", () => {
  it("stops and starts the scroller", () => {
    // The ask drawer locks `body { overflow: hidden }`; a scroller left running
    // behind that lock moves a page the reader cannot see.
    const scroller = fakeScroller();
    setScroller(scroller as never);

    pauseScroller();
    expect(scroller.stop).toHaveBeenCalledTimes(1);

    resumeScroller();
    expect(scroller.start).toHaveBeenCalledTimes(1);
  });

  it("is safe with no scroller running", () => {
    expect(() => {
      pauseScroller();
      resumeScroller();
    }).not.toThrow();
  });
});
