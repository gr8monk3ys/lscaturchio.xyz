/**
 * The human form guard: is this submission from a person filling in a form?
 *
 * A write route opts in with `guard: { kind: "humanForm", ... }` and
 * `withWriteRoute` runs it after Zod, before the handler. Everything it needs
 * to know is here — the fields it reads, the rules, the log line, the BotID
 * call — so a route declares a policy and nothing else.
 *
 * The contact form was receiving submissions like "nwEPHTexpjukzPzPkT" from
 * rotating Gmail dot-variants: scripts that fill every field they find and
 * post within a second of loading the page. Neither the per-IP rate limit
 * (bots rotate IPs) nor the Origin check (a script sets any header it likes)
 * stops that. Three checks do, in order:
 *
 *  1. a honeypot input that is off-screen, `aria-hidden` and out of the tab
 *     order, so only something filling fields blindly puts text in it;
 *  2. how long the form was open before it was sent (`elapsedMs`, measured by
 *     the browser on a monotonic clock), against the policy's `minFillMs`;
 *  3. Vercel BotID's verdict on the request.
 *
 * 1 and 2 cannot plausibly trip for a person, so a submission that trips them
 * is DROPPED: answered with the route's normal success envelope (the policy's
 * `dropped` value) and never handled, so a bot iterating on its payload learns
 * nothing. 3 can misjudge a person, so it is REFUSED visibly with a 403 the
 * form shows, and the reader knows to use email instead.
 *
 * A missing `elapsedMs` is deliberately NOT a signal. A tab opened before a
 * deploy runs the previous bundle, which may never send one, and dropping its
 * message silently would lose a real enquiry while saying it arrived. A
 * script posting to the API directly also sends none; BotID refuses that one.
 *
 * The guard reads its two fields from the decoded body itself, not from the
 * route's Zod output. Routes' schemas therefore never declare them, and cannot
 * strip them by forgetting to: when `contactFormSchema` had to list
 * `contact_ref` so `z.object` kept it, renaming the field without the schema
 * key would have switched the honeypot off with every test still green.
 *
 * Why after Zod: a person with a malformed email must be told so, beside the
 * field, before anything can decide to answer them with a silent success. The
 * guard's own fields never produce a field error, because no schema sees them
 * — a 400 naming the honeypot would tell a bot which part of its payload to fix.
 */

import { checkBotId } from "botid/server";
import type { Refusal } from "@/lib/api-response";
import { logError, logNotice } from "@/lib/logger";
import { ELAPSED_FIELD, HONEYPOT_FIELD, type HumanFormPath } from "./shared";

/**
 * Whether a write route checks that a person sent it. `none` says why not, like
 * every other deviation in `withWriteRoute`.
 */
export type GuardPolicy<TOut = unknown> =
  | {
      kind: "humanForm";
      /** This route's own path; must be in `HUMAN_FORM_PATHS` (see shared.ts). */
      path: HumanFormPath;
      /** The fastest a person can fill this form in by hand. Below it, dropped. */
      minFillMs: number;
      /** The 403's message when BotID says bot. The reader sees it. */
      refusal: string;
      /** What a dropped submission is answered with: the route's success value. */
      dropped: TOut;
    }
  | { kind: "none"; reason: string };

type GuardContext = { component: string; action: string };

/** Asks whether the current request came from a bot. */
type BotClassifier = (context: GuardContext) => Promise<boolean>;

/**
 * Vercel BotID. Fails open: if the classifier is unreachable or the project's
 * OIDC token is missing, the submission goes through and the failure goes to
 * Sentry — losing a real enquiry costs more than letting one spam through, and
 * the honeypot and the clock still ran.
 */
const vercelBotId: BotClassifier = async (context) => {
  try {
    const verification = await checkBotId();
    return verification.isBot;
  } catch (error) {
    logError("BotID check failed; request allowed through", error, context);
    return false;
  }
};

/**
 * Off Vercel there is no classifier to ask — `checkBotId` in a production
 * build without Vercel's OIDC token throws — so a local `next start`, CI's
 * E2E server and the test suite let everyone through.
 */
const allowEveryone: BotClassifier = async () => false;

let installed: BotClassifier | null = null;

function activeClassifier(): BotClassifier {
  if (installed) return installed;
  return process.env.VERCEL ? vercelBotId : allowEveryone;
}

/**
 * Replace the bot classifier, returning a function that restores the default.
 * For tests; nothing in the app calls it.
 */
export function installBotClassifier(classifier: BotClassifier): () => void {
  const previous = installed;
  installed = classifier;
  return () => {
    installed = previous;
  };
}

type SpamSignal = "honeypot" | "too-fast";

function spamSignal(submitted: unknown, minFillMs: number): SpamSignal | null {
  const body: Record<string, unknown> =
    typeof submitted === "object" && submitted !== null
      ? (submitted as Record<string, unknown>)
      : {};

  // Any value at all, whatever its type: a person never reaches the input.
  const honeypot = body[HONEYPOT_FIELD];
  if (honeypot !== undefined && honeypot !== "") return "honeypot";

  // Not a number is the same as absent — see the module comment.
  const elapsed = body[ELAPSED_FIELD];
  if (typeof elapsed === "number" && elapsed < minFillMs) return "too-fast";

  return null;
}

type GuardOutcome<TOut> =
  | { kind: "pass" }
  /** Answer `answer` as the route's success, and do not run the handler. */
  | { kind: "drop"; answer: TOut }
  | { kind: "refuse"; refusal: Refusal };

/**
 * The verdict on one submission. `submitted` is the decoded request body as
 * the client sent it, before Zod.
 */
export async function runGuard<TOut>(
  policy: GuardPolicy<TOut>,
  submitted: unknown,
  context: GuardContext
): Promise<GuardOutcome<TOut>> {
  if (policy.kind === "none") return { kind: "pass" };

  const signal = spamSignal(submitted, policy.minFillMs);
  if (signal) {
    // `logNotice`: `logInfo` prints only in development and `logWarn` raises
    // a Sentry event per bot, so this line is how the count shows up in
    // Vercel's runtime logs.
    logNotice(`[${context.component}] dropped submission: ${signal}`);
    return { kind: "drop", answer: policy.dropped };
  }

  if (await activeClassifier()(context)) {
    return { kind: "refuse", refusal: { status: 403, error: policy.refusal } };
  }

  return { kind: "pass" };
}
