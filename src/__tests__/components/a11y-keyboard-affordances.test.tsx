import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';

import { CommandPaletteDialog } from '@/components/ui/command-palette/command-palette-dialog';
import type { CommandGroups, CommandItem } from '@/components/ui/command-palette/types';
import { MobileNavbar } from '@/components/ui/mobile-navbar';

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
}));

function makeCommand(id: string, title: string): CommandItem {
  return {
    id,
    title,
    icon: <span aria-hidden>*</span>,
    category: 'navigation',
    action: vi.fn(),
  };
}

function renderDialog(selectedIndex: number) {
  const grouped: CommandGroups = {
    navigation: [makeCommand('a', 'Home'), makeCommand('b', 'Blog')],
    blog: [],
    action: [],
  };

  return render(
    <CommandPaletteDialog
      commandCount={2}
      groupedCommands={grouped}
      inputRef={createRef<HTMLInputElement>()}
      isSearching={false}
      listRef={createRef<HTMLDivElement>()}
      onChangeQuery={vi.fn()}
      onClearQuery={vi.fn()}
      onClose={vi.fn()}
      onHoverIndex={vi.fn()}
      onSelectCommand={vi.fn()}
      query=""
      selectedIndex={selectedIndex}
    />
  );
}

describe('command palette dialog announces its selection', () => {
  it('points aria-activedescendant at the selected option', () => {
    const { unmount } = renderDialog(0);

    const input = screen.getByRole('combobox');
    const listbox = screen.getByRole('listbox');
    const options = within(listbox).getAllByRole('option');

    expect(input).toHaveAttribute('aria-controls', listbox.id);
    expect(input.getAttribute('aria-activedescendant')).toBe(options[0].id);
    expect(options[0].id).toBeTruthy();
    expect(options[0]).toHaveAttribute('aria-selected', 'true');

    unmount();

    renderDialog(1);
    const movedInput = screen.getByRole('combobox');
    const movedOptions = within(screen.getByRole('listbox')).getAllByRole('option');
    expect(movedInput.getAttribute('aria-activedescendant')).toBe(movedOptions[1].id);
    expect(movedOptions[1]).toHaveAttribute('aria-selected', 'true');
  });
});

describe('mobile navbar keyboard affordances', () => {
  it('exposes disclosure state on the category buttons', () => {
    render(<MobileNavbar />);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle menu' }));

    const nav = screen.getByRole('navigation', { name: 'Mobile' });
    const disclosures = within(nav)
      .getAllByRole('button')
      .filter((button) => button.hasAttribute('aria-controls'));

    expect(disclosures.length).toBeGreaterThan(0);
    for (const button of disclosures) {
      expect(button).toHaveAttribute('aria-expanded', 'false');
    }

    const first = disclosures[0];
    fireEvent.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'true');
    const panelId = first.getAttribute('aria-controls') as string;
    expect(document.getElementById(panelId)).not.toBeNull();
  });

  it('closes on Escape and returns focus to the toggle', () => {
    render(<MobileNavbar />);
    const toggle = screen.getByRole('button', { name: 'Toggle menu' });
    fireEvent.click(toggle);

    expect(screen.getByRole('navigation', { name: 'Mobile' })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('navigation', { name: 'Mobile' })).toBeNull();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(toggle);
  });
});
