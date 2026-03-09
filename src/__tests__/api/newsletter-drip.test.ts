import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const mockSql = vi.fn();

vi.mock('@/lib/with-rate-limit', () => ({
  withRateLimit: (handler: (req: NextRequest) => Promise<Response>) => handler,
}));

vi.mock('@/lib/rate-limit', () => ({
  RATE_LIMITS: {
    PUBLIC: { limit: 100, window: 60000 },
  },
}));

vi.mock('@/lib/api-auth', () => ({
  validateApiKey: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  getDb: vi.fn(() => mockSql),
  isDatabaseConfigured: vi.fn(() => true),
}));

vi.mock('@/lib/email', () => ({
  sendOnboardingEmail: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

import { POST } from '@/app/api/newsletter/drip/route';
import { validateApiKey } from '@/lib/api-auth';
import { sendOnboardingEmail } from '@/lib/email';

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
    vi.mocked(sendOnboardingEmail).mockResolvedValue(true);
  });

  it('returns auth error when API key validation fails', async () => {
    vi.mocked(validateApiKey).mockReturnValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    );

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
    expect(body).toEqual({
      processed: 1,
      sent: 1,
      failed: 0,
      skipped: 0,
      dryRun: true,
    });
    expect(sendOnboardingEmail).not.toHaveBeenCalled();
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
    expect(body).toEqual({
      processed: 1,
      sent: 1,
      failed: 0,
      skipped: 0,
      dryRun: false,
    });
    expect(sendOnboardingEmail).toHaveBeenCalledWith(
      'user@example.com',
      'token-123',
      1,
      { topics: ['rag-llms'] }
    );
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
    vi.mocked(sendOnboardingEmail).mockResolvedValue(false);

    const response = await POST(createRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
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
