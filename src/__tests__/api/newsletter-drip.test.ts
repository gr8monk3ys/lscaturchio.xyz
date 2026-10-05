import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockSql = vi.fn();

vi.mock('@/lib/rate-limit', () => ({ withRateLimit: <T>(handler: T) => handler }));

vi.mock('@/lib/api-auth', () => ({
  validateApiKey: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  getDb: vi.fn(() => mockSql),
  isDatabaseConfigured: vi.fn(() => true),
}));

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

import { POST } from '@/app/api/newsletter/drip/route';
import { validateApiKey } from '@/lib/api-auth';
import { installMailTransport } from '@/lib/mail/deliver';
import { createOutbox } from '@/lib/mail/outbox';

// The mailer: an in-memory outbox in place of Resend.
const outbox = createOutbox();
let restoreTransport: () => void;
beforeAll(() => {
  restoreTransport = installMailTransport(outbox);
});
afterAll(() => restoreTransport());

function createRequest(search = ''): NextRequest {
  return new NextRequest(`http://localhost:3000/api/newsletter/drip${search}`, {
    method: 'POST',
    headers: {
      'x-api-key': 'test-key',
    },
  });
}

describe('/api/newsletter/drip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSql.mockReset();
    vi.mocked(validateApiKey).mockReturnValue(null);
    outbox.clear();
  });

  it('returns auth error when API key validation fails', async () => {
    vi.mocked(validateApiKey).mockReturnValue({ status: 401, error: 'Unauthorized' });

    const response = await POST(createRequest());
    expect(response.status).toBe(401);
    expect(mockSql).not.toHaveBeenCalled();
  });

  it('supports dry-run without claiming or sending emails', async () => {
    mockSql.mockResolvedValueOnce([
      {
        email: 'user@example.com',
        unsubscribe_token: 'token-123',
        metadata: {
          topics: ['rag-llms'],
          onboarding: {
            step: 0,
            nextAt: '2026-03-01T00:00:00.000Z',
          },
        },
      },
    ]);

    const response = await POST(createRequest('?dryRun=true'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual({
      processed: 1,
      sent: 1,
      failed: 0,
      skipped: 0,
      dryRun: true,
    });
    expect(outbox.sent).toHaveLength(0);
    expect(mockSql).toHaveBeenCalledTimes(1);
  });

  it('claims a subscriber before sending and finalizes onboarding after success', async () => {
    mockSql
      .mockResolvedValueOnce([
        {
          email: 'user@example.com',
          unsubscribe_token: 'token-123',
          metadata: {
            topics: ['rag-llms'],
            onboarding: {
              step: 0,
              nextAt: '2026-03-01T00:00:00.000Z',
            },
          },
        },
      ])
      .mockResolvedValueOnce([{ email: 'user@example.com' }])
      .mockResolvedValueOnce([]);

    const response = await POST(createRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual({
      processed: 1,
      sent: 1,
      failed: 0,
      skipped: 0,
      dryRun: false,
    });
    expect(outbox.sent).toHaveLength(1);
    expect(outbox.sent[0]).toMatchObject({
      to: 'user@example.com',
      subject: 'Start here: a quick path through the site',
    });
    expect(outbox.sent[0].html).toContain('/unsubscribe?token=token-123');
    expect(outbox.sent[0].html).toContain('/topics/rag-llms');
    expect(mockSql).toHaveBeenCalledTimes(3);

    const claimPayload = JSON.parse(mockSql.mock.calls[1][1] as string);
    expect(claimPayload.step).toBe(0);
    expect(claimPayload.processingAt).toBeTypeOf('string');

    const finalizePayload = JSON.parse(mockSql.mock.calls[2][1] as string);
    expect(finalizePayload.step).toBe(1);
    expect(finalizePayload.lastSentAt).toBeTypeOf('string');
    expect(finalizePayload.processingAt).toBeNull();
  });

  it('releases the claim when sending fails', async () => {
    mockSql
      .mockResolvedValueOnce([
        {
          email: 'user@example.com',
          unsubscribe_token: 'token-123',
          metadata: {
            topics: ['rag-llms'],
            onboarding: {
              step: 0,
              nextAt: '2026-03-01T00:00:00.000Z',
            },
          },
        },
      ])
      .mockResolvedValueOnce([{ email: 'user@example.com' }])
      .mockResolvedValueOnce([]);
    outbox.respondWith({ status: 'failed', reason: 'Resend API error' });

    const response = await POST(createRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual({
      processed: 1,
      sent: 0,
      failed: 1,
      skipped: 0,
      dryRun: false,
    });
    expect(mockSql).toHaveBeenCalledTimes(3);

    const releasePayload = JSON.parse(mockSql.mock.calls[2][1] as string);
    expect(releasePayload.step).toBe(0);
    expect(releasePayload.processingAt).toBeNull();
  });
});
