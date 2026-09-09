"use client";

import { MessageCircle } from "lucide-react";
import { useAskDrawer } from "@/components/chat/ask-drawer-provider";

/**
 * The drawer's entry point, in the header's top corner.
 *
 * Before this the site had no persistent way in: the ask field lived on the
 * masthead and nowhere else, so from any other page the only route to it was
 * the /chat link buried in the footer site map. The label collapses to its mark
 * once the drawer is open, since the panel then names itself.
 */
export function AskDrawerTrigger({
  onActivate,
}: {
  /** Lets the mobile menu close itself as the drawer opens. */
  onActivate?: () => void;
} = {}) {
  const drawer = useAskDrawer();
  if (!drawer) return null;

  return (
    <button
      type="button"
      onClick={() => {
        onActivate?.();
        drawer.toggle();
      }}
      /* An explicit name, because the visible label is `hidden lg:inline` and
         `display: none` removes text from the accessible name computation. Below
         1024px the icon is aria-hidden and the label is gone, so this button
         announced as an unnamed "button" — on the only persistent route to the
         feature. */
      aria-label={drawer.isOpen ? "Close the ask panel" : "Ask this site"}
      aria-expanded={drawer.isOpen}
      aria-controls="ask-drawer"
      className="label-mono inline-flex min-h-11 items-center gap-2 px-2 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:min-h-0"
    >
      <MessageCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span aria-hidden className={drawer.isOpen ? "sr-only" : "hidden lg:inline"}>
        Ask
      </span>
    </button>
  );
}
