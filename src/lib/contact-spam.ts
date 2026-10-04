/**
 * The contact form's cheap spam checks, which run before anything costs money.
 *
 * The form was receiving submissions like "nwEPHTexpjukzPzPkT" from rotating
 * Gmail dot-variants: scripts that fill every field they find and post within
 * a second of loading the page. Neither the per-IP rate limit (bots rotate
 * IPs) nor the Origin check (a script sets any header it likes) stops that.
 *
 * Two signals, both invisible to a person:
 *
 *  - a honeypot input that is off-screen, `aria-hidden` and out of the tab
 *    order, so only something filling fields blindly ever puts text in it.
 *    Its name means nothing to autofill or a password manager, which ignore
 *    `autocomplete="off"` and would otherwise fill a field called "website";
 *  - how long the form was open before it was sent, measured on the client
 *    with a monotonic clock and reported as `elapsedMs`. Typing a name, an
 *    email, a subject and a message takes longer than a few seconds.
 *
 * A request that trips either is answered as if it succeeded and is not
 * mailed, so a bot iterating on its payload learns nothing. That is only safe
 * because a person cannot plausibly trip them; anything with a real
 * false-positive rate fails loudly instead — see the contact route.
 *
 * A missing `elapsedMs` is deliberately NOT a signal. A tab opened before a
 * deploy runs the previous bundle, which never sent one, and dropping its
 * message silently would lose a real enquiry while telling the writer it
 * arrived. A script posting to the API directly also sends none; BotID
 * refuses that one, visibly.
 */

/**
 * The honeypot input's name, shared by the form and the route. Meaningless on
 * purpose — see above.
 */
export const HONEYPOT_FIELD = "contact_ref";

/** Below this, the form was not filled in by hand. */
export const MIN_FILL_MS = 3000;

export type SpamSignal = "honeypot" | "too-fast";

export function spamSignal(submission: {
  contact_ref?: unknown;
  elapsedMs?: number;
}): SpamSignal | null {
  const honeypot = submission[HONEYPOT_FIELD];
  if (honeypot !== undefined && honeypot !== "") return "honeypot";
  if (submission.elapsedMs !== undefined && submission.elapsedMs < MIN_FILL_MS) {
    return "too-fast";
  }
  return null;
}
