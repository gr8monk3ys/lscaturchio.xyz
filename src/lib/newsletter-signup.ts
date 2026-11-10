/**
 * Whether the newsletter signup is open. Off unless
 * `NEWSLETTER_SIGNUP_ENABLED` is exactly "true".
 *
 * Paused on 2026-11-09. The form stored addresses and sent a welcome note,
 * but nothing ever scheduled the follow-up mails and there was no way to send
 * an issue, so the form promised a list that never wrote to anyone. Until
 * there is something to send, the form is hidden and the subscribe route
 * refuses. Unsubscribe stays open: people already on the list hold tokens
 * from mail they were sent.
 *
 * Read on the server only. Essay pages are rendered at build time, so turning
 * it on takes a redeploy, not just the env change.
 */
export function isNewsletterSignupOpen(): boolean {
  return process.env.NEWSLETTER_SIGNUP_ENABLED === "true";
}

/** What the subscribe route answers while signup is paused. */
export const SIGNUP_PAUSED_MESSAGE =
  "The newsletter is paused. Nothing was saved. The RSS feed still carries every new essay.";
