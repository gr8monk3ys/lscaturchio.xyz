import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AssumedAudience } from '@/components/blog/assumed-audience';
import { useMDXComponents } from '../../../mdx-components';

describe('AssumedAudience', () => {
  it('renders its content as a top-of-essay note with a wall-label', () => {
    render(<AssumedAudience>People who already use RAG.</AssumedAudience>);
    const note = screen.getByRole('note');
    expect(note).toHaveTextContent('People who already use RAG.');
    expect(note).toHaveTextContent(/assumed audience/i);
    // Opts out of prose typography; uses the hairline-rule register like Sidenote.
    expect(note.className).toContain('not-prose');
    expect(note.className).toContain('border-l-2');
  });

  it('exposes an accessible name so screen readers can distinguish it', () => {
    render(<AssumedAudience>x</AssumedAudience>);
    expect(screen.getByRole('note')).toHaveAccessibleName('Assumed audience');
  });

  it('is registered as an MDX component so essays can use <AssumedAudience>', () => {
    const components = useMDXComponents({});
    expect(components.AssumedAudience).toBe(AssumedAudience);
  });
});
