import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useCommandPalette } from "@/hooks/use-command-palette";

/**
 * The palette's content search was silently returning nothing, for every
 * query, for every user.
 *
 * `/api/search` answers through `apiSuccess`, which wraps its payload as
 * `{ data: { query, results, count }, success: true }`. The hook read
 * `data.results` — the top level — so the value was always `undefined`, `?? []`
 * turned it into an empty array, and the UI rendered "No results found for X".
 * Verified against the live route before the fix: POST with `{"query":
 * "boredom"}` returned two real essays and the palette showed none.
 *
 * It hid for two reasons worth remembering. Page-name matches kept working,
 * because those come from the local `paletteDestinations` array and never touch
 * the network — so anyone typing "projects" saw a working palette. And `/lab`'s
 * search demo reads the same endpoint correctly, so the corpus was visibly
 * searchable somewhere else on the site.
 *
 * These tests pin the envelope shape, because that is the thing that broke.
 */
const ENVELOPE = {
  success: true,
  data: {
    query: "boredom",
    count: 1,
    results: [
      {
        title: "Boredom Is a Skill",
        url: "/blog/boredom-is-a-skill",
        description: "We engineered boredom out of existence.",
        date: "2026-02-11",
        similarity: 0.82,
        snippets: ["Stimulation paradox"],
        tags: ["attention"],
      },
    ],
  },
};

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockReset();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => body } as unknown as Response;
}

/** The hook debounces by 300ms before it will search at all. */
async function typeAndSettle(setQuery: (v: string) => void, query: string) {
  await act(async () => {
    setQuery(query);
  });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(400);
  });
}

describe("command palette content search", () => {
  it("reads results out of the apiSuccess envelope", async () => {
    mockFetch.mockResolvedValue(jsonResponse(ENVELOPE));

    const { result } = renderHook(() => useCommandPalette());
    await typeAndSettle(result.current.setQuery, "boredom");

    await waitFor(() => {
      expect(result.current.groupedCommands.blog).toHaveLength(1);
    });
    expect(result.current.groupedCommands.blog[0].title).toBe("Boredom Is a Skill");
    expect(result.current.searchFailed).toBe(false);
  });

  it("does NOT read results from the top level", async () => {
    // The exact shape the hook used to expect. If someone reverts to
    // `data.results`, this payload would start passing the test above and this
    // one would start failing — which is the pairing that makes the bug visible.
    mockFetch.mockResolvedValue(jsonResponse({ results: ENVELOPE.data.results }));

    const { result } = renderHook(() => useCommandPalette());
    await typeAndSettle(result.current.setQuery, "boredom");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(result.current.groupedCommands.blog).toHaveLength(0);
  });

  it("reports a failed request as a failure, not as an empty corpus", async () => {
    // A 429 from the AI_HEAVY limiter is earned by the fourth query in ten
    // seconds, and it used to render the same "No results found" as a miss.
    mockFetch.mockResolvedValue(jsonResponse({ error: "Too many requests" }, false, 429));

    const { result } = renderHook(() => useCommandPalette());
    await typeAndSettle(result.current.setQuery, "boredom");

    await waitFor(() => {
      expect(result.current.searchFailed).toBe(true);
    });
    expect(result.current.groupedCommands.blog).toHaveLength(0);
  });

  it("reports a thrown request as a failure too", async () => {
    mockFetch.mockRejectedValue(new Error("offline"));

    const { result } = renderHook(() => useCommandPalette());
    await typeAndSettle(result.current.setQuery, "boredom");

    await waitFor(() => {
      expect(result.current.searchFailed).toBe(true);
    });
  });

  it("clears the failure flag when the query changes", async () => {
    mockFetch.mockResolvedValue(jsonResponse({}, false, 500));
    const { result } = renderHook(() => useCommandPalette());
    await typeAndSettle(result.current.setQuery, "boredom");
    await waitFor(() => expect(result.current.searchFailed).toBe(true));

    mockFetch.mockResolvedValue(jsonResponse(ENVELOPE));
    await act(async () => {
      result.current.setQuery("attention");
    });
    expect(result.current.searchFailed).toBe(false);
  });

  it("still resolves page names without touching the network", async () => {
    // This is why the outage was invisible: destination matches come from
    // `paletteDestinations`, so the palette looked healthy to anyone who
    // typed a route name.
    const { result } = renderHook(() => useCommandPalette());
    await act(async () => {
      result.current.setQuery("hire");
    });

    const titles = result.current.groupedCommands.navigation.map((c) => c.title);
    expect(titles).toContain("Hire me");
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
