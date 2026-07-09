import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { SWRConfig } from "swr";
import { SeriesNavigation } from "@/components/blog/series-navigation";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const posts = [
  { slug: "part-one", title: "Getting Started", seriesOrder: 1 },
  { slug: "part-two", title: "Going Deeper", seriesOrder: 2 },
  { slug: "part-three", title: "Wrapping Up", seriesOrder: 3 },
];

function renderWithSWR(ui: ReactNode) {
  return render(
    <SWRConfig
      value={{ provider: () => new Map(), dedupingInterval: 0, errorRetryCount: 0 }}
    >
      {ui}
    </SWRConfig>
  );
}

function mockSeriesResponse(seriesPosts: typeof posts) {
  mockFetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ posts: seriesPosts }),
  });
}

function prevLink() {
  return screen.getByText("Previous").closest("a");
}

function nextLink() {
  return screen.getByText("Next").closest("a");
}

describe("SeriesNavigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a loading skeleton while the series is being fetched", () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    const { container } = renderWithSWR(
      <SeriesNavigation seriesName="Deep Learning" currentSlug="part-two" currentOrder={2} />
    );

    expect(container.querySelector(".animate-pulse")).not.toBeNull();
  });

  it("requests the series endpoint with the encoded series name", async () => {
    mockSeriesResponse(posts);

    renderWithSWR(
      <SeriesNavigation seriesName="AI & ML" currentSlug="part-one" currentOrder={1} />
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/series?name=${encodeURIComponent("AI & ML")}`,
        undefined
      );
    });
  });

  it("renders the series title, position, and the full ordered post list", async () => {
    mockSeriesResponse(posts);

    renderWithSWR(
      <SeriesNavigation seriesName="Deep Learning" currentSlug="part-two" currentOrder={2} />
    );

    expect(await screen.findByText("Deep Learning Series")).toBeInTheDocument();
    expect(screen.getByText("Part 2 of 3")).toBeInTheDocument();

    // Order markers come from seriesOrder, rendered as an ordered list.
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("1.");
    expect(items[0]).toHaveTextContent("Getting Started");
    expect(items[1]).toHaveTextContent("2.");
    expect(items[2]).toHaveTextContent("3.");
    expect(items[2]).toHaveTextContent("Wrapping Up");
  });

  it("marks the current post as current text instead of a link", async () => {
    mockSeriesResponse(posts);

    renderWithSWR(
      <SeriesNavigation seriesName="Deep Learning" currentSlug="part-two" currentOrder={2} />
    );

    const current = await screen.findByText("Going Deeper (current)");
    expect(current.closest("a")).toBeNull();

    expect(screen.getByRole("link", { name: "Getting Started" })).toHaveAttribute(
      "href",
      "/blog/part-one"
    );
  });

  it("links to both neighbors from a middle post", async () => {
    mockSeriesResponse(posts);

    renderWithSWR(
      <SeriesNavigation seriesName="Deep Learning" currentSlug="part-two" currentOrder={2} />
    );

    await screen.findByText("Deep Learning Series");
    expect(prevLink()).toHaveAttribute("href", "/blog/part-one");
    expect(nextLink()).toHaveAttribute("href", "/blog/part-three");
  });

  it("omits the previous link on the first post in the series", async () => {
    mockSeriesResponse(posts);

    renderWithSWR(
      <SeriesNavigation seriesName="Deep Learning" currentSlug="part-one" currentOrder={1} />
    );

    await screen.findByText("Deep Learning Series");
    expect(screen.queryByText("Previous")).not.toBeInTheDocument();
    expect(nextLink()).toHaveAttribute("href", "/blog/part-two");
  });

  it("omits the next link on the last post in the series", async () => {
    mockSeriesResponse(posts);

    renderWithSWR(
      <SeriesNavigation seriesName="Deep Learning" currentSlug="part-three" currentOrder={3} />
    );

    await screen.findByText("Deep Learning Series");
    expect(screen.queryByText("Next")).not.toBeInTheDocument();
    expect(prevLink()).toHaveAttribute("href", "/blog/part-two");
  });

  it("renders nothing when the series has no posts", async () => {
    mockSeriesResponse([]);

    const { container } = renderWithSWR(
      <SeriesNavigation seriesName="Empty" currentSlug="part-one" currentOrder={1} />
    );

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });

  it("renders nothing when the API omits the posts array", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    const { container } = renderWithSWR(
      <SeriesNavigation seriesName="Broken" currentSlug="part-one" currentOrder={1} />
    );

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });
});
