import { afterAll, afterEach, beforeAll, beforeEach, describe, it, expect, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock dependencies before importing the route
vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logNotice: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({ withRateLimit: <T>(handler: T) => handler }));

// @/lib/sanitize is deliberately NOT mocked. It used to be reimplemented here,
// which meant these tests asserted a copy of the sanitisers rather than the
// sanitisers, and a regression in src/lib/sanitize.ts could not fail the suite.

vi.mock('@/lib/csrf', () => ({
  validateCsrf: vi.fn(),
}));

vi.mock('@/lib/bot-id', () => ({
  isBotRequest: vi.fn(),
}));

import { POST } from '@/app/api/contact/route';
import { logNotice } from '@/lib/logger';
import { validateCsrf } from '@/lib/csrf';
import { isBotRequest } from '@/lib/bot-id';
import { installMailTransport } from '@/lib/mail/deliver';
import { createOutbox } from '@/lib/mail/outbox';

// The mailer. What Resend's HTTP request looks like is resend.ts's concern
// (src/__tests__/lib/mail.test.ts); here, what the route asked to deliver.
const outbox = createOutbox();
let restoreTransport: () => void;
beforeAll(() => {
  restoreTransport = installMailTransport(outbox);
});
afterAll(() => restoreTransport());

/**
 * A request as the real form sends it: an empty honeypot and a fill time well
 * past the floor, unless the test overrides them.
 */
function createMockRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      origin: 'http://localhost:3000',
    },
    body: JSON.stringify({ contact_ref: '', elapsedMs: 30_000, ...body }),
  });
}

const validBody = {
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Project scoping',
  message: 'Hello world',
};

