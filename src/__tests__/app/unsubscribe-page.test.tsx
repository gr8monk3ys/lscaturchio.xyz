import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mail security scanners (Outlook Safe Links, Gmail's link checks) open every
// link in a message with a GET. If loading /unsubscribe?token=… performed the
// unsubscribe, subscribers were removed without ever clicking. The page may
// read the subscription; only the reader's explicit POST may change it.

const queries: string[] = [];
const rows: { current: Array<{ is_active: boolean }> } = { current: [] };

vi.mock('@/lib/db', () => ({
  getDb: () =>
    async (strings: TemplateStringsArray) => {
      queries.push(strings.join('?'));
      return rows.current;
    },
}));

vi.mock('@/lib/logger', () => ({ logError: vi.fn() }));

import UnsubscribePage from '@/app/unsubscribe/page';

async function renderStatus(token: string) {
  const element = await UnsubscribePage({ searchParams: Promise.resolve({ token }) });
  return element.props as { status: string; message: string; token?: string };
}

describe('/unsubscribe page', () => {
  beforeEach(() => {
    queries.length = 0;
  });

  it('asks an active subscriber to confirm instead of unsubscribing on load', async () => {
    rows.current = [{ is_active: true }];

    const props = await renderStatus('tok-123');

    expect(props.status).toBe('confirm');
    expect(props.token).toBe('tok-123');
    expect(queries.some((q) => /UPDATE/i.test(q))).toBe(false);
  });

  it('reports an already-inactive subscription without writing', async () => {
    rows.current = [{ is_active: false }];

    const props = await renderStatus('tok-123');

    expect(props.status).toBe('success');
    expect(props.message).toBe('Already unsubscribed');
    expect(queries.some((q) => /UPDATE/i.test(q))).toBe(false);
  });

  it('reports an unknown token as an error', async () => {
    rows.current = [];

    const props = await renderStatus('nope');

    expect(props.status).toBe('error');
  });
});
