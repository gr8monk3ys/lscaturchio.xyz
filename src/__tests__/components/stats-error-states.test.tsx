import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import type { ReactElement } from 'react';

// The stats widgets read through fetchJson; a rejection here is the "endpoint
// did not answer" case these tests exist to pin down.
vi.mock('@/lib/fetcher', async () => {
  const actual = await vi.importActual<typeof import('@/lib/fetcher')>('@/lib/fetcher');
  return { ...actual, fetchJson: vi.fn() };
});

import { fetchJson } from '@/lib/fetcher';
import { StatsOverview } from '@/components/stats/stats-overview';
import { VisitorChart } from '@/components/stats/visitor-chart';
import { PopularPosts } from '@/components/stats/popular-posts';
import type { OverviewData } from '@/lib/stats-data';

const serverOverview: OverviewData = {
  totalViews: { value: 1234, available: true },
  totalPosts: { value: 42, available: true },
  newsletterSubscribers: { value: 7, available: true },
  avgReadTime: { value: 6, available: true },
};

const serverViews = {
  success: true as const,
  data: {
    available: true,
    total: 1,
    views: [{ slug: 'first-post', title: 'First Post', views: 1234 }],
  },
};

// SWR's cache is module-global; each render gets its own so one test's data
// cannot satisfy the next test's hook.
function renderIsolated(ui: ReactElement) {
  return render(<SWRConfig value={{ provider: () => new Map() }}>{ui}</SWRConfig>);
}

describe('stats widgets', () => {
  beforeEach(() => {
    vi.mocked(fetchJson).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('server-rendered fallback data', () => {
    it('StatsOverview paints real numbers with no skeleton', () => {
      vi.mocked(fetchJson).mockImplementation(() => new Promise(() => {}));
      const { container } = renderIsolated(<StatsOverview fallbackData={serverOverview} />);

      expect(screen.getByText('1,234')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(container.querySelector('.animate-pulse')).toBeNull();
    });

    it('VisitorChart ranks posts with no skeleton even while the fetch hangs', () => {
      vi.mocked(fetchJson).mockImplementation(() => new Promise(() => {}));
      const { container } = renderIsolated(<VisitorChart fallbackData={serverViews} />);

      expect(screen.getByText('First Post')).toBeInTheDocument();
      expect(container.querySelector('.animate-pulse')).toBeNull();
    });

    it('PopularPosts lists posts with no skeleton even while the fetch hangs', () => {
      vi.mocked(fetchJson).mockImplementation(() => new Promise(() => {}));
      const { container } = renderIsolated(<PopularPosts fallbackData={serverViews} />);

      expect(screen.getByText('First Post')).toBeInTheDocument();
      expect(container.querySelector('.animate-pulse')).toBeNull();
    });
  });

  describe('error states when there is no server fallback', () => {
    it('StatsOverview explains the failure instead of holding a skeleton', async () => {
      vi.mocked(fetchJson).mockRejectedValue(new Error('Failed to fetch'));
      const { container } = renderIsolated(<StatsOverview />);

      await waitFor(() => {
        expect(
          screen.getByText(/The metrics endpoint did not answer/)
        ).toBeInTheDocument();
      });
      expect(container.querySelector('.animate-pulse')).toBeNull();
    });

    it('VisitorChart explains the failure instead of holding a skeleton', async () => {
      vi.mocked(fetchJson).mockRejectedValue(new Error('Failed to fetch'));
      const { container } = renderIsolated(<VisitorChart />);

      await waitFor(() => {
        expect(
          screen.getByText(/The view-count endpoint did not answer/)
        ).toBeInTheDocument();
      });
      expect(container.querySelector('.animate-pulse')).toBeNull();
    });

    it('PopularPosts explains the failure in the site voice, not the raw fetch error', async () => {
      vi.mocked(fetchJson).mockRejectedValue(new Error('Failed to fetch'));
      renderIsolated(<PopularPosts />);

      await waitFor(() => {
        expect(
          screen.getByText(/The view-count endpoint did not answer/)
        ).toBeInTheDocument();
      });
      expect(screen.queryByText('Failed to fetch')).toBeNull();
    });
  });

  describe('partial source failures', () => {
    it('StatsOverview labels only the dead sources and keeps the live ones', async () => {
      vi.mocked(fetchJson).mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);
        if (url === '/api/blog-stats') return Promise.reject(new Error('500'));
        if (url === '/api/views?format=detailed') {
          return Promise.resolve({
            success: true,
            data: { available: true, total: 2, views: [{ views: 20 }, { views: 5 }] },
          }) as never;
        }
        return Promise.resolve({
          success: true,
          data: { activeSubscribers: 9, available: true },
        }) as never;
      });

      renderIsolated(<StatsOverview />);

      await waitFor(() => {
        expect(screen.getByText('25')).toBeInTheDocument();
      });
      expect(screen.getByText('9')).toBeInTheDocument();
      // Blog metadata died, so both cards it feeds read Unavailable — each
      // card shows the word twice: once as the value, once as the status line.
      expect(screen.getAllByText('Unavailable')).toHaveLength(4);
      expect(
        screen.getByText(/labels it instead of estimating/)
      ).toBeInTheDocument();
    });

    it('StatsOverview reports a source that answered but has nothing public to show', async () => {
      vi.mocked(fetchJson).mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);
        if (url === '/api/blog-stats') {
          return Promise.resolve({
            success: true,
            data: { totalPosts: 3, avgReadingTime: 4 },
          }) as never;
        }
        if (url === '/api/views?format=detailed') {
          return Promise.resolve({
            success: true,
            data: { available: false, total: 0, views: [], message: 'View data is private.' },
          }) as never;
        }
        return Promise.resolve({
          success: true,
          data: {
            activeSubscribers: null,
            available: false,
            message: 'Subscriber counts are private.',
          },
        }) as never;
      });

      renderIsolated(<StatsOverview />);

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument();
      });
      expect(screen.getByText('4 min')).toBeInTheDocument();
      expect(screen.getAllByText('Unavailable')).toHaveLength(4);
    });
  });
});
