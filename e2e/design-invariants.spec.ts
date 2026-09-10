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
