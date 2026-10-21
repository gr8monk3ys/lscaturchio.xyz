import { useEffect, useEffectEvent, type RefObject } from "react";

/**
 * The one place modal-overlay keyboard behaviour lives.
 *
 * The mobile menu, the ask drawer and the command palette each carried their
 * own copy of this: three Tab traps with three focusable selectors, three
 * focus-return paths, three Escape listeners. They disagreed. The menu filtered
 * hidden items and the drawer did not; the palette filtered on `tabIndex` and
 * the menu on a selector; the drawer let Tab walk out when focus started
 * outside the panel. `mobile-navbar.tsx` said in a comment that it "mirrors"
 * the palette's listener, and a critique loop then rewrote that file six times
 * finding the next place the mirror had drifted. This module is the structural
 * answer; `design-drift.test.ts` ("modal overlays") keeps it the only one.
 *
 * What it owns, while `open` is true:
 * - initial focus, a frame after commit (the drawer is `visibility: hidden`
 *   until its open styles land, and a synchronous focus would no-op);
 * - Tab containment, with one tabbability rule (below);
 * - Escape, which asks the surface to close;
 * - focus return to whatever had focus when it opened, or a fallback.
 *
 * What it does not own: open/closed state (each surface keeps its own), ARIA
 * (the surface's markup), and scroll lock — only the ask drawer locks scroll,
 * and it does so in CSS gated to its overlay breakpoint, which no hook can
 * express better than the media query already does.
 */
export interface ModalOverlayOptions {
  /** Whether the overlay is showing. Nothing here runs while it is false. */
  open: boolean;
  /** Called on Escape. The surface owns its state; this only asks. */
  onClose: () => void;
  /** The panel. Tab stays inside it. */
  containerRef: RefObject<HTMLElement | null>;
  /**
   * What takes focus on open. Defaults to the container, which then needs
   * `tabIndex={-1}` so it can be focused without joining the Tab cycle.
   */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /**
   * Controls outside the panel that stay in the Tab cycle. The mobile menu's
   * toggle is the case: it sits in the bar above the overlay and is the visible
   * way to close it, so a trap that excluded it would hide the exit.
   */
  alsoReachable?: ReadonlyArray<RefObject<HTMLElement | null>>;
  /**
   * Where focus goes on close when the opener is gone or was `<body>` — Cmd+K
   * pressed from nowhere, or Safari, which does not focus a clicked button.
   */
  returnFocusFallback?: () => HTMLElement | null;
  /**
   * Keep Tab inside the container. Default true. The ask drawer turns it off
   * at 1536px and up, where it pushes the page rather than covering it and a
   * trap would strand the reader beside content they can see and use. Escape,
   * initial focus and focus return still apply.
   */
  trapFocus?: boolean;
}

/**
 * Candidates for the Tab cycle. Deliberately broad: whether a candidate is
 * actually tabbable is decided by `isTabbable`, not by this selector. The
 * palette's first trap shows why — `button:not([disabled])` matched result rows
 * that are `<button tabIndex={-1}>`, so the trap's "last" element was a row
 * and Tab fell out of the dialog. A selector that tries to encode tabbability
 * gets it wrong in one clause and right in another.
 */
const CANDIDATES =
  'a[href], area[href], button, input, select, textarea, iframe, summary, [contenteditable=""], [contenteditable="true"], [tabindex]';

/**
 * Overlays currently open, newest last. Only the newest handles keys: the
 * palette opened from inside the mobile menu takes Escape and Tab, and the
 * menu beneath it waits. Without this both listened, and one Escape closed
 * both.
 */
const openOverlays: symbol[] = [];

function isRendered(element: HTMLElement): boolean {
  // `[hidden]` and `inert` are checked by attribute as well as by style:
  // the menu's category panels and the menu itself collapse with `hidden`.
  if (element.closest("[hidden], [inert]")) return false;
  const style = getComputedStyle(element);
  if (style.visibility === "hidden" || style.visibility === "collapse") return false;
  for (let node: Element | null = element; node; node = node.parentElement) {
    if (getComputedStyle(node).display === "none") return false;
  }
  return true;
}

/**
 * The single tabbability rule: an explicit `tabindex` wins (negative means
 * out), otherwise the element must be natively focusable; then it must be
 * enabled and rendered. Of the three copies this replaces, the palette's
 * resolved-`tabIndex` filter and the menu's visibility filter were each right
 * about the half the others missed; this is both halves.
 */
