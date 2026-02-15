import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/summarize', () => ({
  summarizeContent: vi.fn(),
  generateKeyTakeaways: vi.fn(),
}));

vi.mock('@/lib/csrf', () => ({
  validateCsrf: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
}));

vi.mock('@/lib/with-rate-limit', () => ({
  withRateLimit: (handler: (req: NextRequest) => Promise<Response>) => handler,
}));

vi.mock('@/lib/rate-limit', () => ({
  RATE_LIMITS: {
    AI_HEAVY: { limit: 5, window: 60000 },
  },
}));

import { POST } from '@/app/api/summarize/route';
import { summarizeContent, generateKeyTakeaways } from '@/lib/summarize';
import { validateCsrf } from '@/lib/csrf';

// Helper to create mock request
function createMockRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      origin: 'http://localhost:3000',
    },
    body: JSON.stringify(body),
  });
}

describe('/api/summarize', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: CSRF passes
    vi.mocked(validateCsrf).mockReturnValue(null);
    // Default: summarize returns a summary
    vi.mocked(summarizeContent).mockResolvedValue('This is a test summary.');
    // Default: takeaways returns an array
    vi.mocked(generateKeyTakeaways).mockResolvedValue([
      'Key point 1',
      'Key point 2',
      'Key point 3',
    ]);
  });

  describe('validation', () => {
    it('returns 400 when content is missing', async () => {
      const request = createMockRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('returns 400 when content is empty string', async () => {
      const request = createMockRequest({ content: '' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('returns 400 when content is not a string', async () => {
      const request = createMockRequest({ content: 123 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('returns 400 for invalid type value', async () => {
      const request = createMockRequest({
        content: 'Some content',
        type: 'invalid',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.success).toBe(false);
    });
  });

  describe('summary generation', () => {
    it('returns summary when type is summary', async () => {
      vi.mocked(summarizeContent).mockResolvedValue('A concise summary.');

      const request = createMockRequest({
        content: 'Long blog post content here...',
        type: 'summary',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.summary).toBe('A concise summary.');
      expect(summarizeContent).toHaveBeenCalledWith(
        'Long blog post content here...',
        50
      );
    });

    it('defaults to summary when type is not specified', async () => {
      vi.mocked(summarizeContent).mockResolvedValue('Default summary.');

      const request = createMockRequest({
        content: 'Some content to summarize',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.summary).toBe('Default summary.');
      expect(summarizeContent).toHaveBeenCalled();
      expect(generateKeyTakeaways).not.toHaveBeenCalled();
    });
  });

  describe('takeaways generation', () => {
    it('returns takeaways when type is takeaways', async () => {
      vi.mocked(generateKeyTakeaways).mockResolvedValue([
        'First key point',
        'Second key point',
        'Third key point',
      ]);

      const request = createMockRequest({
        content: 'Blog post with important points...',
        type: 'takeaways',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.takeaways).toEqual([
        'First key point',
        'Second key point',
        'Third key point',
      ]);
      expect(generateKeyTakeaways).toHaveBeenCalledWith(
        'Blog post with important points...',
        3
      );
    });

    it('returns empty array when no takeaways generated', async () => {
      vi.mocked(generateKeyTakeaways).mockResolvedValue([]);

      const request = createMockRequest({
        content: 'Short content',
        type: 'takeaways',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.takeaways).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('returns 500 when summarizeContent fails', async () => {
      vi.mocked(summarizeContent).mockRejectedValue(new Error('AI API error'));

      const request = createMockRequest({
        content: 'Test content',
        type: 'summary',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to process content');
    });

    it('returns 500 when generateKeyTakeaways fails', async () => {
      vi.mocked(generateKeyTakeaways).mockRejectedValue(
        new Error('AI API error')
      );

      const request = createMockRequest({
        content: 'Test content',
        type: 'takeaways',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to process content');
    });
  });
});
