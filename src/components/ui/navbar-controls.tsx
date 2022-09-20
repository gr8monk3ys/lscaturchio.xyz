"use client";

import dynamic from "next/dynamic";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";

import { ThemeToggle } from "./theme-toggle";

const CommandPalette = dynamic(
  () => import("./command-palette").then((module) => module.CommandPalette),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden
        className="h-9 w-[88px] rounded-lg border border-border/50 bg-muted/40"
      />
    ),
  }
);

export function NavbarControls() {
  return (
    <div className="flex w-[290px] items-center justify-end gap-2">
      <LanguageSwitcher />
      <CommandPalette />
      <ThemeToggle />
    </div>
  );
}
