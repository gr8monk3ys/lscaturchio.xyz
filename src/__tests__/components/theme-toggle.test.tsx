import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const themeMocks = vi.hoisted(() => ({
  theme: 'light',
  setTheme: vi.fn(),
}));

// `resolvedTheme` is what the component reads: it is the value actually
// applied, so a user on "system" toggles from what they can see rather than
// from the literal string "system".
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: themeMocks.theme,
    resolvedTheme: themeMocks.theme,
    setTheme: themeMocks.setTheme,
  }),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    themeMocks.theme = 'light';
    themeMocks.setTheme.mockClear();
  });

  it('renders a button with an accessible name on the first paint', () => {
    render(<ThemeToggle />);
    expect(
      screen.getByRole('button', { name: 'Toggle theme' })
    ).toBeInTheDocument();
  });

  it('switches to dark when the current theme is light', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle theme' }));
    expect(themeMocks.setTheme).toHaveBeenCalledTimes(1);
    expect(themeMocks.setTheme).toHaveBeenCalledWith('dark');
  });

  it('switches to light when the current theme is dark', () => {
    themeMocks.theme = 'dark';
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle theme' }));
    expect(themeMocks.setTheme).toHaveBeenCalledTimes(1);
    expect(themeMocks.setTheme).toHaveBeenCalledWith('light');
  });

  it('cycles back and forth across clicks', () => {
    const { unmount } = render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle theme' }));
    expect(themeMocks.setTheme).toHaveBeenLastCalledWith('dark');
    unmount();

    themeMocks.theme = 'dark';
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle theme' }));
    expect(themeMocks.setTheme).toHaveBeenLastCalledWith('light');
  });
});
