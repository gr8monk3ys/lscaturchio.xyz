import Image from "next/image";
import Link from "next/link";

import {
  contactLink,
  primaryNavigation,
  secondaryNavigationCategories,
} from "@/constants/navlinks";

import { ActiveNavLink } from "./active-nav-link";
import { NavDropdown } from "./nav-dropdown";
import { NavbarControlsGate } from "./navbar-controls-gate";

const navLinkBaseClass =
  "relative block whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:origin-left after:rounded-full after:bg-linear-to-r after:from-primary after:to-secondary after:transition-transform after:duration-200";

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
                {primaryNavigation.map((item) => (
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
                ))}

                <li aria-hidden className="mx-1 h-6 w-px bg-border/70" />

                {secondaryNavigationCategories.map((category) => (
                  <li key={category.name}>
                    <NavDropdown categoryName={category.name} />
                  </li>
                ))}

                <li>
                  <ActiveNavLink
                    href={contactLink.href}
                    className={navLinkBaseClass}
                    activeClassName="text-foreground after:scale-x-100"
                    inactiveClassName="text-foreground/60 hover:text-foreground/80 after:scale-x-0 hover:after:scale-x-100"
                  >
                    {contactLink.name}
                  </ActiveNavLink>
                </li>
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
