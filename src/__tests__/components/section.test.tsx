import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Section } from '@/components/ui/Section';

describe('Section', () => {
  it('renders its children', () => {
    render(<Section><p>hello</p></Section>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('applies the size container class', () => {
    const { container } = render(<Section size="narrow"><span>x</span></Section>);
    expect(container.querySelector('.max-w-3xl')).not.toBeNull();
  });

  it('renders top and bottom dividers when requested', () => {
    const { container } = render(
      <Section divider topDivider><span>x</span></Section>
    );
    // Two hairline divider elements (top + bottom).
    expect(container.querySelectorAll('.bg-border\\/70').length).toBe(2);
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
