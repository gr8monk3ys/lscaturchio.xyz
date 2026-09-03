import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  LedgerChips,
  LedgerHead,
  LedgerRows,
  LedgerSection,
  ordinal,
} from '@/components/ui/ledger-section';

describe('LedgerSection', () => {
  it('renders the head and the entries', () => {
    render(
      <LedgerSection head={<span>Rail placard</span>}>
        <ul>
          <li>An entry</li>
        </ul>
      </LedgerSection>
    );
    expect(screen.getByText('Rail placard')).toBeInTheDocument();
    expect(screen.getByText('An entry')).toBeInTheDocument();
  });

  it('owns the sticky two-column grid so callers do not restate it', () => {
    const { container } = render(<LedgerSection head={<span>Head</span>}>{null}</LedgerSection>);
    const grid = container.querySelector('.lg\\:grid-cols-\\[minmax\\(280px\\,360px\\)_1fr\\]');
    expect(grid).not.toBeNull();
    expect(grid?.querySelector('.lg\\:sticky.lg\\:top-28')).not.toBeNull();
  });
});

describe('LedgerHead', () => {
  it('renders a catalogue kicker from index + eyebrow, the title and the blurb', () => {
    render(<LedgerHead index="01" eyebrow="What I think" title="Mostly arguments." description="Eighty-three essays." />);
    expect(screen.getByText('01 — What I think')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Mostly arguments.' })).toBeInTheDocument();
    expect(screen.getByText('Eighty-three essays.')).toBeInTheDocument();
  });

  it('omits the gallery rule that SectionHeader draws', () => {
    const { container } = render(<LedgerHead index="03" eyebrow="Who I am" title="The rest of it." />);
    expect(container.querySelector('hr.gallery-rule')).toBeNull();
  });
});

describe('LedgerRows', () => {
  const items = ['first', 'second', 'third'];

  it('renders rows in order', () => {
    const { container } = render(
      <LedgerRows items={items}>{(item) => <li key={item}>{item}</li>}</LedgerRows>
    );
    expect([...container.querySelectorAll('li')].map((li) => li.textContent)).toEqual([
      'first',
      'second',
      'third',
    ]);
  });

  it('numbers the rows and uses an ordered list when asked', () => {
    const { container } = render(
      <LedgerRows items={items} numbered>
        {(item, entryNumber) => (
          <li key={item}>
            <span data-testid={`n-${item}`}>{entryNumber}</span>
            {item}
          </li>
        )}
      </LedgerRows>
    );
    expect(container.querySelector('ol')).not.toBeNull();
    expect(screen.getByTestId('n-first')).toHaveTextContent('01');
    expect(screen.getByTestId('n-third')).toHaveTextContent('03');
  });

  it('gives rows no number and an unordered list when not asked', () => {
    const { container } = render(
      <LedgerRows items={items}>
        {(item, entryNumber) => (
          <li key={item}>
            <span data-testid={`n-${item}`}>{entryNumber}</span>
            {item}
          </li>
        )}
      </LedgerRows>
    );
    expect(container.querySelector('ul')).not.toBeNull();
    expect(container.querySelector('ol')).toBeNull();
    expect(screen.getByTestId('n-first')).toHaveTextContent('');
  });

  it('formats catalogue numbers as zero-padded 1-based ordinals', () => {
    expect(ordinal(0)).toBe('01');
    expect(ordinal(9)).toBe('10');
  });
});

describe('LedgerChips', () => {
  it('separates chips with an interpunct, except after the last one', () => {
    const { container } = render(<LedgerChips items={['49 tests', 'Never arms auto-merge']} />);
    const chips = [...container.querySelectorAll('li')];
    expect(chips.map((li) => li.textContent)).toEqual(['49 tests·', 'Never arms auto-merge']);
    expect(chips[0]?.querySelector('span')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps the separator between comma-containing phrases', () => {
    const { container } = render(
      <LedgerChips items={['Scope, approach, delivery', 'Evals, then rollout']} />
    );
    expect(container.textContent).toBe('Scope, approach, delivery·Evals, then rollout');
  });
});
