import Image from "next/image";
import Link from "next/link";

import { primaryNavigation } from "@/constants/navlinks";

import { ActiveNavLink } from "./active-nav-link";
import { NavbarControls } from "./navbar-controls";
import { AskDrawerTrigger } from "@/components/chat/ask-drawer-trigger";

const navLinkBaseClass =
  "label-mono label-link relative whitespace-nowrap px-3 py-2 transition-colors after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:origin-left after:bg-primary after:transition-transform after:duration-200";

export function Navbar() {
  return (
    <>
      {/* A flat signage row the width of the viewport, closed by the same ink
          rule that divides the plates beneath it. Opaque paper: no shadow and
          no blur, so nothing reads through it. */}
      <header className="site-header fixed top-0 z-chrome hidden border-b border-rule bg-background md:block">
        <div className="w-full px-[clamp(14px,1.5vw,24px)]">
          <div className="flex h-[calc(5rem-1px)] items-center justify-between">
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
              <ul className="flex items-center gap-1">
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
                      inactiveClassName="text-muted-foreground hover:text-foreground after:scale-x-0 hover:after:scale-x-100"
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