function isTabbable(element: HTMLElement): boolean {
  const explicit = element.getAttribute("tabindex");
  if (explicit !== null && Number.parseInt(explicit, 10) < 0) return false;
  if (element.matches(":disabled")) return false;
  if (element instanceof HTMLInputElement && element.type === "hidden") return false;
  return isRendered(element);
}

function inDocumentOrder(a: HTMLElement, b: HTMLElement): number {
  return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

function tabCycle(
  container: HTMLElement,
  outside: ReadonlyArray<RefObject<HTMLElement | null>>
): HTMLElement[] {
  const inside = Array.from(container.querySelectorAll<HTMLElement>(CANDIDATES));
  const extra = outside
    .map((ref) => ref.current)
    .filter((el): el is HTMLElement => el !== null && !container.contains(el));
  return [...extra, ...inside].filter(isTabbable).sort(inDocumentOrder);
}

export function useModalOverlay({
  open,
  onClose,
  containerRef,
  initialFocusRef,
  alsoReachable = [],
  returnFocusFallback,
  trapFocus = true,
}: ModalOverlayOptions): void {
  const handleTab = useEffectEvent((event: KeyboardEvent) => {
    if (!trapFocus) return;
    const container = containerRef.current;
    if (!container) return;

    // Nothing rendered to cycle through means nothing is showing — the mobile
    // menu is `md:hidden`, so widening the window with it open hides the lot.
    // Holding Tab there would strand the reader on an overlay they cannot see.
    const cycle = tabCycle(container, alsoReachable);
    if (cycle.length === 0) return;

    const first = cycle[0];
    const last = cycle[cycle.length - 1];
    const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const index = active ? cycle.indexOf(active) : -1;

    if (index === -1) {
      // Focus is somewhere the cycle does not list: the container itself
      // (where the menu puts initial focus), something the browser treats as
      // focusable that this rule does not, or outside entirely. Step to the
      // nearest listed stop in the direction of travel, or wrap.
      event.preventDefault();
      let target: HTMLElement;
      if (active && container.contains(active)) {
        target = event.shiftKey
          ? ([...cycle].reverse().find((el) => inDocumentOrder(el, active) < 0) ?? last)
          : (cycle.find((el) => inDocumentOrder(active, el) < 0) ?? first);
      } else {
        target = event.shiftKey ? last : first;
      }
      target.focus();
      return;
    }

    // Only the ends are intercepted. Between them the browser moves focus in
    // document order, which keeps whatever it considers a tab stop (Chrome's
    // focusable scrollers, for one) reachable.
    if (!event.shiftKey && index === cycle.length - 1) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && index === 0) {
      event.preventDefault();
      last.focus();
    }
  });

  const close = useEffectEvent(() => onClose());
  const fallback = useEffectEvent(() => returnFocusFallback?.() ?? null);
  const initialTarget = useEffectEvent(
    () => initialFocusRef?.current ?? containerRef.current
  );

  useEffect(() => {
    if (!open) return;

    const id = Symbol("modal-overlay");
    openOverlays.push(id);
    const isTop = () => openOverlays[openOverlays.length - 1] === id;

    // Captured here, before the initial focus below moves it. Nothing the
    // surface renders may autofocus: that would run during commit, ahead of
    // this, and the "opener" would be the overlay's own input.
    const active = document.activeElement;
    const opener = active instanceof HTMLElement && active !== document.body ? active : null;

    const frame = window.requestAnimationFrame(() => initialTarget()?.focus());

    const onTab = (event: KeyboardEvent) => {
      if (event.key === "Tab" && isTop()) handleTab(event);
    };
    // Bubble phase, so a control inside the overlay that uses Escape for
    // itself can claim it first by preventing the default.
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.isComposing || event.defaultPrevented) return;
      if (!isTop()) return;
      event.preventDefault();
      close();
    };

    document.addEventListener("keydown", onTab, true);
    document.addEventListener("keydown", onEscape);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onTab, true);
      document.removeEventListener("keydown", onEscape);
      const at = openOverlays.indexOf(id);
      if (at !== -1) openOverlays.splice(at, 1);

      // Synchronous, and that matters. React runs every effect cleanup in a
      // commit before any setup, so when the mobile menu closes *because* the
      // ask drawer is opening, the menu hands focus to its toggle here and the
      // drawer's setup then records the toggle as its opener — not the
      // drawer trigger inside a menu that has just been hidden. The rendered
      // check covers the same case from the other side, if that order ever
      // changes: a hidden opener cannot take focus, so it falls through.
      const target = opener?.isConnected && isRendered(opener) ? opener : fallback();
      target?.focus();
    };
  }, [open]);
}
