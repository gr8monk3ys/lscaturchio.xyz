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
 *    order, so only something filling fields blindly ever puts text in it;
 *  - how long the form was open before it was sent, measured on the client
 *    (one clock, so no skew) and reported as `elapsedMs`. Typing a name, an
 *    email, a subject and a message takes longer than a few seconds; a script
 *    posting to the API directly sends no timing at all.
 *
 * A request that trips either is answered as if it succeeded and is not
 * mailed, so a bot iterating on its payload learns nothing. That is only safe
 * because a person cannot plausibly trip them; anything with a real
 * false-positive rate (BotID) fails loudly instead — see the contact route.
 */

/** The honeypot input's name, shared by the form and the route. */
export const HONEYPOT_FIELD = "website";

/** Below this, the form was not filled in by hand. */
export const MIN_FILL_MS = 3000;

export type SpamSignal = "honeypot" | "no-timing" | "too-fast";

export function spamSignal(submission: {
  website?: unknown;
  elapsedMs?: number;
}): SpamSignal | null {
  if (submission.website !== undefined && submission.website !== "") return "honeypot";
  if (submission.elapsedMs === undefined) return "no-timing";
  if (submission.elapsedMs < MIN_FILL_MS) return "too-fast";
  return null;
}
