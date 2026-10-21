import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

import { contactInbox, deliverMail, installMailTransport } from '@/lib/mail/deliver';
import { createOutbox } from '@/lib/mail/outbox';
import { resendTransport } from '@/lib/mail/resend';
import {
  renderContactNotification,
  renderOnboardingEmail,
  renderWelcomeEmail,
} from '@/lib/mail/templates';
import { logError, logInfo } from '@/lib/logger';

const READER = 'reader@example.com';
const origin = { component: 'test', action: 'POST' };

/** Everything the logger was handed, as one string, for PII assertions. */
function everythingLogged(): string {
  return JSON.stringify([vi.mocked(logError).mock.calls, vi.mocked(logInfo).mock.calls], (_, v) =>
    v instanceof Error ? `${v.message} ${v.stack}` : v
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('deliverMail', () => {
  const outbox = createOutbox();
  let restore: () => void;

  beforeEach(() => {
    outbox.clear();
    restore = installMailTransport(outbox);
  });

  afterEach(() => restore());

  it('delivers from the newsletter address by default', async () => {
    vi.stubEnv('NEWSLETTER_FROM_EMAIL', '');

    const outcome = await deliverMail({ to: READER, subject: 'Hi', html: '<p>Hi</p>' }, origin);

    expect(outcome).toEqual({ status: 'delivered' });
    expect(outbox.sent).toEqual([
      { from: 'newsletter@lscaturchio.xyz', to: READER, subject: 'Hi', html: '<p>Hi</p>' },
    ]);
  });

  it('resolves each sender identity from its own environment variable', async () => {
    vi.stubEnv('NEWSLETTER_FROM_EMAIL', 'letters@example.com');
    vi.stubEnv('CONTACT_FROM_EMAIL', 'desk@example.com');

    await deliverMail({ to: READER, subject: 'a', html: 'a' }, origin);
    await deliverMail({ from: 'contact', to: READER, subject: 'b', html: 'b' }, origin);

    expect(outbox.sent.map((m) => m.from)).toEqual(['letters@example.com', 'desk@example.com']);
  });

  it('uses the contact defaults when their variables are unset', async () => {
    vi.stubEnv('CONTACT_FROM_EMAIL', '');
    vi.stubEnv('CONTACT_EMAIL', '');

    await deliverMail({ from: 'contact', to: contactInbox(), subject: 's', html: 'h' }, origin);

    expect(outbox.sent[0]).toMatchObject({
      from: 'contact@lscaturchio.xyz',
      to: 'lorenzosca7@protonmail.ch',
    });
  });

  it('reads the contact inbox from CONTACT_EMAIL', () => {
    vi.stubEnv('CONTACT_EMAIL', 'inbox@example.com');
    expect(contactInbox()).toBe('inbox@example.com');
  });

  it('carries replyTo through, and leaves it off when absent', async () => {
    await deliverMail({ to: 'owner@example.com', replyTo: READER, subject: 's', html: 'h' }, origin);
    await deliverMail({ to: READER, subject: 's', html: 'h' }, origin);

    expect(outbox.sent[0].replyTo).toBe(READER);
    expect(outbox.sent[1]).not.toHaveProperty('replyTo');
  });

  it('reports not-configured and logs it as an error, which reaches production', async () => {
    outbox.respondWith({ status: 'not-configured', missing: 'RESEND_API_KEY' });

    const outcome = await deliverMail({ to: READER, subject: 's', html: 'h' }, origin);

    expect(outcome).toEqual({ status: 'not-configured' });
    expect(outbox.sent).toHaveLength(0);
    expect(logError).toHaveBeenCalledWith(
      'Mail: RESEND_API_KEY is not configured; message not sent',
      null,
      { component: 'test', action: 'POST', sender: 'newsletter' }
    );
  });

  it('reports failed, and redacts addresses from the provider detail it logs', async () => {
    outbox.respondWith({
      status: 'failed',
      reason: 'Resend API error',
      detail: { status: 403, body: { message: `You can only send testing emails to ${READER}` } },
    });

    const outcome = await deliverMail(
      { to: READER, replyTo: 'other@example.org', subject: 's', html: 'h' },
      origin
    );

    expect(outcome).toEqual({ status: 'failed' });
    expect(logError).toHaveBeenCalledWith(
      'Mail: Resend API error',
      { status: 403, body: { message: 'You can only send testing emails to [redacted]' } },
      { component: 'test', action: 'POST', sender: 'newsletter' }
    );
    expect(everythingLogged()).not.toContain('@example');
  });

  it('turns a throwing transport into a failed outcome rather than an exception', async () => {
    const restoreThrowing = installMailTransport({
      send: async () => {
        throw new Error(`socket closed while mailing ${READER}`);
      },
    });

    const outcome = await deliverMail({ to: READER, subject: 's', html: 'h' }, origin);
    restoreThrowing();

    expect(outcome).toEqual({ status: 'failed' });
    expect(logError).toHaveBeenCalledWith(
      'Mail: transport threw',
      expect.objectContaining({ message: 'socket closed while mailing [redacted]' }),
      expect.anything()
    );
    expect(everythingLogged()).not.toContain(READER);
  });

  it('never puts a recipient address in the log context on success', async () => {
    await deliverMail({ to: READER, replyTo: 'other@example.org', subject: 's', html: 'h' }, origin);

    expect(logInfo).toHaveBeenCalledWith('Mail: delivered', expect.any(Object));
    expect(everythingLogged()).not.toContain('@example');
  });
});

describe('resendTransport', () => {
  const envelope = {
    from: 'contact@lscaturchio.xyz',
    to: 'owner@example.com',
    replyTo: READER,
    subject: 'Subject',
    html: '<p>Body</p>',
  };
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
    vi.stubEnv('RESEND_API_KEY', 'test_resend_key');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports not-configured without a request when RESEND_API_KEY is unset', async () => {
    vi.stubEnv('RESEND_API_KEY', '');

    expect(await resendTransport.send(envelope)).toEqual({
      status: 'not-configured',
      missing: 'RESEND_API_KEY',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts Resend's documented shape, with a timeout", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: 'e1' }), { status: 200 }));

    expect(await resendTransport.send(envelope)).toEqual({ status: 'delivered' });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer test_resend_key',
    });
    expect(init.signal).toBeDefined();
    expect(JSON.parse(init.body)).toEqual({
      from: 'contact@lscaturchio.xyz',
      to: 'owner@example.com',
      reply_to: READER,
      subject: 'Subject',
      html: '<p>Body</p>',
    });
  });

  it('omits reply_to when there is none', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));

    await resendTransport.send({ ...envelope, replyTo: undefined });

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).not.toHaveProperty('reply_to');
  });

  it('reports a JSON error body as a Resend API error', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: 'Invalid API key' }), { status: 401 })
    );

    expect(await resendTransport.send(envelope)).toEqual({
      status: 'failed',
      reason: 'Resend API error',
      detail: { status: 401, body: { message: 'Invalid API key' } },
    });
  });

  it('reports a non-JSON error body as a Resend API error too', async () => {
    fetchMock.mockResolvedValue(new Response('<html>Bad Gateway</html>', { status: 502 }));

    expect(await resendTransport.send(envelope)).toEqual({
      status: 'failed',
      reason: 'Resend API error',
      detail: { status: 502, body: '<html>Bad Gateway</html>' },
    });
  });

  it('reports a network failure without throwing', async () => {
    const error = new Error('Network error');
    fetchMock.mockRejectedValue(error);

    expect(await resendTransport.send(envelope)).toEqual({
      status: 'failed',
      reason: 'Resend request failed',
      detail: error,
    });
  });

  it('is the transport deliverMail uses when none is installed', async () => {
    fetchMock.mockResolvedValue(new Response('upstream timeout', { status: 504 }));

    const outcome = await deliverMail({ to: READER, subject: 's', html: 'h' }, origin);

    expect(outcome).toEqual({ status: 'failed' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(
      'Mail: Resend API error',
      { status: 504, body: 'upstream timeout' },
      expect.objectContaining({ component: 'test' })
    );
  });
});

