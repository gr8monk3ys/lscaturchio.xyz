import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Navbar } from '@/components/ui/navbar';
import { primaryNavigation } from '@/constants/navlinks';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}));

vi.mock('@/components/ui/navbar-controls-gate', () => ({
  NavbarControlsGate: () => <div data-testid="navbar-controls" />,
}));

describe('Navbar', () => {
  it('renders exactly the primary links, no dropdown buttons', () => {
    render(<Navbar />);
    for (const item of primaryNavigation) {
      expect(screen.getByRole('link', { name: item.name })).toHaveAttribute(
        'href',
        item.href
      );
    }
    // The old mega-menu exposed dropdown trigger buttons; the slim nav has none.
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('keeps the primary nav landmark', () => {
    render(<Navbar />);
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
  });
});
