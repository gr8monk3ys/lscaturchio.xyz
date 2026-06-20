import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidenote } from '@/components/blog/sidenote';
import { useMDXComponents } from '../../../mdx-components';

describe('Sidenote', () => {
  it('renders its content as a marginalia note', () => {
    render(<Sidenote>A caveat in the margin.</Sidenote>);
    const note = screen.getByRole('note');
    expect(note).toHaveTextContent('A caveat in the margin.');
    // Opts out of prose typography and uses the hairline-rule marginalia style.
    expect(note.className).toContain('not-prose');
    expect(note.className).toContain('border-l-2');
  });

  it('floats into the margin on wide screens', () => {
    render(<Sidenote>x</Sidenote>);
    expect(screen.getByRole('note').className).toContain('lg:float-right');
  });

  it('exposes an accessible name so screen readers can distinguish it', () => {
    render(<Sidenote>A caveat in the margin.</Sidenote>);
    expect(screen.getByRole('note')).toHaveAccessibleName('Sidenote');
  });

  it('is registered as an MDX component so essays can use <Sidenote>', () => {
    const components = useMDXComponents({});
    expect(components.Sidenote).toBe(Sidenote);
  });
});
