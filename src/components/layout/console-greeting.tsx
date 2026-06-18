"use client";

import { useEffect } from "react";

// Module-level guard so React 18 strict-mode's double-invoke (and any
// remount) doesn't print the greeting twice.
let greeted = false;

/**
 * A note for anyone who opens the devtools console — the classic personal-site
 * wink, styled in the site's own forest-green-on-paper palette. Renders nothing.
 *
 * Note: next.config sets `removeConsole` in production, which strips literal
 * `console.log(...)` calls. This greeting is an intentional feature, not a
 * debug log, so we reach the method through an indirect reference the compiler
 * transform won't match.
 */
export function ConsoleGreeting() {
  useEffect(() => {
    if (greeted || typeof window === "undefined") return;
    greeted = true;

    const log = window.console?.log?.bind(window.console);
    if (!log) return;

    const head = "font: 600 15px ui-monospace, 'IBM Plex Mono', monospace; color: #135c34;";
    const body = "font: 13px ui-monospace, 'IBM Plex Mono', monospace; color: #6b6557; line-height: 1.7;";

    log("%cYou opened the console. I like you already.", head);
    log(
      "%cI build AI systems and write about the world they land in.\n" +
        "The whole site is a garden — poke around. Or ask it anything: /chat\n" +
        "Want to build something? lorenzosca7@protonmail.ch",
      body,
    );
  }, []);

  return null;
}
