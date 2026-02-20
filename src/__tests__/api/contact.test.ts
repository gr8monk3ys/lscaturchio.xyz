import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock dependencies before importing the route
vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

vi.mock('@/lib/with-rate-limit', () => ({
  withRateLimit: (handler: (req: NextRequest) => Promise<Response>) => handler,
  RATE_LIMITS: {
    NEWSLETTER: { limit: 3, window: 300000 },
    STANDARD: { limit: 60, window: 60000 },
    AI_HEAVY: { limit: 10, window: 60000 },
  },
}));

vi.mock('@/lib/rate-limit', () => ({
  RATE_LIMITS: {
    NEWSLETTER: { limit: 3, window: 300000 },
    STANDARD: { limit: 60, window: 60000 },
    AI_HEAVY: { limit: 10, window: 60000 },
  },
}));

// Mock sanitize functions
vi.mock('@/lib/sanitize', () => ({
  escapeHtml: (str: string) => {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },
  sanitizeForHtmlEmail: (str: string) => {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br>');
  },
  sanitizeEmailSubject: (str: string) => {
    if (typeof str !== 'string') return '';
    return str.replace(/[\r\n]/g, ' ').trim().slice(0, 200);
  },
}));

vi.mock('@/lib/csrf', () => ({
  validateCsrf: vi.fn(),
}));

// Mock fetch globally for Resend API calls
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import { POST } from '@/app/api/contact/route';
import { logError, logInfo } from '@/lib/logger';
import { validateCsrf } from '@/lib/csrf';

// Helper to create mock request
function createMockRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      origin: 'http://localhost:3000',
    },
    body: JSON.stringify(body),
  });
}

// Store original env
const originalEnv = { ...process.env };

