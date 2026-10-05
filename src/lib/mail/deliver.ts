/**
 * Mail delivery: the one place the site sends an email from.
 *
 * Callers hand over a rendered message and get back one of three outcomes:
 * delivered, not configured, or failed. Everything else lives here, so it
 * cannot drift between callers the way it did when the contact route and the
 * newsletter each kept their own Resend client:
 *
 * - which address each sender identity mails from (and the owner's inbox);
 * - what a missing RESEND_API_KEY does. It is logged as an error in every
 *   environment. The newsletter's copy used `logInfo`, which prints only in
 *   development, so in production a welcome email that never left said so
 *   nowhere;
 * - what gets logged on failure. Recipient and reply-to addresses never enter
 *   the log context, because that context is forwarded to Sentry;
 * - never throwing. A send that fails is an outcome the caller decides about,
 *   not an exception that lands in a route's "Unexpected error" catch-all.
 *
 * The transport is the seam. Production uses Resend (`./resend`); tests
 * install the in-memory outbox (`./outbox`) with `installMailTransport`.
 */

import { logError, logInfo } from "@/lib/logger";
import { resendTransport } from "./resend";

/** The site's sending identities. Each maps to a From address below. */
export type Sender = "newsletter" | "contact";

/** What a caller asks to send. `from` names an identity, not an address. */
export interface Mail {
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  /** Defaults to `newsletter`. */
  from?: Sender;
}

/** A message with its From address resolved: what a transport receives. */
export interface Envelope {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
}

export type DeliveryOutcome =
  | { status: "delivered" }
  | { status: "not-configured" }
  | { status: "failed" };

/**
 * What a transport reports. A failure carries a short reason for the log line
 * and whatever detail the provider gave, which this module redacts before it
 * is logged.
 */
export type TransportResult =
  | { status: "delivered" }
  | { status: "not-configured"; missing: string }
  | { status: "failed"; reason: string; detail?: unknown };

export interface MailTransport {
  send(envelope: Envelope): Promise<TransportResult>;
}

/** Who is sending, for the log line. Never an address. */
export interface DeliveryOrigin {
  component: string;
  action?: string;
}

const FROM_ADDRESS: Record<Sender, () => string> = {
  newsletter: () => process.env.NEWSLETTER_FROM_EMAIL || "newsletter@lscaturchio.xyz",
  // Must be on a domain verified in Resend.
  contact: () => process.env.CONTACT_FROM_EMAIL || "contact@lscaturchio.xyz",
};

/** Where contact-form submissions are delivered. */
export function contactInbox(): string {
  return process.env.CONTACT_EMAIL || "lorenzosca7@protonmail.ch";
}

let activeTransport: MailTransport = resendTransport;

/**
 * Replace the transport, returning a function that restores the previous one.
 * For tests; nothing in the app calls it.
 */
export function installMailTransport(transport: MailTransport): () => void {
  const previous = activeTransport;
  activeTransport = transport;
  return () => {
    activeTransport = previous;
  };
}

const ADDRESS_PATTERN = /[^\s@"'<>(),;:]+@[^\s@"'<>(),;:]+\.[^\s@"'<>(),;:]+/g;

/**
 * Replace anything shaped like an email address. Provider error bodies can
 * quote the recipient ("You can only send testing emails to ..."), and the
 * detail is forwarded to Sentry.
 */
function redactAddresses(value: unknown): unknown {
  if (typeof value === "string") return value.replace(ADDRESS_PATTERN, "[redacted]");
  if (value instanceof Error) {
    const copy = new Error(redactAddresses(value.message) as string);
    copy.name = value.name;
    if (value.stack) copy.stack = redactAddresses(value.stack) as string;
    return copy;
  }
  if (Array.isArray(value)) return value.map(redactAddresses);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, inner]) => [key, redactAddresses(inner)])
    );
  }
  return value;
}

export async function deliverMail(
  mail: Mail,
  origin: DeliveryOrigin
): Promise<DeliveryOutcome> {
  const sender = mail.from ?? "newsletter";
  const context = { component: origin.component, action: origin.action, sender };

  let result: TransportResult;
  try {
    result = await activeTransport.send({
      from: FROM_ADDRESS[sender](),
      to: mail.to,
      ...(mail.replyTo ? { replyTo: mail.replyTo } : {}),
      subject: mail.subject,
      html: mail.html,
    });
  } catch (error) {
    // A transport is meant to report failures, not throw them; this is the
    // backstop that keeps `deliverMail` from ever throwing.
    result = { status: "failed", reason: "transport threw", detail: error };
  }

  switch (result.status) {
    case "delivered":
      logInfo("Mail: delivered", context);
      return { status: "delivered" };

    case "not-configured":
      logError(`Mail: ${result.missing} is not configured; message not sent`, null, context);
      return { status: "not-configured" };

    case "failed":
      logError(`Mail: ${result.reason}`, redactAddresses(result.detail), context);
      return { status: "failed" };
  }
}