describe('templates', () => {
  it('links the welcome email to its unsubscribe token', () => {
    const { subject, html } = renderWelcomeEmail('tok123');

    expect(subject).toBe("Welcome to Lorenzo's Newsletter!");
    expect(html).toContain('/unsubscribe?token=tok123');
  });

  it('renders onboarding steps 1 and 2, with topic links on step 1', () => {
    const one = renderOnboardingEmail('tok', 1, { topics: ['ai', ' ', 'unknown topic'] });
    const two = renderOnboardingEmail('tok', 2);

    expect(one?.subject).toBe('Start here: a quick path through the site');
    expect(one?.html).toContain('/topics/ai');
    expect(one?.html).toContain('/topics/unknown%20topic');
    expect(two?.subject).toBe('Work with me (if you need a hand shipping)');
    expect(two?.html).not.toContain('/topics/');
  });

  it('has no email for any other onboarding step', () => {
    expect(renderOnboardingEmail('tok', 0)).toBeNull();
    expect(renderOnboardingEmail('tok', 3)).toBeNull();
  });

  it('escapes every reader field in the contact notification', () => {
    const { subject, html } = renderContactNotification(
      {
        name: 'Jane <b>',
        email: 'jane@example.com',
        subject: 'Hi\r\nBcc: x@evil.example',
        message: '<script>x</script>\nline two',
      },
      new Date('2026-01-01T00:00:00Z')
    );

    expect(subject).not.toMatch(/[\r\n]/);
    expect(subject).toContain('— Jane <b>');
    expect(html).toContain('Jane &lt;b&gt;');
    expect(html).toContain('&lt;script&gt;x&lt;/script&gt;<br>line two');
    expect(html).not.toContain('<script>');
  });
});
