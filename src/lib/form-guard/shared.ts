/**
 * The half of the human form guard that both bundles need.
 *
 * The browser imports this — `useFormGuard` for the field names, and
 * `instrumentation-client.ts` for the BotID protect list — so nothing here may
 * import `botid/server`, the logger or anything else server-only. The verdict
 * itself lives in `./guard.ts`.
 */

/**
 * The honeypot input's name, on the wire and in the DOM.
 *
 * Meaningless on purpose: autofill and password managers ignore
 * `autocomplete="off"` and would fill a field called "website", which would
 * drop a real person's message without a word. It says "contact" because the
 * contact form had it first; renaming it would let a tab opened before the
 * deploy post a filled honeypot the server no longer reads.
 */
export const HONEYPOT_FIELD = "contact_ref";

/** How long the form was open before it was sent, in ms, on the monotonic clock. */
export const ELAPSED_FIELD = "elapsedMs";

/**
 * Every route that declares `guard: { kind: "humanForm" }`.
 *
 * The guard asks Vercel BotID about each of these, and BotID can only answer
 * for a request the browser attached a challenge token to — which it does for
 * exactly the paths `initBotId` is given. A route the server checks but the
 * client does not protect classifies every visitor as a bot. So this list is
 * the type of the policy's `path` (a route cannot name a path missing from
 * it) and the list `instrumentation-client.ts` passes to `initBotId`; and
 * `form-guard.test.ts` checks that each route file declaring the guard names
 * its own path.
 */
export const HUMAN_FORM_PATHS = ["/api/contact", "/api/newsletter/subscribe"] as const;

export type HumanFormPath = (typeof HUMAN_FORM_PATHS)[number];

/** `initBotId({ protect })`, derived from the list above rather than written twice. */
export const BOTID_PROTECT = HUMAN_FORM_PATHS.map((path) => ({ path, method: "POST" }));
