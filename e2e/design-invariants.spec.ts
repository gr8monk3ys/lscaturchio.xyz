import { test, expect } from '@playwright/test'

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
      // Only links inside a <nav>: the surfaces that NAME a destination.
      // Unscoped, this counted prose calls to action as names — "Read
      // everything →" pointing at /blog, "Discuss a similar build →" at
      // /contact — which is good copy, not a collision.
      const links = await page.locator('nav a[href^="/"]').evaluateAll((nodes) =>
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

    const firstStage = stageFilter.getByRole('link').first()
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

    const required = [
      { name: 'search trigger', pattern: />Search</ },
      { name: 'theme toggle', pattern: /aria-label="Toggle theme"/ },
      { name: 'ask trigger', pattern: /Ask this site/ },
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
})
