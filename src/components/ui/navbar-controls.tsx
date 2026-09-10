"use client";

import { CommandPalette } from "./command-palette";
import { ThemeToggle } from "./theme-toggle";

/**
 * Both controls, rendered. They used to sit behind three nested lazy layers —
 * an idle-callback gate, a `dynamic(..., { ssr: false })`, and the toggle's own
 * mount flag — each with its own placeholder, two of which reproduced the
 * control's exact appearance while being `aria-hidden` and unclickable for up
 * to 1200ms.
 *
 * Nothing here needed deferring. The palette's dialog is already conditional on
 * `isOpen`, so it is not in the initial tree; what the lazy stack was actually
 * guarding was a hook whose only DOM work is a keydown listener registered in
 * an effect. DESIGN.md's motion doctrine names the mechanism outright —
 * "nothing waits for a scroll observer, a mount transition or an idle callback
 * to become readable" — and it was written about content, so the chrome kept
 * doing it.
 */
export function NavbarControls() {
  return (
    <div className="flex items-center justify-end gap-2">
      <CommandPalette />
      <ThemeToggle />
    </div>
  );
}
