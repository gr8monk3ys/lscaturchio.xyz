import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PublishResult } from '@/components/admin/publish-result';

describe('PublishResult', () => {
  it('renders nothing when idle', () => {
    const { container } = render(<PublishResult result={{ state: 'idle' }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows a saving indicator', () => {
    render(<PublishResult result={{ state: 'saving' }} />);
    expect(screen.getByText(/Publishing/)).toBeInTheDocument();
  });

  it('shows the error message verbatim', () => {
    render(
      <PublishResult result={{ state: 'error', message: 'GitHub said no\n(409)' }} />
    );
    expect(screen.getByText(/GitHub said no/)).toBeInTheDocument();
  });

  it('links the commit, and the page only when a viewPath exists', () => {
    const { rerender } = render(
      <PublishResult
        result={{ state: 'done', commitUrl: 'https://github.com/x/y/commit/abc' }}
      />
    );
    expect(screen.getByRole('link', { name: 'View commit' })).toHaveAttribute(
      'href',
      'https://github.com/x/y/commit/abc'
    );
    expect(screen.queryByRole('link', { name: 'View page' })).toBeNull();

    rerender(
      <PublishResult
        result={{
          state: 'done',
          commitUrl: 'https://github.com/x/y/commit/abc',
          viewPath: '/blog/new-post',
        }}
      />
    );
    expect(screen.getByRole('link', { name: 'View page' })).toHaveAttribute(
      'href',
      '/blog/new-post'
    );
  });
});
