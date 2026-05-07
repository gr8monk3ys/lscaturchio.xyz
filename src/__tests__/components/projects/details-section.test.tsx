import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DetailsSection } from '@/components/projects/product-sections';

describe('DetailsSection', () => {
  it('renders each entry in details as a paragraph', () => {
    render(<DetailsSection details={['First paragraph.', 'Second paragraph.']} />);
    expect(screen.getByText('First paragraph.')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph.')).toBeInTheDocument();
  });

  it('returns null when details is undefined', () => {
    const { container } = render(<DetailsSection details={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when details is an empty array', () => {
    const { container } = render(<DetailsSection details={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('preserves order of paragraphs in DOM', () => {
    render(<DetailsSection details={['Alpha.', 'Bravo.', 'Charlie.']} />);
    const paragraphs = screen.getAllByText(/^(Alpha|Bravo|Charlie)\.$/);
    expect(paragraphs.map((el) => el.textContent)).toEqual([
      'Alpha.',
      'Bravo.',
      'Charlie.',
    ]);
  });
});
