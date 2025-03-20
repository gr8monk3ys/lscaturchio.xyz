import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// One representative URL per distinct template on the site. axe-core catches
// roughly a third of WCAG issues automatically; this is the regression guard
// the site previously lacked (color contrast, labels, landmarks, ARIA misuse).
const PAGES = [
  { name: 'home', path: '/' },
  { name: 'blog post', path: '/blog/building-rag-systems' },
  { name: 'chat', path: '/chat' },
  { name: 'contact', path: '/contact' },
]

test.describe('Accessibility (axe-core)', () => {
  for (const { name, path } of PAGES) {
    test(`${name} has no serious or critical WCAG violations`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' })

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      const blocking = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical'
      )

      // Surface actionable detail in CI output when this fails.
      if (blocking.length > 0) {
        console.log(
          `AXE_DETAIL ${path}:\n` +
            JSON.stringify(
              blocking.map((v) => ({
                id: v.id,
                impact: v.impact,
                help: v.help,
                nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
              })),
              null,
              2
            )
        )
      }

      expect(blocking).toEqual([])
    })
  }

  test('homepage exposes a single, visible h1 (not an sr-only stand-in)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    const h1 = page.locator('h1')
    await expect(h1).toHaveCount(1)
    await expect(h1).not.toHaveClass(/sr-only/)
    await expect(h1).toContainText('Lorenzo Scaturchio')
  })
})
