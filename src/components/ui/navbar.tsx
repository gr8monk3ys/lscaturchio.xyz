import Image from "next/image";
import Link from "next/link";

import { primaryNavigation } from "@/constants/navlinks";

import { ActiveNavLink } from "./active-nav-link";
import { NavbarControlsGate } from "./navbar-controls-gate";

const navLinkBaseClass =
  "relative block whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:origin-left after:rounded-full after:bg-linear-to-r after:from-primary after:to-secondary after:transition-transform after:duration-200";

// The one accent action in the header — hiring is the commercial CTA, so it
// gets the filled treatment while everything else stays quiet. Breadth lives
// in the footer site map and ⌘K search, not in dropdowns.
const ACCENT_HREF = "/work-with-me";
const accentLinkClass =
  "block whitespace-nowrap rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

export function Navbar() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 hidden border-b border-border/40 bg-background/90 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md md:block">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="w-[200px]">
              <Link href="/" prefetch={false} className="flex items-center">
                <Image
                  src="/cursive.svg"
                  alt="Lorenzo Scaturchio"
                  width={200}
                  height={40}
                  className="h-14 w-auto dark:invert"
                />
              </Link>
            </div>

            <nav aria-label="Primary" className="flex items-center">
              <ul className="flex items-center space-x-2 rounded-full border border-border bg-background/80 px-3 py-2 shadow-[inset_0_1px_0_hsl(var(--border))] backdrop-blur-sm">
                {primaryNavigation.map((item) =>
                  item.href === ACCENT_HREF ? (
                    <li key={item.href}>
                      <Link href={item.href} prefetch={false} className={accentLinkClass}>
                        {item.name}
                      </Link>
                    </li>
                  ) : (
                    <li key={item.href}>
                      <ActiveNavLink
                        href={item.href}
                        className={navLinkBaseClass}
                        activeClassName="text-foreground after:scale-x-100"
                        inactiveClassName="text-foreground/60 hover:text-foreground/80 after:scale-x-0 hover:after:scale-x-100"
                      >
                        {item.name}
                      </ActiveNavLink>
                    </li>
                  )
                )}
              </ul>
            </nav>

            <NavbarControlsGate />
          </div>
        </div>
      </header>
      <div className="hidden h-20 md:block" />
    </>
  );
}
