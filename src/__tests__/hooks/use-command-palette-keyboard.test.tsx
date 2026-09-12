import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useCommandPalette } from "@/hooks/use-command-palette";

/**
 * The palette's keyboard contract, which its own footer prints as
 * `↑↓ navigate · ↵ select · esc close`.
 *
 * This is the half of the palette a review found broken in a different way:
 * Cmd+K opened a dialog whose input never received focus, so the documented
 * accelerator was inert. Focus is fixed in the dialog (it mounts with
 * `autoFocus`), and these tests pin the rest of the contract — the parts that
 * live in this hook and had no coverage at all.
 */
const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

function press(key: string, init: KeyboardEventInit = {}) {
  act(() => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, ...init }));
  });
}

beforeEach(() => {
  push.mockReset();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: { results: [] } }) }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("command palette keyboard contract", () => {
  it("opens and closes on the meta accelerator it advertises", () => {
    const { result } = renderHook(() => useCommandPalette());
    expect(result.current.isOpen).toBe(false);

    press("k", { metaKey: true });
    expect(result.current.isOpen).toBe(true);

    press("k", { metaKey: true });
    expect(result.current.isOpen).toBe(false);
  });

  it("opens on the control accelerator too", () => {
    const { result } = renderHook(() => useCommandPalette());
    press("k", { ctrlKey: true });
    expect(result.current.isOpen).toBe(true);
  });

  it("ignores navigation keys while closed", () => {
    const { result } = renderHook(() => useCommandPalette());
    press("ArrowDown");
    press("Enter");
    expect(result.current.isOpen).toBe(false);
    expect(push).not.toHaveBeenCalled();
  });

  it("closes on Escape", () => {
    const { result } = renderHook(() => useCommandPalette());
    press("k", { metaKey: true });
    press("Escape");
    expect(result.current.isOpen).toBe(false);
  });

  it("moves the selection down and wraps at the end", () => {
    const { result } = renderHook(() => useCommandPalette());
    press("k", { metaKey: true });
    const count = result.current.commandCount;
    expect(count).toBeGreaterThan(1);

    press("ArrowDown");
    expect(result.current.activeSelectedIndex).toBe(1);

    for (let i = 1; i < count; i++) press("ArrowDown");
    expect(result.current.activeSelectedIndex).toBe(0);
  });

  it("moves the selection up and wraps at the start", () => {
    const { result } = renderHook(() => useCommandPalette());
    press("k", { metaKey: true });

    press("ArrowUp");
    expect(result.current.activeSelectedIndex).toBe(result.current.commandCount - 1);
  });

  it("runs the selected command on Enter and closes", () => {
    const { result } = renderHook(() => useCommandPalette());
    press("k", { metaKey: true });
    // The first destination is Home, per `paletteDestinations`.
    press("Enter");

    expect(push).toHaveBeenCalledWith("/");
    expect(result.current.isOpen).toBe(false);
  });

  it("clamps a stale selection rather than indexing past the list", () => {
    const { result } = renderHook(() => useCommandPalette());
    press("k", { metaKey: true });
    const last = result.current.commandCount - 1;

    act(() => {
      result.current.setSelectedIndex(last);
    });
    // Narrowing the list to fewer items than the selected index.
    act(() => {
      result.current.setQuery("hire");
    });
    expect(result.current.activeSelectedIndex).toBeLessThan(result.current.commandCount);
  });

  it("clears the query without closing", () => {
    const { result } = renderHook(() => useCommandPalette());
    press("k", { metaKey: true });
    act(() => {
      result.current.setQuery("projects");
    });
    expect(result.current.query).toBe("projects");

    act(() => {
      result.current.clearQuery();
    });
    expect(result.current.query).toBe("");
    expect(result.current.isOpen).toBe(true);
  });

  it("closing discards the query so the next open starts clean", () => {
    const { result } = renderHook(() => useCommandPalette());
    press("k", { metaKey: true });
    act(() => {
      result.current.setQuery("boredom");
    });
    press("Escape");
    press("k", { metaKey: true });
    expect(result.current.query).toBe("");
  });

  it("hands focus back to whatever opened it", async () => {
    // A first attempt captured the opener in an effect inside the dialog, which
    // runs after commit — by which point React had applied the input's
    // `autoFocus`, so the "opener" was the input and closing restored focus to
    // a node that had just unmounted. Focus landed on <body>. The capture has
    // to happen synchronously in `openPalette`.
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const { result } = renderHook(() => useCommandPalette());
    act(() => {
      result.current.openPalette();
    });
    act(() => {
      result.current.closePalette();
    });
    // The restore is deferred a frame so the dialog has unmounted first.
    await act(async () => {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    });

    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it("does not throw when the opener has left the document", async () => {
    // Executing a command closes the palette and navigates; the trigger may be
    // gone by the time the restore runs.
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();

    const { result } = renderHook(() => useCommandPalette());
    act(() => {
      result.current.openPalette();
    });
    trigger.remove();
    act(() => {
      result.current.closePalette();
    });
    await act(async () => {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("groups destinations under navigation and the theme toggle under action", () => {
    const { result } = renderHook(() => useCommandPalette());
    press("k", { metaKey: true });

    expect(result.current.groupedCommands.navigation.length).toBeGreaterThan(20);
    expect(result.current.groupedCommands.action).toHaveLength(1);
    expect(result.current.groupedCommands.action[0].title).toBe("Switch to dark");
  });

  it("matches a destination by keyword without printing the keyword", () => {
    const { result } = renderHook(() => useCommandPalette());
    press("k", { metaKey: true });
    act(() => {
      result.current.setQuery("portfolio");
    });

    const titles = result.current.groupedCommands.navigation.map((c) => c.title);
    expect(titles).toContain("Projects");
    // "portfolio" is a search keyword, never a label — the whole point of
    // keeping keywords out of `navlinks`.
    expect(titles).not.toContain("portfolio");
  });
});
