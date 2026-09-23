import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

/**
 * The design system, asserted on what the browser receives.
 *
 * `src/__tests__/lib/design-drift.test.ts` greps source text, and that
 * instrument cannot see the defects that survived it. Every one of these was
 * found by a reviewer looking at a rendered page, and none of them is a
 * property of a line:
 *
 * - `/contact` painted two filled CTAs and `/professional` two, against
 *   DESIGN.md's "one primary per view". The rule is composed across files, so
 *   no single-file grep can enforce it.
 * - `/photos` was called "Photos" in the nav, "Photographs" on /garden and
 *   "Photography" in its own head. The nav-vocabulary check collects pairs from
 *   `@/constants/navlinks` only, so two of the three names were invisible to it.
 * A ring-offset check was tried here and removed: `--tw-ring-offset-color` is
 * an inherited custom property, so every element in the document reports it and
 * the DOM cannot separate declared from inherited. That one is a regex's job,
 * and `ring-offset-without-paper` in the source gate does it.
 * - An explicit `grid-cols-[260px_1fr]` whose rail rendered nothing put the
 *   essay in the 260px track. That one now has a unit guard, but the class —
 *   any declared track whose occupant can vanish — did not.
 *
 * One render sees them all. Keep this list short and composed: a rule that a
 * regex can check belongs in the source gate, not here.
 */

const ROUTES = [
  '/',
  '/about',
  '/blog',
  '/blog/building-rag-systems',
  '/projects',
  '/professional',
  '/contact',
  '/changelog',
  '/now',
  '/uses',
  '/books',
  '/music',
  '/photos',
  '/lab',
  '/garden',
  '/colophon',
]

/**
 * Every statically routable page, read off the filesystem.
 *
 * `ROUTES` above is a hand-picked 16, and the cheap page-level checks were
 * spending that list for no reason. The Suspense defect below was a property
 * of the root `loading.tsx`, so it hit all 129 routes at once and the list
 * caught it only because `/stats` had been appended by hand after the fact —
 * the audit that found it had to look at a route nobody had thought to add.
 *
 * A hardcoded list is the wrong instrument for a defect that arrives by
 * inheritance. This one cannot go stale: a new page.tsx is covered the day it
 * lands, which is the only way a 129-route site stays checkable by a list
 * nobody maintains.
 *
 * Excluded, with reasons — an exclusion here is a route that cannot answer a
 * plain GET, not a route that is inconvenient:
 *   - `[slug]`/`[tag]`: no concrete path to visit. `ROUTES` covers one of each
 *     by hand (`/blog/building-rag-systems`).
 *   - `admin/**`: session-gated, and `redirect('/admin/login')` is the correct
 *     response. `e2e/admin.spec.ts` owns that gate.
 *   - `offline`: the service worker's fallback document. It is served by the
 *     worker on a failed fetch, not by the router.
 */
function staticRoutes(): string[] {
  const appDir = path.join(process.cwd(), 'src/app')

  function walk(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      if (entry.isDirectory()) return walk(path.join(dir, entry.name))
      if (entry.name !== 'page.tsx') return []

      const segments = path
        .relative(appDir, dir)
        .split(path.sep)
        .filter((segment) => segment !== '' && !segment.startsWith('('))

      if (segments.some((segment) => segment.startsWith('['))) return []
      if (segments[0] === 'admin' || segments[0] === 'offline') return []

      return [`/${segments.join('/')}`]
    })
  }

  return [...new Set(walk(appDir))].sort()
}

const ALL_STATIC_ROUTES = staticRoutes()

/**
 * Routes allowed to leave a Suspense boundary pending, and why.
 *
 * Needs a reason, like `ALLOWED` in `src/__tests__/lib/design-drift.test.ts`:
 * the rule below exists because a *silent* fallback became the whole page for a
 * reader without JavaScript. A boundary whose fallback says what is true and
 * points somewhere readable is the opposite of that defect, and the difference
 * is the copy, which only a person can judge.
 *
 * The bar is that the feature genuinely cannot work without scripts. "This
 * component is slow" is not on it — delete the boundary instead.
 */
const MAY_PARK_BEHIND_SCRIPT: Record<string, string> = {
  '/chat':
    "Composing an answer is streamed into the browser, so the feature is scripts or nothing. The fallback says exactly that and links to /blog, which is readable without them — see the comment in src/app/chat/page.tsx.",
}

