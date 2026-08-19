import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorPage } from '@/components/ui/error-page';
import { logError } from '@/lib/logger';

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
}));

describe('ErrorPage', () => {
  const error = Object.assign(new Error('boom'), { digest: 'abc123' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs the error once on mount with its digest', () => {
    render(<ErrorPage error={error} reset={() => {}} title="Blog failed" />);
    expect(logError).toHaveBeenCalledWith('Blog failed', error, { digest: 'abc123' });
  });

  it('renders default copy when no overrides are given', () => {
    render(<ErrorPage error={error} reset={() => {}} />);
    expect(
      screen.getByRole('heading', { name: 'Something went wrong' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go home' })).toHaveAttribute('href', '/');
  });

  it('calls reset when "Try again" is clicked', async () => {
    const reset = vi.fn();
    render(<ErrorPage error={error} reset={reset} />);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(reset).toHaveBeenCalledOnce();
  });

  it('hides raw error details outside development', () => {
    render(<ErrorPage error={error} reset={() => {}} />);
    expect(screen.queryByText('boom')).toBeNull();
    expect(screen.queryByText(/Digest:/)).toBeNull();
  });
});