describe('/api/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    outbox.clear();
    // Default: CSRF passes
    vi.mocked(validateCsrf).mockReturnValue(null);
    // Default: BotID says human
    vi.mocked(isBotRequest).mockResolvedValue(false);
    vi.stubEnv('CONTACT_EMAIL', 'inbox@example.com');
    vi.stubEnv('CONTACT_FROM_EMAIL', 'noreply@example.com');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('validation', () => {
    it('returns 400 when name is missing', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        subject: 'Project scoping',
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
        subject: 'Project scoping',
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
        subject: 'Project scoping',
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
        subject: 'Project scoping',
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
        subject: 'Project scoping',
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
        subject: 'Project scoping',
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
        subject: 'Project scoping',
        message: 'a'.repeat(5001),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('5000');
      expect(data.success).toBe(false);
    });
  });


  describe('delivery', () => {
    it('answers 200 with the success message', async () => {
      const response = await POST(createMockRequest(validBody));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: { message: "Message sent successfully! I'll get back to you soon." },
      });
    });

    it('delivers to the inbox from the contact address, replying to the sender', async () => {
      await POST(
        createMockRequest({
          name: 'Jane Doe',
          email: 'jane@example.com',
          subject: 'Project scoping',
          message: 'Test message content',
        })
      );

      expect(outbox.sent).toHaveLength(1);
      expect(outbox.sent[0]).toMatchObject({
        from: 'noreply@example.com',
        to: 'inbox@example.com',
        replyTo: 'jane@example.com',
        subject: 'Project scoping — Jane Doe',
      });
      expect(outbox.sent[0].html).toContain('Test message content');
    });

    it('trims whitespace from name and message', async () => {
      await POST(createMockRequest({ ...validBody, name: '  John Doe  ', message: '  Hello world  ' }));

      expect(outbox.sent[0].subject).toBe('Project scoping — John Doe');
      expect(outbox.sent[0].html).toContain('<strong>From:</strong> John Doe</p>');
    });

    it('replies to the sender address lowercased', async () => {
      await POST(createMockRequest({ ...validBody, email: 'JOHN@EXAMPLE.COM' }));

      expect(outbox.sent[0].replyTo).toBe('john@example.com');
    });

    it('escapes HTML in name to prevent XSS', async () => {
      await POST(createMockRequest({ ...validBody, name: '<script>alert("xss")</script>' }));

      expect(outbox.sent[0].html).not.toContain('<script>');
      expect(outbox.sent[0].html).toContain('&lt;script&gt;');
    });

    it('sanitizes message content for HTML email', async () => {
      await POST(
        createMockRequest({ ...validBody, message: '<img src=x onerror="alert(1)">Hello\nWorld' })
      );

      expect(outbox.sent[0].html).not.toContain('<img');
      expect(outbox.sent[0].html).toContain('&lt;img');
      expect(outbox.sent[0].html).toContain('<br>'); // newlines converted to <br>
    });

    it('sanitizes subject to prevent header injection', async () => {
      await POST(createMockRequest({ ...validBody, name: 'John\r\nBcc: attacker@evil.com' }));

      expect(outbox.sent[0].subject).not.toMatch(/[\r\n]/);
    });
  });

  describe('when mail is not configured', () => {
    it('answers 500 "temporarily unavailable"', async () => {
      outbox.respondWith({ status: 'not-configured', missing: 'RESEND_API_KEY' });

      const response = await POST(createMockRequest(validBody));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'Contact form is temporarily unavailable. Please try again later.',
      });
      expect(outbox.sent).toHaveLength(0);
    });
  });

  describe('when delivery fails', () => {
    it('answers 500 "Failed to send message"', async () => {
      outbox.respondWith({ status: 'failed', reason: 'Resend API error' });

      const response = await POST(createMockRequest(validBody));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'Failed to send message. Please try again later.',
      });
    });
  });

  describe('edge cases', () => {
    // The schema trims BEFORE its min(1) check, so a field of only
    // whitespace is rejected rather than mailed as a blank line.

    it('rejects a whitespace-only name', async () => {
      const request = createMockRequest({
        name: '   ',
        email: 'test@example.com',
        subject: 'Project scoping',
        message: 'Hello world',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('rejects a whitespace-only message', async () => {
      const request = createMockRequest({
        name: 'John Doe',
        email: 'test@example.com',
        subject: 'Project scoping',
        message: '   ',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
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

      expect(response.status).toBe(400);
      expect(data.error).toBe('Request body must be valid JSON');
      expect(data.success).toBe(false);
    });

    it('rejects a message of only newlines', async () => {
      const request = createMockRequest({
        name: 'John Doe',
        email: 'test@example.com',
        subject: 'Project scoping',
        message: '\n\n\n',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('accepts message at exactly 5000 characters', async () => {
      const request = createMockRequest({
        name: 'John Doe',
        email: 'test@example.com',
        subject: 'Project scoping',
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
        subject: 'Project scoping',
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
        subject: 'Project scoping',
        message: 'Hello from Tokyo! Greetings.',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });


  describe('spam signals', () => {
    // Each of these answers exactly like a real send, so a bot iterating on
    // its payload cannot tell which part gave it away.
    it.each([
      ['a filled honeypot', { contact_ref: 'https://spam.example' }, 'honeypot'],
      ['a fill time under three seconds', { elapsedMs: 800 }, 'too-fast'],
    ])('drops %s without mailing it, and reports success', async (_, overrides, signal) => {
      const response = await POST(createMockRequest({ ...validBody, ...overrides }));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toContain('successfully');
      expect(outbox.sent).toHaveLength(0);
      expect(isBotRequest).not.toHaveBeenCalled();
      expect(logNotice).toHaveBeenCalledWith(`[contact] dropped submission: ${signal}`);
    });

    // A tab opened before the deploy runs the old bundle, which sent neither
    // field. Dropping it would lose a real message while saying it arrived;
    // it goes on to BotID, which refuses a bare script visibly.
    it.each([
      ['no fill time', { contact_ref: undefined, elapsedMs: undefined }],
      ['a non-numeric fill time', { elapsedMs: 'soon' }],
    ])('mails a submission with %s, after asking BotID', async (_, overrides) => {
      const response = await POST(createMockRequest({ ...validBody, ...overrides }));

      expect(response.status).toBe(200);
      expect(isBotRequest).toHaveBeenCalledTimes(1);
      expect(outbox.sent).toHaveLength(1);
      expect(logNotice).not.toHaveBeenCalled();
    });

    it('mails only the four fields a person wrote, not the spam signals', async () => {
      await POST(createMockRequest({ ...validBody, elapsedMs: 987_654 }));

      const mailed = JSON.stringify(outbox.sent[0]);
      expect(mailed).not.toContain('987654');
      expect(mailed).not.toContain('contact_ref');
      expect(mailed).not.toContain('elapsedMs');
    });
  });

  describe('BotID', () => {
    // A refusal the reader can see, unlike the silent drops above: BotID can
    // misjudge a person, and they need to know to use email instead.
    it('refuses with 403 and does not mail when BotID says bot', async () => {
      vi.mocked(isBotRequest).mockResolvedValue(true);

      const response = await POST(createMockRequest(validBody));
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toContain('flagged as automated');
      expect(outbox.sent).toHaveLength(0);
    });

    it('asks BotID only after the request has passed validation', async () => {
      await POST(createMockRequest({ ...validBody, email: 'not-an-email' }));

      expect(isBotRequest).not.toHaveBeenCalled();
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
        subject: 'Project scoping',
        message: 'Hello world',
      });
      const response = await POST(request);

      expect(response.status).toBe(403);
    });
  });
});