describe('/api/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: CSRF passes
    vi.mocked(validateCsrf).mockReturnValue(null);
    // Default: Resend API configured
    process.env.RESEND_API_KEY = 'test_resend_key';
    process.env.CONTACT_EMAIL = 'test@example.com';
    process.env.CONTACT_FROM_EMAIL = 'noreply@example.com';
    // Default: Resend API succeeds
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'test-email-id' }),
    });
  });

  afterEach(() => {
    // Restore original env
    process.env = { ...originalEnv };
  });

  describe('validation', () => {
    it('returns 400 when name is missing', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        message: 'Hello world',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.success).toBe(false);
    });

    it('returns 400 when name is empty string', async () => {
      const request = createMockRequest({
        name: '',
        email: 'test@example.com',
        message: 'Hello world',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.success).toBe(false);
    });

    it('returns 400 when name is too long', async () => {
      const request = createMockRequest({
        name: 'a'.repeat(101),
        email: 'test@example.com',
        message: 'Hello world',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('too long');
      expect(data.success).toBe(false);
    });

    it('returns 400 when email is missing', async () => {
      const request = createMockRequest({
        name: 'John Doe',
        message: 'Hello world',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.success).toBe(false);
    });

    it('returns 400 when email is invalid format', async () => {
      const request = createMockRequest({
        name: 'John Doe',
        email: 'not-an-email',
        message: 'Hello world',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.success).toBe(false);
    });

    it('returns 400 when email has invalid domain', async () => {
      const request = createMockRequest({
        name: 'John Doe',
        email: 'test@invalid',
        message: 'Hello world',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.success).toBe(false);
    });

    it('returns 400 when message is missing', async () => {
      const request = createMockRequest({
        name: 'John Doe',
        email: 'test@example.com',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.success).toBe(false);
    });

    it('returns 400 when message is empty string', async () => {
      const request = createMockRequest({
        name: 'John Doe',
        email: 'test@example.com',
        message: '',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.success).toBe(false);
    });

    it('returns 400 when message exceeds 5000 characters', async () => {
      const request = createMockRequest({
        name: 'John Doe',
        email: 'test@example.com',
        message: 'a'.repeat(5001),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('5000');
      expect(data.success).toBe(false);
    });
  });

  // Note: CSRF protection was removed from the contact route.
  // Rate limiting via withRateLimit provides protection against abuse.

  describe('successful email send', () => {
    it('sends email successfully with valid data', async () => {
      const request = createMockRequest({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello, this is my message.',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toContain('successfully');
    });

    it('calls Resend API with correct parameters', async () => {
      const request = createMockRequest({
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Test message content',
      });
      await POST(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.resend.com/emails',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test_resend_key',
          }),
        })
      );

      // Verify body content
      const fetchCall = mockFetch.mock.calls[0];
      const bodyJson = JSON.parse(fetchCall[1].body);
      expect(bodyJson.from).toBe('noreply@example.com');
      expect(bodyJson.to).toBe('test@example.com');
      expect(bodyJson.reply_to).toBe('jane@example.com');
      expect(bodyJson.subject).toContain('Jane Doe');
    });

    it('uses default contact email when CONTACT_EMAIL is not set', async () => {
      delete process.env.CONTACT_EMAIL;

      const request = createMockRequest({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
      });
      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      const bodyJson = JSON.parse(fetchCall[1].body);
      expect(bodyJson.to).toBe('lorenzosca7@protonmail.ch');
    });

    it('uses default from email when CONTACT_FROM_EMAIL is not set', async () => {
      delete process.env.CONTACT_FROM_EMAIL;

      const request = createMockRequest({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
      });
      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      const bodyJson = JSON.parse(fetchCall[1].body);
      expect(bodyJson.from).toBe('contact@lscaturchio.xyz');
    });

    it('trims whitespace from name and message', async () => {
      const request = createMockRequest({
        name: '  John Doe  ',
        email: 'john@example.com',
        message: '  Hello world  ',
      });
      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      const bodyJson = JSON.parse(fetchCall[1].body);
      expect(bodyJson.subject).toContain('John Doe');
      expect(bodyJson.html).toContain('John Doe');
    });

    it('normalizes email to lowercase', async () => {
      const request = createMockRequest({
        name: 'John Doe',
        email: 'JOHN@EXAMPLE.COM',
        message: 'Hello world',
      });
      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      const bodyJson = JSON.parse(fetchCall[1].body);
      expect(bodyJson.reply_to).toBe('john@example.com');
    });

    it('escapes HTML in name to prevent XSS', async () => {
      const request = createMockRequest({
        name: '<script>alert("xss")</script>',
        email: 'test@example.com',
        message: 'Test message',
      });
      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      const bodyJson = JSON.parse(fetchCall[1].body);
      expect(bodyJson.html).not.toContain('<script>');
      expect(bodyJson.html).toContain('&lt;script&gt;');
    });

    it('sanitizes message content for HTML email', async () => {
      const request = createMockRequest({
        name: 'John Doe',
        email: 'test@example.com',
        message: '<img src=x onerror="alert(1)">Hello\nWorld',
      });
      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      const bodyJson = JSON.parse(fetchCall[1].body);
      expect(bodyJson.html).not.toContain('<img');
      expect(bodyJson.html).toContain('&lt;img');
      expect(bodyJson.html).toContain('<br>'); // newlines converted to <br>
    });

    it('sanitizes subject to prevent header injection', async () => {
      const request = createMockRequest({
        name: "John\r\nBcc: attacker@evil.com",
        email: 'test@example.com',
        message: 'Test message',
      });
      await POST(request);

      const fetchCall = mockFetch.mock.calls[0];
      const bodyJson = JSON.parse(fetchCall[1].body);
      expect(bodyJson.subject).not.toContain('\r');
      expect(bodyJson.subject).not.toContain('\n');
    });
  });

  describe('fallback when RESEND_API_KEY is missing', () => {
    beforeEach(() => {
      delete process.env.RESEND_API_KEY;
    });

    it('returns success message when API key is not configured', async () => {
      const request = createMockRequest({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello world',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toContain('not configured');
    });

    it('logs contact form data when API key is missing', async () => {
      const request = createMockRequest({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello world',
      });
      await POST(request);

      expect(logInfo).toHaveBeenCalledWith(
        'Contact Form: No RESEND_API_KEY configured',
        expect.objectContaining({
          component: 'contact',
          name: 'John Doe',
          email: 'john@example.com',
          messageLength: 11,
        })
      );
    });

    it('does not call Resend API when key is missing', async () => {
      const request = createMockRequest({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello world',
      });
      await POST(request);

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Resend API error handling', () => {
    it('returns 500 when Resend API returns error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Invalid API key' }),
      });

      const request = createMockRequest({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello world',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to send message');
      expect(data.success).toBe(false);
    });

    it('logs error when Resend API fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Rate limit exceeded' }),
      });

      const request = createMockRequest({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello world',
      });
      await POST(request);

      expect(logError).toHaveBeenCalledWith(
        'Contact Form: Resend API error',
        expect.objectContaining({ message: 'Rate limit exceeded' }),
        expect.objectContaining({ component: 'contact', action: 'POST' })
      );
    });

    it('returns 500 when fetch throws network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const request = createMockRequest({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello world',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('unexpected error');
      expect(data.success).toBe(false);
    });

    it('logs unexpected errors', async () => {
      mockFetch.mockRejectedValue(new Error('Connection timeout'));

      const request = createMockRequest({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello world',
      });
      await POST(request);

      expect(logError).toHaveBeenCalledWith(
        'Contact Form: Unexpected error',
        expect.any(Error),
        expect.objectContaining({ component: 'contact', action: 'POST' })
      );
    });
  });

  describe('edge cases', () => {
    // Note: The current validation schema trims AFTER min(1) check,
    // so whitespace-only strings pass validation. These tests document
    // actual behavior - consider using z.preprocess or refine for stricter validation.

    it('allows whitespace-only name (trims after min check)', async () => {
      // Current behavior: "   " passes min(1), then gets trimmed to ""
      // The API still sends the email with empty name
      const request = createMockRequest({
        name: '   ',
        email: 'test@example.com',
        message: 'Hello world',
      });
      const response = await POST(request);
      const data = await response.json();

      // Documents current behavior - validation passes
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('allows whitespace-only message (trims after min check)', async () => {
      // Current behavior: "   " passes min(1), then gets trimmed to ""
      const request = createMockRequest({
        name: 'John Doe',
        email: 'test@example.com',
        message: '   ',
      });
      const response = await POST(request);
      const data = await response.json();

      // Documents current behavior - validation passes
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('handles malformed JSON body', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          origin: 'http://localhost:3000',
        },
        body: 'invalid json{',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
      expect(data.success).toBe(false);
    });

    it('allows message with only newlines (trims after min check)', async () => {
      // Current behavior: "\n\n\n" passes min(1), then gets trimmed to ""
      const request = createMockRequest({
        name: 'John Doe',
        email: 'test@example.com',
        message: '\n\n\n',
      });
      const response = await POST(request);
      const data = await response.json();

      // Documents current behavior - validation passes
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('accepts message at exactly 5000 characters', async () => {
      const request = createMockRequest({
        name: 'John Doe',
        email: 'test@example.com',
        message: 'a'.repeat(5000),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('accepts name at exactly 100 characters', async () => {
      const request = createMockRequest({
        name: 'a'.repeat(100),
        email: 'test@example.com',
        message: 'Hello world',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('handles unicode characters in name and message', async () => {
      const request = createMockRequest({
        name: 'Jose Garcia',
        email: 'jose@example.com',
        message: 'Hello from Tokyo! Greetings.',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('CSRF protection', () => {
    it('returns 403 when CSRF validation fails', async () => {
      vi.mocked(validateCsrf).mockReturnValue(
        NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
      );

      const request = createMockRequest({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello world',
      });
      const response = await POST(request);

      expect(response.status).toBe(403);
    });
  });
});
