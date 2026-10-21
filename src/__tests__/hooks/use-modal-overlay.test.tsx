import { describe, it, expect, afterEach } from "vitest";
import { useRef, useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

import { useModalOverlay } from "@/hooks/use-modal-overlay";

/**
 * The overlay contract, tested once at the interface.
 *
 * The mobile menu, the ask drawer and the command palette each had their own
 * trap and their own focus-return path, and each had its own tests for them.
 * They are thin callers of `useModalOverlay` now, so the behaviour is pinned
 * here and `design-drift.test.ts` ("modal overlays") pins that every
 * `aria-modal` surface goes through it.
 *
 * happy-dom does not move focus on Tab. A Tab the hook does not prevent is one
 * it leaves to the browser, so `fireEvent` returning `true` means "the browser
 * moves focus here", and the hook's own moves are asserted on
 * `document.activeElement`.
 */

interface HarnessProps {
  trapFocus?: boolean;
  withFallback?: boolean;
  label?: string;
}

function Overlay({ trapFocus, withFallback, label = "Overlay" }: HarnessProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const fallbackRef = useRef<HTMLButtonElement>(null);

  useModalOverlay({
    open,
    onClose: () => setOpen(false),
    containerRef,
    alsoReachable: [toggleRef],
    returnFocusFallback: withFallback ? () => fallbackRef.current : undefined,
    trapFocus,
  });

  return (
    <>
      <button type="button">{label}: page before</button>
      <button type="button" onClick={() => setOpen(true)}>
        {label}: open
      </button>
      <button type="button" ref={fallbackRef}>
        {label}: fallback
      </button>
      <button type="button" ref={toggleRef}>
        {label}: toggle
      </button>
      <div ref={containerRef} tabIndex={-1} hidden={!open} data-testid={`${label}-panel`}>
        <button type="button">{label}: first</button>
        <button type="button" tabIndex={-1}>
          {label}: row
        </button>
        <div hidden>
          <button type="button">{label}: collapsed</button>
        </div>
        <button type="button">{label}: middle</button>
        <button type="button">{label}: last</button>
        <button type="button" disabled>
          {label}: disabled
        </button>
        <button type="button" style={{ visibility: "hidden" }}>
          {label}: invisible
        </button>
        <div style={{ display: "none" }}>
          <a href="/nowhere">{label}: undisplayed</a>
        </div>
      </div>
      <button type="button">{label}: page after</button>
    </>
  );
}

const button = (name: string) => screen.getByRole("button", { name });

async function nextFrame() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  });
}

async function openFrom(opener: HTMLElement) {
  opener.focus();
  fireEvent.click(opener);
  await nextFrame();
}

/** Returns true when the hook left the key to the browser. */
function tab(shiftKey = false) {
  return fireEvent.keyDown(document.activeElement ?? document.body, { key: "Tab", shiftKey });
}

afterEach(() => {
  cleanup();
});

describe("useModalOverlay", () => {
  it("moves focus into the container a frame after opening", async () => {
    render(<Overlay />);
    await openFrom(button("Overlay: open"));
    expect(document.activeElement).toBe(screen.getByTestId("Overlay-panel"));
  });

  it("wraps Tab from the last stop to the first, skipping what cannot take focus", async () => {
    render(<Overlay />);
    await openFrom(button("Overlay: open"));

    // `last` is followed by disabled, visibility:hidden and display:none
    // controls. A selector-only trap would call one of those the end and let
    // Tab leave from here.
    button("Overlay: last").focus();
    expect(tab()).toBe(false);
    // The first stop is the allow-listed control outside the panel.
    expect(document.activeElement).toBe(button("Overlay: toggle"));
  });

  it("wraps Shift+Tab from the first stop to the last", async () => {
    render(<Overlay />);
    await openFrom(button("Overlay: open"));

    button("Overlay: toggle").focus();
    expect(tab(true)).toBe(false);
    expect(document.activeElement).toBe(button("Overlay: last"));
  });

  it("keeps the outside allow-list reachable and lets the browser move between stops", async () => {
    render(<Overlay />);
    await openFrom(button("Overlay: open"));

    // From the toggle, Tab is not intercepted: the next stop in document
    // order is inside the panel.
    button("Overlay: toggle").focus();
    expect(tab()).toBe(true);

    button("Overlay: first").focus();
    expect(tab()).toBe(true);
    // Shift+Tab from the first in-panel stop reaches the toggle natively.
    expect(tab(true)).toBe(true);
  });

  it("steps from the container itself to the nearest stop in each direction", async () => {
    render(<Overlay />);
    await openFrom(button("Overlay: open"));
    const panel = screen.getByTestId("Overlay-panel");

    expect(document.activeElement).toBe(panel);
    expect(tab()).toBe(false);
    expect(document.activeElement).toBe(button("Overlay: first"));

    panel.focus();
    expect(tab(true)).toBe(false);
    expect(document.activeElement).toBe(button("Overlay: toggle"));
  });

  it("pulls focus that is outside the cycle back into it", async () => {
    render(<Overlay />);
    await openFrom(button("Overlay: open"));

    button("Overlay: page after").focus();
    expect(tab()).toBe(false);
    expect(document.activeElement).toBe(button("Overlay: toggle"));

    button("Overlay: page before").focus();
    expect(tab(true)).toBe(false);
    expect(document.activeElement).toBe(button("Overlay: last"));
  });

  it("closes on Escape and returns focus to the opener", async () => {
    render(<Overlay />);
    const opener = button("Overlay: open");
    await openFrom(opener);

    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });

    expect(screen.getByTestId("Overlay-panel")).not.toBeVisible();
    expect(document.activeElement).toBe(opener);
  });

  it("returns focus to the fallback when there was no opener", async () => {
    render(<Overlay withFallback />);
    // Opened with focus on <body>: Cmd+K from nowhere, or Safari, which does
    // not focus a clicked button.
    (document.activeElement as HTMLElement | null)?.blur();
    fireEvent.click(button("Overlay: open"));
    await nextFrame();

    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
    expect(document.activeElement).toBe(button("Overlay: fallback"));
  });

  it("does nothing with keys while closed", () => {
    render(<Overlay />);
    button("Overlay: page after").focus();

    expect(tab()).toBe(true);
    expect(fireEvent.keyDown(document.body, { key: "Escape" })).toBe(true);
    expect(document.activeElement).toBe(button("Overlay: page after"));
  });

  it("leaves Tab alone when the trap is off, and still closes on Escape", async () => {
    render(<Overlay trapFocus={false} />);
    const opener = button("Overlay: open");
    await openFrom(opener);

    button("Overlay: last").focus();
    expect(tab()).toBe(true);

    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
    expect(screen.getByTestId("Overlay-panel")).not.toBeVisible();
    expect(document.activeElement).toBe(opener);
  });

  it("gives keys to the newest overlay only", async () => {
    render(
      <>
        <Overlay label="Under" />
        <Overlay label="Over" />
      </>
    );
    await openFrom(button("Under: open"));
    // Opened from inside the first, the way the palette opens from inside
    // the mobile menu.
    await openFrom(button("Under: first"));
    await openFrom(button("Over: open"));

    // Tab from the top overlay's last stop wraps within the top overlay.
    button("Over: last").focus();
    tab();
    expect(document.activeElement).toBe(button("Over: toggle"));

    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
    expect(screen.getByTestId("Over-panel")).not.toBeVisible();
    expect(screen.getByTestId("Under-panel")).toBeVisible();

    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
    expect(screen.getByTestId("Under-panel")).not.toBeVisible();
  });
});