test.describe('design invariants, in the DOM', () => {
  // Pages whose whole job is to get the reader to do one thing. These must
  // paint exactly one filled CTA — not at most one. /professional shipped with
  // *zero* after a change demoted its Calendly link on the belief that the
  // résumé button was primary, which it was not; the old assertion was blind
  // to that because it only ever counted downward.
  const CONVERSION_ROUTES = ['/contact', '/professional', '/work-with-me']

  test('a conversion route paints exactly one filled CTA', async ({ page }) => {
    const offenders: string[] = []

    for (const route of CONVERSION_ROUTES) {
      await page.goto(route, { waitUntil: 'networkidle' })
      const found = await page.locator('.cta-primary').evaluateAll((nodes) =>
        nodes
          .filter((node) => {
            const style = getComputedStyle(node)
            return style.display !== 'none' && style.visibility !== 'hidden'
          })
          .map((node) => `${node.tagName.toLowerCase()}: ${node.textContent?.trim().slice(0, 40)}`)
      )
      if (found.length !== 1) {
        offenders.push(`${route} paints ${found.length}${found.length ? `: ${found.join(' | ')}` : ' — no primary action at all'}`)
      }
    }

    expect(
      offenders,
      ['A page that asks for something must have one thing to press.', '', ...offenders].join('\n')
    ).toEqual([])
  })

  test('every route paints at most one filled CTA', async ({ page }) => {
    const offenders: string[] = []

    for (const route of ROUTES) {
      await page.goto(route, { waitUntil: 'networkidle' })
      const found = await page.locator('.cta-primary').evaluateAll((nodes) =>
        nodes
          .filter((node) => {
            const style = getComputedStyle(node)
            return style.display !== 'none' && style.visibility !== 'hidden'
          })
          .map((node) => `${node.tagName.toLowerCase()}: ${node.textContent?.trim().slice(0, 40)}`)
      )
      if (found.length > 1) {
        offenders.push(`${route} paints ${found.length}: ${found.join(' | ')}`)
      }
    }

    expect(offenders, ['DESIGN.md: one primary per view.', '', ...offenders].join('\n')).toEqual([])
  })

  test('every destination has exactly one name', async ({ page }) => {
    const namesByHref = new Map<string, Map<string, string>>()

    for (const route of ROUTES) {
      await page.goto(route, { waitUntil: 'networkidle' })
      // The site's *persistent* navigation only: the header and the footer.
      //
      // Scoping to every `<nav>` was still too broad, which took three tries to
      // get right. A page's closing exits are wrapped in `<nav>` because that is
      // correct for a screen reader, but their text is editorial — /music ends
      // with "Back to the garden" and "What I am making instead", /photos with
      // "Who is holding it", the 404 with "Ask the site where it went". Those
      // are calls to action, and copy is allowed to be copy.
      //
      // A destination's *name* is what the header and footer call it, and that
      // is the pair a reader compares when they arrive from search and then
      // look at the nav. Nothing else on the page is making a naming claim.
      //
      // Fourth correction, same lesson: `header nav` matches a `<nav>` inside
      // ANY `<header>`, including the page's own. /blog's stage filter lives
      // there, so consolidating two filters into one — which gave the survivor
      // an "All 84" option pointing at /blog — made this rule report that
      // /blog is called both "Writing" and "All 84". A filter option names a
      // subset of a list, not a destination. `header.site-header` is the site
      // chrome and nothing else.
      const links = await page.locator('header.site-header nav a[href^="/"], footer a[href^="/"]').evaluateAll((nodes) =>
        nodes.map((node) => ({
          href: (node as HTMLAnchorElement).getAttribute('href') ?? '',
          // The visible label, not the accessible name: an icon-only link has
          // no text and is not what this rule is about.
          text: (node.textContent ?? '').replace(/\s+/g, ' ').trim(),
        }))
      )

      for (const { href, text } of links) {
        // Only the site's own top-level destinations, and only labels short
        // enough to be a name rather than a sentence or a card blurb.
        if (!/^\/[a-z-]+$/.test(href)) continue
        if (!text || text.length > 24) continue
        const clean = text.replace(/^[←→\s·]+|[←→\s·]+$/g, '')
        if (!clean) continue
        const seen = namesByHref.get(href) ?? new Map<string, string>()
        if (!seen.has(clean)) seen.set(clean, route)
        namesByHref.set(href, seen)
      }
    }

    const conflicts = [...namesByHref.entries()]
      .filter(([, names]) => names.size > 1)
      .map(
        ([href, names]) =>
          `${href} is called ${[...names.entries()].map(([n, where]) => `"${n}" (on ${where})`).join(' and ')}`
      )

    expect(
      conflicts,
      [
        'One destination, one name, across every nav the site renders.',
        'The unit rule reads @/constants/navlinks only, so it could not see the',
        'essay breadcrumb calling /blog "Blog" while the header called it "Writing".',
        '',
        ...conflicts,
      ].join('\n')
    ).toEqual([])
  })

  test('the stage filter /blog promises actually filters', async ({ page }) => {
    // The lede has always said "filter by tag or stage for the date-ordered
    // archive", and the page rendered nothing that could set one: the archive
    // existed and was reachable only by typing ?stage= into the URL.
    //
    // Written as behaviour, not as shape. The first version of this test
    // scanned for an <a> carrying the param or a named form control, and
    // reported /projects as broken — where the category buttons are real and
    // push the param through the router, which no attribute scan can see.
    // Clicking the thing is both correct and a stronger claim.
    await page.goto('/blog', { waitUntil: 'networkidle' })

    const unfiltered = await page.locator('a[href^="/blog/"]').count()
    expect(unfiltered, '/blog should list essays').toBeGreaterThan(1)

    const stageFilter = page.getByRole('navigation', { name: 'Filter by stage' })
    await expect(stageFilter, '/blog must render the filter its lede promises').toBeVisible()

    // Not `.first()`: the filter now opens with an "All" option, which hrefs
    // back to the unfiltered route and so can never set `?stage=`. That "All"
    // came from consolidating two competing stage filters into one, and it
    // made this test click the reset link and wait for a param that was never
    // coming.
    const firstStage = stageFilter.getByRole('link', { name: /^(SEEDLING|BUDDING|EVERGREEN)/ }).first()
    const label = (await firstStage.textContent())?.trim() ?? ''

    // `waitForURL`, not `waitForLoadState('networkidle')`: this is a client-side
    // navigation, and networkidle can resolve before the router has committed
    // the new URL. The first version of this test read the old URL and blamed
    // the page.
    await Promise.all([page.waitForURL(/[?&]stage=/, { timeout: 15000 }), firstStage.click()])

    expect(page.url(), `clicking "${label}" should set ?stage=`).toContain('stage=')
    await page.waitForLoadState('networkidle')

    const filtered = await page.locator('a[href^="/blog/"]').count()
    expect(
      filtered,
      `"${label}" returned ${filtered} of ${unfiltered} essays — a filter that changes nothing is not a filter`
    ).toBeLessThan(unfiltered)
    expect(filtered, 'and it should return something').toBeGreaterThan(0)
  })

  test('the index shows the stage it authors on every essay', async ({ page }) => {
    // Every essay declares a stage and the index showed none of them, so a
    // seedling and an evergreen looked identical. writing-style.md is explicit
    // that "the label is the honesty"; the reader saw it only after clicking.
    await page.goto('/blog', { waitUntil: 'networkidle' })

    const rows = page.locator('a[href^="/blog/"]')
    const total = await rows.count()
    const dated = await page.locator('a[href^="/blog/"] time[datetime]').count()

    expect(dated, `${dated} of ${total} rows carry a date`).toBe(total)

    // At least one stage badge must be present, or the signal is still hidden.
    const staged = await page
      .locator('a[href^="/blog/"]')
      .filter({ hasText: /SEEDLING|BUDDING|EVERGREEN/ })
      .count()
    expect(staged, 'no row shows a stage').toBeGreaterThan(0)
  })

  test('the header ships its controls in the HTML, not placeholders for them', async ({
    page,
  }) => {
    // The search trigger and theme toggle used to sit behind
    // `requestIdleCallback(…, {timeout: 1200})`, and until it fired the header
    // rendered `aria-hidden` boxes that mirrored them class for class — a
    // search field with the ⌘K chip, a toggle-shaped square. They looked
    // interactive, were not focusable, and were absent from the accessibility
    // tree. DESIGN.md's motion doctrine already forbids the mechanism —
    // "nothing waits for a scroll observer, a mount transition or an idle
    // callback to become readable" — but it was written about content, so the
    // chrome kept doing it.
    //
    // Asserted against the raw server HTML, because that is the state a decoy
    // hides in: post-hydration everything looks fine.
    const response = await page.goto('/', { waitUntil: 'commit' })
    const html = (await response?.text()) ?? ''

    // The ask trigger is matched on `aria-controls`, not on its label. It was
    // matched on the literal "Ask this site", which is a *name* — and the one
    // feature it names had five of them across the site ("Ask this site",
    // "Ask the site anything", "Ask the essays anything.", "Chat with
    // Lorenzo", "AI Chat"). Unifying them to one broke this assertion, which
    // is the wrong way round: the test should fail when the control is missing,
    // not when the copy improves. `aria-controls="ask-drawer"` is what makes it
    // that control, and it is what the drawer's own `id` has to agree with.
    const required = [
      { name: 'search trigger', pattern: />Search</ },
      { name: 'theme toggle', pattern: /aria-label="Toggle theme"/ },
      { name: 'ask trigger', pattern: /aria-controls="ask-drawer"/ },
    ]

    const missing = required
      .filter(({ pattern }) => !pattern.test(html))
      .map(({ name }) => `${name} is not in the server HTML`)

    expect(
      missing,
      [
        'A control the header shows must be a control, from the first byte.',
        '',
        ...missing,
      ].join('\n')
    ).toEqual([])

    // And nothing aria-hidden may still be impersonating one.
    const decoys = await page.evaluate(() => {
      const header = document.querySelector('.site-header')
      if (!header) return []
      return Array.from(header.querySelectorAll<HTMLElement>('[aria-hidden="true"]'))
        .filter((el) => {
          const style = getComputedStyle(el)
          const box = el.getBoundingClientRect()
          // A bordered, filled box the size of a control, holding content.
          return (
            style.borderStyle !== 'none' &&
            style.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
            box.width >= 32 &&
            box.height >= 24 &&
            (el.textContent ?? '').trim().length > 0
          )
        })
        .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(/\s+/)[0]}: "${(el.textContent ?? '').trim().slice(0, 24)}"`)
    })

    expect(
      decoys,
      ['An aria-hidden box that looks like a control is a decoy.', '', ...decoys].join('\n')
    ).toEqual([])
  })

  test('no route parks its content behind a script', async ({ page }) => {
    // The page-level form of the test above, and a far larger defect than the
    // one that test was written for.
    //
    // `app/loading.tsx` was a `HomeLoading` masthead, and every route without
    // its own `loading.tsx` inherited it — so `/stats`, `/uses`, `/garden` and
    // `/contact` all opened on the shape of the home page. That was the
    // visible half. A `loading.tsx` creates a Suspense boundary, and React's
    // streaming format writes the fallback into the markup while parking the
    // resolved content in a `<div hidden id="S:n">` for a `$RC` script to move
    // into place. With JavaScript off that script never runs, so the fallback
    // is final: every route served roughly 410 characters — the skip link and
    // the ask drawer's copy — plus 17 to 36 pulsing bars, and no content at
    // all. `/stats` was sixty-three of them and not one number.
    //
    // DESIGN.md's motion doctrine already said "nothing waits for a scroll
    // observer, a mount transition or an idle callback to become readable".
    // A script that reveals the entire page is that sentence with a larger
    // subject, which is why this asserts the mechanism rather than the pixels:
    // a pending boundary in the response means the content is behind a script,
    // whatever it looks like once hydration lands.
    //
    // Seventeen design reviews scored this site with JavaScript on, and not
    // one of them could see this.
    //
    // Runs against every statically routable page rather than the 16 in
    // `ROUTES`: the defect arrived by inheritance from one root file, so the
    // routes least likely to be on a hand-written list were hit just as hard.
    await page.route('**/api/views*', (route) => route.abort())

    const offenders: string[] = []
    const parked = new Set<string>()

    for (const route of ALL_STATIC_ROUTES) {
      const response = await page.goto(route, { waitUntil: 'commit' })
      const html = (await response?.text()) ?? ''

      // `<template id="B:n">` is React's unresolved boundary. Its presence is
      // the defect; what the fallback happens to look like is not the point.
      const pending = html.match(/<template id="B:\d+">/g)?.length ?? 0
      if (pending > 0) parked.add(route)
      if (pending > 0 && !MAY_PARK_BEHIND_SCRIPT[route]) {
        offenders.push(`${route} leaves ${pending} Suspense boundary(s) pending in its response`)
      }

      const pulses = html.match(/animate-pulse/g)?.length ?? 0
      if (pulses > 0) {
        offenders.push(`${route} ships ${pulses} animate-pulse node(s) in its response`)
      }

      // The positive half: the response must carry the page's own heading,
      // not merely avoid a skeleton. A blank page ships no pulses either.
      if (!/<h1[\s>]/.test(html)) {
        offenders.push(`${route} has no h1 in its response`)
      }
    }

    // An allowance nobody needs is a rule nobody is following. If /chat stops
    // parking a boundary, this entry should be deleted rather than left to
    // quietly permit the next one.
    const unusedAllowances = Object.keys(MAY_PARK_BEHIND_SCRIPT).filter(
      (route) => !parked.has(route)
    )
    expect(
      unusedAllowances,
      `MAY_PARK_BEHIND_SCRIPT lists routes that no longer park anything: ${unusedAllowances.join(', ')}`
    ).toEqual([])

    expect(
      offenders,
      [
        'A route must render its content, not a placeholder only JavaScript can replace.',
        "Delete the segment's loading.tsx rather than reshaping its skeleton.",
        '',
        ...offenders,
      ].join('\n')
    ).toEqual([])
  })

  test("a route's tab title matches what the nav calls it", async ({ page }) => {
    // The existing name check reads `nav a` labels, so it sees the header and
    // the footer agreeing with each other and nothing else. /professional was
    // "Hire me" in the nav, "Professional" in the tab and "Work and skills" in
    // its own h1 — three names for one destination, none of which the guard
    // could compare. /blog was "Writing" and "Blog".
    //
    // A reader arriving from search sees the tab; a reader already on the site
    // sees the nav. If those disagree, the two halves of the audience are on
    // different sites.
    const offenders: string[] = []

    // Collect every nav label per href once, from the home page.
    await page.goto('/', { waitUntil: 'networkidle' })
    const navNames = await page.locator('nav a[href^="/"]').evaluateAll((nodes) => {
      const map: Record<string, string[]> = {}
      for (const node of nodes) {
        const href = (node as HTMLAnchorElement).getAttribute('href') ?? ''
        if (!/^\/[a-z-]+$/.test(href)) continue
        const text = (node.textContent ?? '').replace(/\s+/g, ' ').trim()
        if (!text || text.length > 24) continue
        map[href] = [...new Set([...(map[href] ?? []), text])]
      }
      return map
    })

    for (const [href, names] of Object.entries(navNames)) {
      await page.goto(href, { waitUntil: 'domcontentloaded' })
      // The layout appends " | Lorenzo Scaturchio"; the route owns the first part.
      const tab = (await page.title()).split('|')[0].trim()
      if (!tab) continue
      const matches = names.some(
        (name) => tab.toLowerCase() === name.toLowerCase()
      )
      if (!matches) {
        offenders.push(`${href}: nav says ${names.map((n) => `"${n}"`).join('/')}, tab says "${tab}"`)
      }
    }

    expect(
      offenders,
      ['A destination should have the same name in the tab and in the nav.', '', ...offenders].join('\n')
    ).toEqual([])
  })

  test('a ramp token computes the tracking it declares', async ({ page }) => {
    // The Fluid Heading Rule sets tracking per step and loosens it as size
    // falls: -0.035 / -0.03 / -0.026 / -0.02 / -0.01em. Anything that also
    // applies `tracking-tight` flattens all five to -0.025em.
    //
    // Three source rules have chased this and all three key on a literal class
    // string, so none of them could see `tracking-tight` sitting in
    // `Heading.tsx`'s own base classes beside the token it overrode — two
    // arguments of one `cn()` call, concatenated at runtime. The DOM does not
    // care how the string was assembled.
    const EXPECTED: Record<string, string> = {
      'text-display': '-0.035em',
      'text-page-title': '-0.03em',
      'text-section-title': '-0.026em',
      'text-card-title': '-0.02em',
      'text-subsection': '-0.01em',
    }

    const offenders: string[] = []

    for (const route of ROUTES) {
      await page.goto(route, { waitUntil: 'networkidle' })

      const bad = await page.evaluate((expected) => {
        const out: string[] = []
        for (const [token, want] of Object.entries(expected)) {
          for (const el of Array.from(document.querySelectorAll<HTMLElement>(`.${token}`))) {
            const size = parseFloat(getComputedStyle(el).fontSize)
            const got = getComputedStyle(el).letterSpacing
            // Compare in ems: the token declares em, the DOM reports px.
            const gotEm = got === 'normal' ? 0 : parseFloat(got) / size
            const wantEm = parseFloat(want)
            if (Math.abs(gotEm - wantEm) > 0.002) {
              out.push(
                `${token} on ${el.tagName.toLowerCase()} computes ${gotEm.toFixed(4)}em, declares ${want}`
              )
            }
          }
        }
        return [...new Set(out)]
      }, EXPECTED)

      if (bad.length) offenders.push(`${route}: ${bad.join(' | ')}`)
    }

    expect(
      offenders,
      [
        'A ramp token must compute the tracking it declares — nothing may flatten the ramp.',
        '',
        ...offenders,
      ].join('\n')
    ).toEqual([])
  })

  test('a list that overflows says so, and says how much', async ({ page }) => {
    // The palette held 24 destinations in a 540px window over 1681px of
    // content and gave the reader no signal. Row 9 clipped mid-row at the
    // panel edge, which is the only cue there was — and a half-row reads as a
    // rendering seam rather than as "there is more". Fifteen of 24
    // destinations existed unannounced, on the surface whose value is coverage.
    //
    // This lives in e2e rather than in a unit test because both halves are
    // layout: jsdom reports `scrollHeight` and `clientHeight` as 0, so the
    // affordance is unobservable there and a passing unit test would have meant
    // nothing. It asserts the affordance appears *because* of overflow and
    // retracts at the end of the scroll, not that a class is present.
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.locator('[data-command-palette-trigger]').first().click()

    const dialog = page.locator('[role="dialog"][aria-label="Search and navigate"]')
    await expect(dialog).toBeVisible()

    const list = dialog.locator('[role="listbox"]')
    const overflows = await list.evaluate((el) => el.scrollHeight > el.clientHeight + 1)
    expect(overflows, 'the palette list should overflow at this viewport').toBe(true)

    // The extent, in words. This is the half a scroll indicator cannot express.
    await expect(dialog).toContainText(/\d+ destinations/)

    const hairline = dialog.locator('[aria-hidden="true"].absolute.inset-x-0.bottom-0.border-b')
    await expect(hairline).toHaveCount(1)

    await list.evaluate((el) => {
      el.scrollTop = el.scrollHeight
    })
    // Gone at the bottom: the cue tracks the actual scroll position rather
    // than merely the fact that the list is long.
    await expect(hairline).toHaveCount(0)
  })

  test('below its push breakpoint, the ask drawer is a real modal over the chrome it covers', async ({
    page,
  }) => {
    // At 1440 the drawer opened at `left: 1056` while `.site-shell` kept
    // `padding-inline-end: 0px` — the push layout in globals.css is gated to
    // `min-width: 1536px`, so at 1440 the panel covered the ASK trigger
    // (right edge 1066), Search (1216) and the theme toggle (1264) with
    // nothing marking them unreachable. A reader could see all three, try to
    // click one, and land on the drawer instead.
    //
    // The fix does not raise the breakpoint or shrink the panel; it makes the
    // overlay a real modal, the same contract ⌘K already keeps: `.ask-scrim`
    // covers the full viewport and takes pointer events, the panel carries
    // `role="dialog"` and `aria-modal="true"`, and a focus trap keeps Tab
    // inside it. Covering the header is then consistent with the rest of the
    // page being inert, not a leak. This asserts that contract at 1440 — a
    // width the push breakpoint excludes and the header-controls test above
    // does not touch — so a regression that re-opens the gap between "visually
    // covered" and "actually reachable" fails here.
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.route('**/api/views', (route) => route.abort())
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.getByLabel('Ask the site').first().click()

    const drawer = page.locator('#ask-drawer')
    await expect(drawer).toBeVisible()
    await expect(drawer).toHaveAttribute('role', 'dialog')
    await expect(drawer).toHaveAttribute('aria-modal', 'true')

    // Push mode never engaged: the shell took none of its layout width back.
    const shellPadding = await page
      .locator('.site-shell')
      .evaluate((el) => getComputedStyle(el).paddingInlineEnd)
    expect(shellPadding, 'the shell should not have yielded width below 1536px').toBe('0px')

    // The scrim is not decoration at this width: it spans the viewport and
    // intercepts clicks, which is what makes the covered controls inert
    // instead of merely hidden.
    const scrim = await page.locator('.ask-scrim').evaluate((el) => {
      const box = el.getBoundingClientRect()
      const style = getComputedStyle(el)
      return { width: box.width, height: box.height, pointerEvents: style.pointerEvents }
    })
    expect(scrim.width, 'scrim should span the full viewport width').toBeGreaterThanOrEqual(1440)
    expect(scrim.height, 'scrim should span the full viewport height').toBeGreaterThanOrEqual(900)
    expect(scrim.pointerEvents, 'scrim should block clicks to what it covers').toBe('auto')

    // The trap does not let Tab walk out of the panel into the controls
    // sitting under the scrim, so a keyboard user starting from the
    // auto-focused composer never reaches a target the mouse also cannot
    // reach. Cycled well past the panel's own focusable count (composer,
    // reset, close, input, send) to prove it wraps rather than merely delays
    // the escape.
    const startedInPanel = await drawer.evaluate((panel) => panel.contains(document.activeElement))
    expect(startedInPanel, 'opening the drawer should focus something inside it').toBe(true)

    const themeToggle = page.getByLabel('Toggle theme')
    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press('Tab')
      const stillInPanel = await drawer.evaluate((panel) => panel.contains(document.activeElement))
      expect(stillInPanel, `tab ${i + 1} should stay inside the drawer`).toBe(true)
    }
    await expect(themeToggle).not.toBeFocused()
  })

  test('nothing in flow renders past the viewport on a phone', async ({ page }) => {
    // `scrollWidth` cannot see this, and that is the entire point.
    //
    // `main` carries `overflow-x: clip`, so a min-content blowout is clipped
    // rather than scrolled: `document.scrollWidth === innerWidth` stays
    // exactly true while content renders off-screen and unreachable. Eleven
    // design measurements in a row certified "zero horizontal overflow" from
    // that equality, and all eleven missed a P0 — `LedgerSection`'s grid item
    // defaulted to `min-width: auto`, a `truncate` span inside it measured
    // 381px, and the single sub-`lg` track resolved to 450px inside a 358px
    // container. Forty-eight in-flow elements rendered out to x=466 on a
    // 390px phone, with project titles amputated mid-word and the ellipsis
    // itself painted outside the screen.
    //
    // So this asserts the geometry directly: no in-flow, visible element may
    // have a right edge past the viewport. `position: fixed` is excluded
    // because off-canvas drawers live there deliberately and contribute
    // nothing to layout width.
    const WIDTHS = [360, 390, 430]
    const ROUTES = ['/', '/blog', '/projects', '/garden', '/about']
    const offenders: string[] = []

    // A positive control, first, because a green result from this check is
    // only worth what the check is worth. A measurement pass of this site
    // once printed `{}` and read as a clean sweep across 80 page loads while
    // measuring nothing at all — `page.evaluate` handed a string instead of a
    // function returns `undefined`, and `JSON.stringify` drops
    // undefined-valued keys silently. That is the same shape of failure as
    // trusting `scrollWidth`: an instrument reporting confidence it has not
    // earned.
    //
    // So: inject an element that MUST be caught, confirm it is caught, remove
    // it. If this assertion ever fails, the probe below is broken and its
    // zero means nothing.
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const controlCaught = await page.evaluate(() => {
      const main = document.querySelector('main') ?? document.body
      const canary = document.createElement('div')
      canary.id = 'overflow-canary'
      canary.style.cssText = 'width:900px;height:8px;background:red'
      main.appendChild(canary)
      const caught = canary.getBoundingClientRect().right > window.innerWidth + 1
      canary.remove()
      return { caught, stillPresent: !!document.getElementById('overflow-canary') }
    })
    expect(
      controlCaught.caught,
      'positive control: a 900px element on a 390px viewport must register as overflowing'
    ).toBe(true)
    expect(controlCaught.stillPresent, 'the control element must be removed again').toBe(false)

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 844 })

      for (const route of ROUTES) {
        await page.goto(route, { waitUntil: 'domcontentloaded' })
        await page.waitForTimeout(400)

        const over = await page.evaluate((vw) => {
          const out: Array<{ sel: string; right: number }> = []
          const main = document.querySelector('main') ?? document.body
          for (const el of Array.from(main.querySelectorAll<HTMLElement>('*'))) {
            const cs = getComputedStyle(el)
            if (cs.position === 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') continue
            const r = el.getBoundingClientRect()
            if (r.width === 0) continue
            if (r.right > vw + 1) {
              out.push({
                sel: `${el.tagName.toLowerCase()}.${String(el.className).split(/\s+/).slice(0, 2).join('.')}`,
                right: Math.round(r.right),
              })
            }
          }
          // One entry per distinct selector is enough to locate the cause.
          const seen = new Set<string>()
          return out.filter((o) => !seen.has(o.sel) && seen.add(o.sel)).slice(0, 4)
        }, width)

        for (const { sel, right } of over) {
          offenders.push(`${route} @${width}px — ${sel} reaches x=${right}`)
        }
      }
    }

    expect(
      offenders,
      [
        'An in-flow element renders past the viewport on a phone.',
        'This is usually a grid or flex item at its default `min-width: auto`',
        'with a `truncate`/`nowrap` descendant setting the floor — add `min-w-0`.',
        'Note that `document.scrollWidth` will NOT show this, because `main` is',
        '`overflow-x: clip`: the content is clipped and unreachable, not scrollable.',
        '',
        ...offenders,
      ].join('\n')
    ).toEqual([])
  })

  test('a hairline ends where the thing it divides ends', async ({ page }) => {
    // Five instances of one defect in one night, each found by a separate
    // measurement after the previous fix had verified itself:
    //   /blog rows            1152px rule over  606px of text  (546px past)
    //   Section dividers      144→1296 over content at x=176   ( 32px)
    //   FaqSection wrapper    1152px rule over  896px column   (128px per side)
    //   LedgerRow grid        1152px rule over  720px tracks   (432px)
    //   and its own wrapper   created by the fix above it      (432px)
    //
    // Each fix left the next instance standing, so this asserts the class.
    // A rule is an element with a top or bottom border and no side borders;
    // it must not extend more than 200px past its widest block-level child.
    // 200px because natural ragging in a flex-wrap list reached 131px and is
    // not a defect, while every real instance above was 432px or more.
    const TOLERANCE = 200

    // Rules that deliberately run past their content, with the reason.
    const ALLOWED: Array<{ match: string; reason: string }> = [
      {
        // hero-ask.tsx: a full-width rule above a single short link, there to
        // separate a navigating link from three suggested-question chips that
        // otherwise looked identical to it. Commented at the source.
        match: 'DIV.mt-2.border-t',
        reason: 'separates the ask link from the suggestion chips; deliberate and commented',
      },
    ]

    const ROUTES = [
      '/', '/blog', '/projects', '/garden', '/about',
      '/contact', '/lab', '/professional', '/work-with-me',
    ]
    const offenders: string[] = []

    for (const route of ROUTES) {
      await page.goto(route, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(400)

      const found = await page.evaluate((tolerance) => {
        const out: Array<{ sel: string; gap: number; child: string }> = []
        for (const el of Array.from(document.querySelectorAll<HTMLElement>('main *, footer *'))) {
          const cs = getComputedStyle(el)
          if (cs.position === 'fixed') continue

          const hasRule =
            (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopColor !== 'rgba(0, 0, 0, 0)') ||
            (parseFloat(cs.borderBottomWidth) > 0 && cs.borderBottomColor !== 'rgba(0, 0, 0, 0)')
          if (!hasRule) continue
          // A rule, not a box.
          if (parseFloat(cs.borderLeftWidth) > 0 || parseFloat(cs.borderRightWidth) > 0) continue

          // A wrap container's last line legitimately ends short — that is
          // ragging, not a mismatch between a rule and its content. Measured
          // on `/garden`'s link list: 131px at 1440 and 233px at the e2e
          // viewport, from the same correct layout. Every real instance of
          // this defect was a grid or a block.
          if (cs.display.includes('flex') && cs.flexWrap === 'wrap') continue

          const r = el.getBoundingClientRect()
          if (r.width < 400) continue

          // Compare against the widest BLOCK child that carries content. Ink
          // extent is the wrong instrument — a short value in a wide track is
          // not a defect, and measuring it that way flagged a deliberate rule.
          let childRight = 0
          let child = ''
          for (const c of Array.from(el.children)) {
            const ccs = getComputedStyle(c)
            if (ccs.display === 'inline' || ccs.display === 'none') continue
            if (!c.textContent?.trim() && !c.querySelector('img,svg')) continue
            const cb = c.getBoundingClientRect()
            if (cb.width === 0) continue
            if (cb.right > childRight) {
              childRight = cb.right
              child = `${c.tagName}.${String(c.className).split(/\s+/)[0]}`
            }
          }
          if (childRight === 0) continue

          const gap = Math.round(r.right - childRight)
          if (gap > tolerance) {
            out.push({
              sel: `${el.tagName}.${String(el.className).split(/\s+/).slice(0, 2).join('.')}`,
              gap,
              child,
            })
          }
        }
        const seen = new Set<string>()
        return out.filter((o) => !seen.has(o.sel) && seen.add(o.sel))
      }, TOLERANCE)

      for (const { sel, gap, child } of found) {
        if (ALLOWED.some((a) => sel.startsWith(a.match))) continue
        offenders.push(`${route} — ${sel} runs ${gap}px past ${child}`)
      }
    }

    expect(
      offenders,
      [
        'A hairline runs past the content it divides.',
        'Usually the measure cap sits on a child instead of on the element',
        'carrying the border — move it up, or cap the bordered box itself.',
        '',
        ...offenders,
      ].join('\n')
    ).toEqual([])
  })

  test('every scroll opt-out actually contains its scroll', async ({ page }) => {
    // `data-lenis-prevent` is half JS and half CSS. The JS half hands the wheel
    // back to the browser; the CSS half — `.lenis [data-lenis-prevent] {
    // overscroll-behavior: contain }` — stops a nested region from chaining
    // into the document when it reaches its end. That rule lives in the
    // package's own stylesheet, which shipped unimported: the attribute was on
    // six elements and DESIGN.md called the problem solved.
    //
    // So this asserts the *effect* rather than the attribute, which is the only
    // version that could have caught it. A regex sees the attribute present and
    // concludes the opt-out exists.
    const offenders: string[] = []

    // Each region needs the interaction that reveals it.
    const reveals: Array<{ route: string; open?: () => Promise<void>; label: string }> = [
      { route: '/chat', label: 'chat transcript' },
      { route: '/blog/building-rag-systems', label: 'essay contents rail' },
    ]

    for (const { route, label } of reveals) {
      await page.goto(route, { waitUntil: 'networkidle' })

      const found = await page.evaluate(() => {
        const out: Array<{ sel: string; behavior: string }> = []
        for (const el of Array.from(document.querySelectorAll<HTMLElement>('[data-lenis-prevent]'))) {
          if (getComputedStyle(el).display === 'none') continue
          out.push({
            sel: `${el.tagName.toLowerCase()}.${String(el.className).split(/\s+/)[0]}`,
            behavior: getComputedStyle(el).overscrollBehaviorY,
          })
        }
        return out
      })

      for (const { sel, behavior } of found) {
        if (behavior !== 'contain' && behavior !== 'none') {
          offenders.push(`${route} (${label}) ${sel} computes overscroll-behavior-y: ${behavior}`)
        }
      }
    }

    expect(
      offenders,
      [
        'A [data-lenis-prevent] region must contain its own scroll, not just intercept the wheel.',
        "If this fails with `auto`, the package's stylesheet is not imported.",
        '',
        ...offenders,
      ].join('\n')
    ).toEqual([])
  })

  test('every declared grid track is occupied', async ({ page }) => {
    const offenders: string[] = []

    for (const route of ROUTES) {
      await page.goto(route, { waitUntil: 'networkidle' })

      const bad = await page.evaluate(() => {
        const out: string[] = []
        for (const el of Array.from(document.querySelectorAll<HTMLElement>('*'))) {
          const style = getComputedStyle(el)
          if (style.display !== 'grid') continue
          const tracks = style.gridTemplateColumns.split(/\s+/).filter(Boolean)
          // Only explicit multi-track declarations. An auto-fill gallery grid
          // has as many tracks as it has items by definition.
          if (tracks.length < 2) continue
          if (!/px|rem|fr/.test(style.gridTemplateColumns)) continue
          const kids = Array.from(el.children).filter(
            (kid) => getComputedStyle(kid).display !== 'none'
          )
          // A declared `260px 1fr` with one child puts that child in the
          // 260px track. This is the essay-column bug, generalised.
          if (kids.length === 1 && tracks.length === 2) {
            out.push(
              `${el.tagName.toLowerCase()}.${String(el.className).split(/\s+/).slice(0, 2).join('.')} declares ${style.gridTemplateColumns} with 1 child`
            )
          }
        }
        return [...new Set(out)]
      })

      if (bad.length) offenders.push(`${route}: ${bad.join(' | ')}`)
    }

    expect(
      offenders,
      [
        'A two-track grid with one child puts that child in the first track.',
        'This is how every essay came to render 260px wide inside the contents rail.',
        '',
        ...offenders,
      ].join('\n')
    ).toEqual([])
  })
  test('one concept, one control: /blog has a single stage filter', async ({ page }) => {
    // /blog shipped two. The page header rendered `SEEDLING 23 BUDDING 49
    // EVERGREEN 12` selecting with forest ink and an underline, and `BlogGrid`
    // rendered its own `Stage · All · SEEDLING · …` 97px below it, selecting
    // with ink-versus-muted at 11.52px and carrying no counts. Same word, same
    // href, same concept, one screen, two answers — which teaches a reader
    // that neither is authoritative.
    //
    // A regex cannot see this: both navs were correct in isolation. Counting
    // the rendered controls is the only check that could have caught it, which
    // is why it belongs here and not in the drift suite.
    for (const url of ['/blog', '/blog?stage=seedling', '/blog?tag=attention&stage=budding']) {
      await page.goto(url)

      const stageNavs = await page
        .locator('nav[aria-label*="stage" i]')
        .evaluateAll((navs) => navs.filter((n) => (n as HTMLElement).offsetParent !== null).length)
      expect(stageNavs, `${url} should render exactly one stage filter`).toBe(1)

      // And it must say which option is chosen, in the filter itself.
      const current = await page
        .locator('nav[aria-label*="stage" i] [aria-current="page"]')
        .count()
      expect(current, `${url} should mark exactly one stage option current`).toBe(1)
    }
  })

  test('the stage vocabulary is printed, not only hovered', async ({ page }) => {
    // SEEDLING / BUDDING / EVERGREEN is the site's most distinctive editorial
    // idea, and its gloss lived only in a native `title=` attribute — which
    // does not exist on a touch device, where most readers arrive. A control
    // whose vocabulary cannot be learned is decoration.
    await page.goto('/blog')
    const body = await page.locator('main').innerText()
    for (const gloss of ['Rough notes', 'Developing', 'Considered finished']) {
      expect(body, `"${gloss}" should be printed on /blog`).toContain(gloss)
    }
  })
})
