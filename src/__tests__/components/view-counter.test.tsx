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
  return { ok: true, status: 200, json: async () => body };
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

  it("renders a placeholder while the count is still loading", () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    renderWithSWR(<ViewCounter slug="slow-post" />);

    expect(screen.getByText("---")).toBeInTheDocument();
  });

  it("degrades gracefully to the placeholder when fetching fails", async () => {
    mockFetch.mockRejectedValue(new Error("network down"));

    renderWithSWR(<ViewCounter slug="broken-post" />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/views?slug=broken-post", undefined);
    });
    expect(screen.getByText("---")).toBeInTheDocument();
  });
});
