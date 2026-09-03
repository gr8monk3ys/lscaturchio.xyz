"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";

import {
  contactLink,
  primaryNavigation,
  secondaryNavigationCategories,
} from "@/constants/navlinks";
import { isPathActive } from "@/lib/navigation-path";

import { ThemeToggle } from "./theme-toggle";

const CommandPalette = dynamic(
  () => import("./command-palette").then((module) => module.CommandPalette),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden
        className="h-9 w-9 rounded-lg border border-border/50 bg-muted/40"
      />
    ),
  }
);

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function categoryPanelId(name: string): string {
  return `mobile-nav-panel-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function MobileNavbarContent({ pathname }: { pathname: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLElement | null>(null);

  const toggleCategory = (name: string) => {
    setExpandedCategory((current) => (current === name ? null : name));
  };

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Escape + focus containment while the overlay is open. Mirrors the
  // document-level keydown listener in use-command-palette.
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== "Tab") return;

      const toggle = toggleRef.current;
      const menu = menuRef.current;
      if (!toggle || !menu) return;

      // The toggle sits outside the overlay but must stay reachable, so the
      // cycle runs toggle -> menu contents -> toggle and never reaches the
      // page behind.
      const focusable = [
        toggle,
        ...Array.from(menu.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)),
      ].filter((element) => element.offsetParent !== null || element === toggle);

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !active || !focusable.includes(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last || !active || !focusable.includes(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeMenu, isMenuOpen]);

  return (
    <>
      {/* z-60: above the menu overlay (z-55) so this button can close it,
          below the photo lightbox (z-70). Site chrome otherwise lives at z-40/50. */}
      <div className="fixed right-0 top-0 z-60 p-4 md:hidden">
        <button
          type="button"
          ref={toggleRef}
          onClick={() =>
            isMenuOpen ? closeMenu() : setIsMenuOpen(true)
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl neu-button transition-transform hover:scale-[1.02] active:scale-[0.98] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation-menu"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMenuOpen && (
        <nav
          id="mobile-navigation-menu"
          ref={menuRef}
          aria-label="Mobile"
          className="fixed inset-0 z-55 flex flex-col overflow-y-auto overscroll-y-contain bg-background/98 backdrop-blur-md md:hidden"
        >
          <div className="mx-auto flex w-full max-w-md flex-col space-y-2 p-6 pt-20">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {primaryNavigation.map((item) => {
                const ItemIcon = item.icon;
                const isActive = isPathActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                      isActive
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border/70 bg-background/80 text-foreground hover:border-primary/30 hover:text-primary"
                    }`}
                  >
                    {ItemIcon && <ItemIcon className="h-4 w-4" />}
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{item.name}</div>
                      {item.description && (
                        <div className="truncate text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="pt-4">
              <p className="px-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Browse More
              </p>
            </div>

            {secondaryNavigationCategories.map((category) => {
              const Icon = category.icon;
              const isExpanded = expandedCategory === category.name;
              const panelId = categoryPanelId(category.name);
                const hasActiveItem = category.items.some((item) =>
                  isPathActive(pathname, item.href)
                );

              return (
                <div key={category.name} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.name)}
                    aria-expanded={isExpanded}
                    aria-controls={panelId}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-lg font-medium transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                      hasActiveItem
                        ? "text-primary"
                        : "text-foreground/80 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {Icon && <Icon className="h-5 w-5" />}
                      {category.name}
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div id={panelId} className="overflow-hidden">
                      <div className="space-y-1 pl-4">
                        {category.items.map((item) => {
                          const ItemIcon = item.icon;
                          const isActive = isPathActive(pathname, item.href);

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              prefetch={false}
                              onClick={() => setIsMenuOpen(false)}
                              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 transition-colors ${
                                isActive
                                  ? "neu-pressed-sm bg-primary/10 text-primary"
                                  : "text-foreground/70 hover:bg-muted/50 hover:text-foreground"
                              }`}
                            >
                              {ItemIcon && (
                                <ItemIcon
                                  className={`h-4 w-4 ${
                                    isActive
                                      ? "text-primary"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              )}
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {item.name}
                                </span>
                                {item.description && (
                                  <span className="text-xs text-muted-foreground">
                                    {item.description}
                                  </span>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <Link
              href={contactLink.href}
              prefetch={false}
              onClick={() => setIsMenuOpen(false)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-lg font-medium transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                isPathActive(pathname, contactLink.href)
                  ? "neu-pressed bg-primary/10 text-primary"
                  : "hover:bg-muted/50"
              }`}
            >
              {contactLink.icon && <contactLink.icon className="h-5 w-5" />}
              {contactLink.name}
            </Link>

            <div className="flex items-center justify-center gap-4 pt-6">
              <CommandPalette />
              <ThemeToggle />
            </div>
          </div>
        </nav>
      )}
    </>
  );
}

export function MobileNavbar() {
  const pathname = usePathname();

  return <MobileNavbarContent key={pathname} pathname={pathname} />;
}
