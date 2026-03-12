"use client";

import { useState } from "react";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";

import {
  contactLink,
  primaryNavigation,
  secondaryNavigationCategories,
} from "@/constants/navlinks";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
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

function MobileNavbarContent({ pathname }: { pathname: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (name: string) => {
    setExpandedCategory((current) => (current === name ? null : name));
  };

  return (
    <>
      <div className="fixed right-0 top-0 z-[450] p-4 md:hidden">
        <button
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
          className="flex h-10 w-10 items-center justify-center rounded-xl neu-button transition-transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation-menu"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMenuOpen && (
        <div
          id="mobile-navigation-menu"
          className="fixed inset-0 z-[400] flex flex-col overflow-y-auto overscroll-y-contain bg-background/98 backdrop-blur-md md:hidden"
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
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
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
                const hasActiveItem = category.items.some((item) =>
                  isPathActive(pathname, item.href)
                );

              return (
                <div key={category.name} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.name)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
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
                    <div className="overflow-hidden">
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
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                isPathActive(pathname, contactLink.href)
                  ? "neu-pressed bg-primary/10 text-primary"
                  : "hover:bg-muted/50"
              }`}
            >
              {contactLink.icon && <contactLink.icon className="h-5 w-5" />}
              {contactLink.name}
            </Link>

            <div className="flex items-center justify-center gap-4 pt-6">
              <LanguageSwitcher compact />
              <CommandPalette />
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function MobileNavbar() {
  const pathname = usePathname();

  return <MobileNavbarContent key={pathname} pathname={pathname} />;
}
