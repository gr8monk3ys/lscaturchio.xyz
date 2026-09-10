import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BlogSidebar } from '@/components/blog/blog-sidebar';

/**
 * The rail's headings come from a DOM scan in an effect, so on first paint
 * there are none. It used to return null in that state, which left the parent
 * `xl:grid-cols-[260px_1fr]` with exactly one child — and CSS grid puts a lone
 * child in the *first* track. Every essay rendered 260px wide inside the
 * rail's column and then jumped into `1fr` when this mounted.
 *
 * Lighthouse measured 0.2629 cumulative layout shift on the essay route
 * against a 0.15 budget, deterministic across three runs, and attributed
 * 0.2573 of it to the prose column. Holding the cell brought it to 0.0027.
 *
 * `e2e/layout-shift.spec.ts` guards the number; this guards the cause, in a
 * test that runs without a browser.
 */
describe('BlogSidebar', () => {
  it('holds its grid cell before any heading is found', () => {
    // No `.prose-gallery` and no `<article>` in this tree, so the effect finds
    // no root and the heading list stays empty — first-paint conditions.
    render(<BlogSidebar slug="whatever" />);

    const rail = screen.getByLabelText('Article sidebar');
    expect(rail).toBeInTheDocument();
    expect(rail.tagName).toBe('ASIDE');
  });

  it('draws no border until it has contents', () => {
    render(<BlogSidebar slug="whatever" />);

    // An empty cell must be invisible, or the fix trades a shift for a stray
    // 260px box on every essay.
    const rail = screen.getByLabelText('Article sidebar');
    expect(rail.querySelector('nav')).toBeNull();
    expect(rail.className).not.toMatch(/\bborder\b/);
  });
});
