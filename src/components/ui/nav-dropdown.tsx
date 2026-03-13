"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { secondaryNavigationCategories } from "@/constants/navlinks";
import { isPathActive } from "@/lib/navigation-path";
import { cn } from "@/lib/utils";

interface NavDropdownProps {
  categoryName: string;
}

const EMPTY_CATEGORY = {
  name: "",
  items: [],
} as const;

export function NavDropdown({ categoryName }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);
  const category =
    secondaryNavigationCategories.find((item) => item.name === categoryName) ??
    EMPTY_CATEGORY;

  const hasActiveItem = category.items.some((item) =>
    isPathActive(pathname, item.href)
  );

  useEffect(() => {
    if (pathname !== prevPathnameRef.current) {
      prevPathnameRef.current = pathname;
      setIsOpen(false);
    }
  }, [pathname]);

  const openDropdown = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  }, []);

  const closeDropdown = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  }, []);

  const cancelClose = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen) {
        if (
          event.key === "Enter" ||
          event.key === " " ||
          event.key === "ArrowDown"
        ) {
          event.preventDefault();
          openDropdown();
          setFocusedIndex(0);
        }
        return;
      }

      switch (event.key) {
        case "Escape":
          event.preventDefault();
          setIsOpen(false);
          buttonRef.current?.focus();
          break;
        case "ArrowDown":
          event.preventDefault();
          setFocusedIndex((prev) =>
            prev < category.items.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : category.items.length - 1
          );
          break;
        case "Home":
          event.preventDefault();
          setFocusedIndex(0);
          break;
        case "End":
          event.preventDefault();
          setFocusedIndex(category.items.length - 1);
          break;
        case "Tab":
          setIsOpen(false);
          break;
      }
    },
    [category.items.length, isOpen, openDropdown]
  );

  if (!category.items.length) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={openDropdown}
      onMouseLeave={closeDropdown}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={cn(
          "relative flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          hasActiveItem
            ? "text-foreground"
            : "text-foreground/60 hover:text-foreground/80"
        )}
      >
        {category.name}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
        <span
          aria-hidden
          className={cn(
            "absolute bottom-0 left-3 right-3 h-0.5 origin-left rounded-full bg-linear-to-r from-primary to-secondary transition-transform duration-200",
            hasActiveItem || isOpen ? "scale-x-100" : "scale-x-0"
          )}
        />
      </button>

      {isOpen && (
        <div
          onMouseEnter={cancelClose}
          onMouseLeave={closeDropdown}
          className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3"
        >
          <div
            className="neu-card min-w-[220px] rounded-2xl border border-border/60 bg-background/95 p-2 shadow-[0_16px_40px_rgba(0,0,0,0.12)] backdrop-blur-sm"
            role="menu"
            aria-orientation="vertical"
            onKeyDown={handleKeyDown}
          >
            <div className="space-y-1">
              {category.items.map((item, index) => {
                const Icon = item.icon;
                const isActive = isPathActive(pathname, item.href);
                const isFocused = focusedIndex === index;

                return (
                  <Link
                    key={item.href}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    href={item.href}
                    prefetch={false}
                    role="menuitem"
                    tabIndex={isFocused ? 0 : -1}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-[transform,background-color,color] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                      isActive
                        ? "neu-pressed bg-primary/10 text-primary"
                        : "hover:translate-x-1 hover:bg-muted/40",
                      isFocused && !isActive && "bg-muted/50"
                    )}
                  >
                    {Icon && (
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                    )}
                    <div className="flex flex-col">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isActive && "text-primary"
                        )}
                      >
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
        </div>
      )}
    </div>
  );
}
