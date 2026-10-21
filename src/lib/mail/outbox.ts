import type { Envelope, MailTransport, TransportResult } from "./deliver";

/**
 * An in-memory transport: records every envelope instead of sending it.
 *
 * Tests install it with `installMailTransport(outbox)` and assert against
 * `outbox.sent`, which is what a route actually asked to deliver, From address
 * resolved, rather than the shape of a Resend HTTP request.
 */
export interface Outbox extends MailTransport {
  readonly sent: Envelope[];
  /** Answer every later send with this result instead of delivering it. */
  respondWith(result: TransportResult): void;
  /** Forget what was sent and go back to delivering. */
  clear(): void;
}

export function createOutbox(): Outbox {
  const sent: Envelope[] = [];
  let forced: TransportResult | null = null;

  return {
    sent,
    async send(envelope) {
      if (forced) return forced;
      sent.push(envelope);
      return { status: "delivered" };
    },
    respondWith(result) {
      forced = result;
    },
    clear() {
      sent.length = 0;
      forced = null;
    },
  };
}
