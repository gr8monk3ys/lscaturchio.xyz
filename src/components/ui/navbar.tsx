import Image from "next/image";
import Link from "next/link";

import { primaryNavigation } from "@/constants/navlinks";

import { ActiveNavLink } from "./active-nav-link";
import { NavbarControls } from "./navbar-controls";
import { AskDrawerTrigger } from "@/components/chat/ask-drawer-trigger";

const navLinkBaseClass =
  "relative block whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:origin-left after:rounded-full after:bg-primary after:transition-transform after:duration-200";

export function Navbar() {
  return (
    <>
      <header className="site-header fixed top-0 z-50 hidden border-b border-border/40 bg-background/90 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md md:block">
        {/* `container` resolves to 1280px at 2xl, 128px wider than the 1152px
            content cap, so the chrome sat wider than everything beneath it. */}
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="w-[200px]">
              <Link href="/" prefetch={false} className="flex items-center">
                <Image
                  src="/cursive.svg"
                  alt="Lorenzo Scaturchio"
                  width={200}
                  height={40}
                  className="h-14 w-auto dark:invert"
                  unoptimized
                />
              </Link>
            </div>

            <nav aria-label="Primary" className="flex items-center">
              <ul className="flex items-center space-x-2 rounded-full border border-border bg-background/80 px-3 py-2 backdrop-blur-sm">
                {/* One treatment. The branch that used to sit here compared
                    each href to `ACCENT_HREF`, which was the empty string, so
                    no item ever matched and the filled-CTA path never ran — a
                    dead branch with an eight-line comment describing a button
                    the header does not have. */}
                {primaryNavigation.map((item) => (
                  <li key={item.href}>
                    <ActiveNavLink
                      href={item.href}
                      className={navLinkBaseClass}
                      activeClassName="text-foreground after:scale-x-100"
                      inactiveClassName="text-foreground/70 hover:text-foreground/90 after:scale-x-0 hover:after:scale-x-100"
                    >
                      {item.name}
                    </ActiveNavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-3">
              <AskDrawerTrigger />
              <NavbarControls />
            </div>
          </div>
        </div>
      </header>
      <div className="hidden h-20 md:block" />
    </>
  );
}
