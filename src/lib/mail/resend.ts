import type { Envelope, MailTransport, TransportResult } from "./deliver";

const RESEND_API_URL = "https://api.resend.com/emails";

/** Long enough for a slow Resend reply, short enough to answer the form. */
const TIMEOUT_MS = 10_000;

/**
 * Read an error body without assuming it is JSON. A gateway or proxy in front
 * of Resend can answer with HTML or nothing at all, and `response.json()` on
 * that used to throw past the "Resend API error" log line.
 */
async function readErrorBody(response: Response): Promise<unknown> {
  let text: string;
  try {
    text = await response.text();
  } catch {
    return undefined;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text.slice(0, 500);
  }
}

/** Resend's HTTP API (https://resend.com/docs/api-reference/emails/send-email). */
export const resendTransport: MailTransport = {
  async send(envelope: Envelope): Promise<TransportResult> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return { status: "not-configured", missing: "RESEND_API_KEY" };

    let response: Response;
    try {
      response = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: envelope.from,
          to: envelope.to,
          ...(envelope.replyTo ? { reply_to: envelope.replyTo } : {}),
          subject: envelope.subject,
          html: envelope.html,
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (error) {
      return { status: "failed", reason: "Resend request failed", detail: error };
    }

    if (!response.ok) {
      return {
        status: "failed",
        reason: "Resend API error",
        detail: { status: response.status, body: await readErrorBody(response) },
      };
    }

    return { status: "delivered" };
  },
};
