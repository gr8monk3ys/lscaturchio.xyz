import { test, expect } from '@playwright/test'

/**
 * Cumulative layout shift, measured rather than assumed.
 *
 * The Lighthouse job already asserts a 0.15 budget, but it runs after Build
 * and reports one number for a whole page, which took a while to trace back to
 * a single Suspense fallback. This measures the same thing per route, names
 * the elements that moved, and runs in the E2E job where a regression is cheap
 * to attribute.
 *
 * The defect it exists for: `app/blog/loading.tsx` covers the blog segment and
 * every route nested under it, so all 83 essays opened on the *index*
 * skeleton — a six-card grid — and then replaced it with a single prose
 * column. That measured 0.26. The two navbar Suspense fallbacks were wrong in
 * both directions at once: 64px reserved for an 80px desktop spacer, and 64px
 * reserved for a mobile navbar that is `fixed` and occupies nothing.
 */

/** Google's "good" threshold. The Lighthouse budget is the looser 0.15. */
const CLS_BUDGET = 0.1

/**
 * Several essays, not one.
 *
 * The Lighthouse budget tests `building-rag-systems`, and so did this spec.
 * A measurement across six essays found four at 0.115–0.119 — forty times the
 * number the gate reports — and the two clean ones were the two the gates
 * happened to test. The variable was whether the header's meta row already
 * wrapped: the view counter grew from a 45px placeholder to ~101px, which
 * flips the row between one and two lines on essays where it nearly fits.
 *
 * A guard that samples one member of a population of 84 is a guard aimed at a
 * sample, and this is the cost of that. These four were the observed
 * offenders; `building-rag-systems` stays as the previously-clean control.
 */
const ESSAYS = [
  'building-rag-systems',
  'against-optimization',
  'algorithmic-culture',
  'abolition-isnt-what-you-think',
  'actual-reformation',
]

const ROUTES = [
  { name: 'home', path: '/' },
  { name: 'blog index', path: '/blog' },
  ...ESSAYS.map((slug) => ({ name: `essay: ${slug}`, path: `/blog/${slug}` })),
]

async function measureCls(page: import('@playwright/test').Page, path: string) {
  await page.goto(path, { waitUntil: 'networkidle' })

  return page.evaluate(async () => {
    const shifts: Array<{ value: number; sources: string[] }> = []

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<
        PerformanceEntry & {
          value: number
          hadRecentInput: boolean
          sources?: Array<{ node?: Element }>
        }
      >) {
        if (entry.hadRecentInput) continue
        shifts.push({
          value: entry.value,
          sources: (entry.sources ?? [])
            .map((source) => {
              const node = source.node
              if (!node) return 'unknown'
              const cls = typeof node.className === 'string' ? node.className : ''
              return `${node.tagName}${node.id ? `#${node.id}` : ''}.${cls.split(/\s+/).slice(0, 3).join('.')}`
            })
            .slice(0, 3),
        })
      }
    })

    // `buffered` replays the shifts that already happened during load, which
    // is the whole window that matters here.
    observer.observe({ type: 'layout-shift', buffered: true })
    await new Promise((resolve) => setTimeout(resolve, 2500))
    observer.disconnect()

    return {
      total: shifts.reduce((sum, shift) => sum + shift.value, 0),
      worst: shifts.sort((a, b) => b.value - a.value).slice(0, 3),
    }
  })
}

test.describe('cumulative layout shift', () => {
  for (const route of ROUTES) {
    test(`${route.name} settles under the budget`, async ({ page }) => {
      const { total, worst } = await measureCls(page, route.path)

      expect(
        total,
        [
          `${route.path} shifted ${total.toFixed(4)} (budget ${CLS_BUDGET}).`,
          'Largest contributors:',
          ...worst.map((shift) => `  ${shift.value.toFixed(4)} — ${shift.sources.join(', ')}`),
        ].join('\n')
      ).toBeLessThan(CLS_BUDGET)
    })
  }
})
