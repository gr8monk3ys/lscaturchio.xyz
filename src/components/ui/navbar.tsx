import Image from "next/image";
import Link from "next/link";

import { primaryNavigation } from "@/constants/navlinks";

import { ActiveNavLink } from "./active-nav-link";
import { NavbarControls } from "./navbar-controls";
import { AskDrawerTrigger } from "@/components/chat/ask-drawer-trigger";

const navLinkBaseClass =
  "relative block whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:origin-left after:rounded-full after:bg-primary after:transition-transform after:duration-200";

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
                {/* `priority`, and the asset's real dimensions.
                    Two defects sat on this one element. It is the Largest
                    Contentful Paint on the home page — Next said so by name in
                    the console — and it was lazy-loaded, because that is
                    next/image's default and nothing overrode it. The site's
                    own wordmark was therefore deprioritised against content
                    below the fold.
                    And the declared 200×40 claimed a 5:1 ratio for a file that
                    is 818×198, or 4.13:1. Next warned about the mismatch on
                    every route, not just the one. The numbers now match the
                    asset, so `h-14 w-auto` scales it without distorting it. */}
                <Image
                  src="/cursive.svg"
                  alt="Lorenzo Scaturchio"
                  width={818}
                  height={198}
                  priority
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
      {/* Header space, reserved for both breakpoints by the one server-rendered
          component, so it is in the first byte of HTML.

          The 64px mobile half is new, and it belongs here rather than in
          `MobileNavbar`. That component is loaded through `MobileNavbarGate`,
          which is `ssr: false` and returns null until a media-query effect
          runs — so a spacer inside it would appear one frame after paint and
          shift every mobile page down 64px. The gate's own comment records the
          mirror-image of that trap from when the mobile chrome was a floating
          button that occupied nothing. Reservation is layout, and layout has to
          be server-rendered; the bar itself stays client-only chrome that
          overlays the space held here. */}
      <div className="h-16 md:h-20" />
    </>
  );
}
