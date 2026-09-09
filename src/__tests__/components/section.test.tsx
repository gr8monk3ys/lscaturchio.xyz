import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Section } from '@/components/ui/Section';
import { PAGE_WIDTHS } from '@/lib/page-width';

describe('Section', () => {
  it('renders its children', () => {
    render(<Section><p>hello</p></Section>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  // Asserted against the shared scale, not a hardcoded class. The previous
  // version pinned `.max-w-3xl` and so silently encoded a width DESIGN.md
  // never specified.
  it.each(Object.entries(PAGE_WIDTHS))('applies the %s width class', (size, cls) => {
    const { container } = render(
      <Section size={size as keyof typeof PAGE_WIDTHS}><span>x</span></Section>
    );
    expect(container.querySelector(`.${cls}`)).not.toBeNull();
  });

  it('defaults to the medium width', () => {
    const { container } = render(<Section><span>x</span></Section>);
    expect(container.querySelector(`.${PAGE_WIDTHS.medium}`)).not.toBeNull();
  });

  it('renders top and bottom dividers when requested', () => {
    const { container } = render(
      <Section divider topDivider><span>x</span></Section>
    );
    // Two full-width hairlines (top + bottom). Asserted on `bg-border`, the
    // token, rather than the old `bg-border/70` partial-width ornament.
    const rules = container.querySelectorAll('.bg-border');
    expect(rules.length).toBe(2);
    for (const rule of rules) {
      expect(rule).toHaveClass('inset-x-0');
    }
  });

  it('renders no dividers unless asked', () => {
    const { container } = render(<Section><span>x</span></Section>);
    expect(container.querySelectorAll('.bg-border\\/70').length).toBe(0);
  });

  it('never mounts its content hidden', () => {
    const { container } = render(<Section><p>readable</p></Section>);
    // The motion doctrine is that the page does not animate itself in, so no
    // wrapper may start hidden and no observer may gate the content.
    expect(container.querySelector('[data-reveal-state]')).toBeNull();
    expect(screen.getByText('readable')).toBeVisible();
  });
});
