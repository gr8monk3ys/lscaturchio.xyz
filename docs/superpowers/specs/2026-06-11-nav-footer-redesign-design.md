# Slim nav + fat footer redesign

Date: 2026-06-11
Status: approved (approach A of three presented)

## Problem

The desktop header exposes 20+ destinations: 3 direct links, four hover
dropdowns (About·3, Work·4, Content·8, Personal·5), Contact, search, language,
and theme. The Work dropdown duplicates two of the direct links sitting next
to it. This is a SaaS mega-menu pattern on a personal site; reference personal
sites (Lee Robinson, Josh Comeau, Maggie Appleton) keep 4–6 flat links and
push breadth into a footer/site-map plus search.

The footer, meanwhile, is thin where it should be rich: a "Quick Links" column
that duplicates the nav, a mostly-empty Contact column, and four stacked CTA
buttons that crowd the left edge.

Constraint: **no pages are retired.** The garden's breadth is intentional
(see project memory). The nav slims; the footer absorbs the breadth.

## Design

### Header (desktop, `src/components/ui/navbar.tsx`)

Flat links only — the four `NavDropdown`s and the divider go away:

- `Writing` → /blog
- `Projects` → /projects
- `About` → /about
- `Work With Me` → /work-with-me, styled as the single accent CTA (it is the
  commercial action; everything else stays quiet)

`NavbarControlsGate` (search ⌘K, language, theme) is unchanged. The logo and
its 200px balance column are unchanged. Chat stays discoverable via the hero
ask-box and the footer. Contact moves to the footer (and remains on
/work-with-me).

Discovery for everything else = ⌘K search + the new footer site map.

### Mobile (`src/components/ui/mobile-navbar.tsx`)

Unchanged. The full-screen categorized menu is the right mobile pattern. It
keeps consuming `navigationCategories`.

### Constants (`src/constants/navlinks.tsx`)

- `primaryNavigation` becomes the four links above. The navbar special-cases
  the `/work-with-me` href for accent styling (no schema change to `NavItem`).
- New `footerColumns: NavCategory[]` export — explicit curation, separate from
  the mobile categories:
  - **Writing**: Blog, Topics, Series, Podcast, Changelog
  - **Work**: Projects, Work With Me, Services, Uses
  - **Garden**: Books, Movies, Photos, Now, Lab, Guestbook, Links
  - **About**: About, Professional, Chat, Contact
  (Stats stays in the bottom bar only, where it already lives.)
- `navigationCategories` stays (mobile menu). `secondaryNavigationCategories`
  and `contactLink` remain for mobile use.
- `NavDropdown` (`nav-dropdown.tsx`) becomes unused on desktop → delete the
  component and its imports.

### Footer (`src/components/ui/footer-section.tsx`)

Two-band layout:

1. **Colophon band** (left, ~1/3 width on desktop) + **four link columns**
   (right, from `footerColumns`, each a `<nav aria-label={column}>`).
   Colophon contains: one-sentence personal sign-off, a built-with line
   ("Next.js, Neon, and a garden that keeps growing"), the email link, the
   social icon row, and a single compact row for RSS / Newsletter / Buy-me-a-
   pizza (replacing the four stacked buttons; "Join Lorenzo Social" folds into
   the social icon row).
2. **Bottom bar**: unchanged (copyright, Stats, Privacy, Terms).

The old "Quick Links", "Contact", and "Stay Connected" columns are replaced
by the above; no link is lost — every current footer destination appears in
either a column, the colophon, or the bottom bar.

## Error handling

None required — purely presentational changes plus a constants export. No
data fetching, no client state. `Footer` stays a server component; `Navbar`
stays a server component.

## Testing & verification

- Add `src/__tests__/components/footer-section.test.tsx`: renders all four
  column headings and spot-checks one href per column.
- Add `src/__tests__/components/navbar.test.tsx`: renders the four primary
  links with correct hrefs and no dropdown buttons.
- Existing suite, lint, typecheck, production build must stay green.
- Visual check: dev/prod server screenshot of header and footer, desktop and
  mobile widths.

## Out of scope

- Retiring any page.
- Mobile menu redesign.
- A dedicated /explore garden-map page (possible later evolution).
