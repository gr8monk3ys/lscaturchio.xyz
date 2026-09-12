import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { SWRConfig } from "swr";
import { ViewCounter } from "@/components/blog/view-counter";

vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function renderWithSWR(ui: ReactNode) {
  return render(
    <SWRConfig
      value={{ provider: () => new Map(), dedupingInterval: 0, errorRetryCount: 0 }}
    >
      {ui}
    </SWRConfig>
  );
}

function jsonResponse(body: unknown) {
  return { ok: true, status: 200, json: async () => ({ data: body, success: true }) };
}

function postCalls() {
  return mockFetch.mock.calls.filter(
    ([, init]) => (init as RequestInit | undefined)?.method === "POST"
  );
}

describe("ViewCounter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("fetches the view count and renders it", async () => {
    mockFetch.mockImplementation(async () => jsonResponse({ views: 42 }));

    renderWithSWR(<ViewCounter slug="my-post" />);

    await waitFor(() => {
      expect(screen.getByText("42 views")).toBeInTheDocument();
    });
    expect(mockFetch).toHaveBeenCalledWith("/api/views?slug=my-post", undefined);
  });

  it("posts a view on first visit and marks the session as viewed", async () => {
    mockFetch.mockImplementation(async () => jsonResponse({ views: 8 }));

    renderWithSWR(<ViewCounter slug="fresh-post" />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/views",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: "fresh-post" }),
        })
      );
    });
    await waitFor(() => {
      expect(sessionStorage.getItem("viewed_fresh-post")).toBe("true");
    });
  });

  it("does not post again when the post was already viewed this session", async () => {
    sessionStorage.setItem("viewed_seen-post", "true");
    mockFetch.mockImplementation(async () => jsonResponse({ views: 100 }));

    renderWithSWR(<ViewCounter slug="seen-post" />);

    await waitFor(() => {
      expect(screen.getByText("100 views")).toBeInTheDocument();
    });
    expect(postCalls()).toHaveLength(0);
  });

  it("uses the singular label for exactly one view", async () => {
    sessionStorage.setItem("viewed_single-post", "true");
    mockFetch.mockImplementation(async () => jsonResponse({ views: 1 }));

    renderWithSWR(<ViewCounter slug="single-post" />);

    await waitFor(() => {
      expect(screen.getByText("1 view")).toBeInTheDocument();
    });
  });

  // The placeholder reserves the width of the settled value but paints
  // nothing. It sits in the essay header's flex-wrap meta row, and a
  // placeholder narrower than the value it replaces re-wrapped that row on any
  // essay where it nearly fit — 26px of layout shift on four of six essays
  // sampled, against a 0.15 budget. So the footprint has to stay.
  //
  // What changed is that it is no longer *visible*. `useViewCount` returns 0
  // on failure and null only in flight, so the old literal "— views" was a
  // loading state that lasted as long as the request: with `/api/views`
  // blocked by a tracker blocker it never resolved, and the header showed an
  // em dash followed by VIEWS for the whole visit.
  it("reserves the placeholder but hides it while the count is loading", () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    const { container } = renderWithSWR(<ViewCounter slug="slow-post" />);

    const counter = container.querySelector("div");
    expect(counter).toHaveClass("invisible");
    expect(counter).toHaveAttribute("aria-hidden", "true");
    // Still reserving the footprint that the CLS fix depends on.
    expect(counter?.className).toContain("min-w-[6.5rem]");
  });

  it("reveals the counter once a real number arrives", async () => {
    mockFetch.mockImplementation(async () => jsonResponse({ views: 7 }));

    const { container } = renderWithSWR(<ViewCounter slug="fast-post" />);

    await waitFor(() => {
      expect(screen.getByText("7 views")).toBeInTheDocument();
    });
    const counter = container.querySelector("div");
    expect(counter).not.toHaveClass("invisible");
    expect(counter).not.toHaveAttribute("aria-hidden");
  });

  it("reserves the same footprint before and after the count arrives", () => {
    // jsdom has no layout, so the guard is the reserved width itself: without
    // it the placeholder was ~45px and the settled value ~101px, and that 56px
    // difference is what re-wrapped the meta row. `e2e/layout-shift.spec.ts`
    // measures the consequence across five essays; this catches the cause.
    const { container, rerender } = render(<ViewCounter slug="x" />);
    const box = () => container.querySelector("div");

    expect(box()?.className).toContain("min-w-[6.5rem]");
    expect(box()?.className).toContain("tabular-nums");

    rerender(<ViewCounter slug="x" />);
    expect(box()?.className).toContain("min-w-[6.5rem]");
  });

  it("degrades gracefully to the placeholder when fetching fails", async () => {
    mockFetch.mockRejectedValue(new Error("network down"));

    renderWithSWR(<ViewCounter slug="broken-post" />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/views?slug=broken-post", undefined);
    });
    expect(screen.getByText("— views")).toBeInTheDocument();
  });
});
