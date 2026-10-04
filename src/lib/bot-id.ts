import { checkBotId } from "botid/server";
import { logError } from "@/lib/logger";

/**
 * Vercel BotID, for the public write routes a script can reach directly.
 *
 * The client half is `initBotId` in `instrumentation-client.ts`: it attaches a
 * challenge token to requests on the paths it is told to protect, and this
 * reads the verdict. A route listed here but not there classifies every
 * visitor as a bot, so the two lists have to move together.
 *
 * Off Vercel there is no classifier to ask — `checkBotId` in a production
 * build without Vercel's OIDC token throws — so a local `next start` and CI's
 * E2E server skip the check rather than reject everything.
 *
 * Fails open. If the classifier is unreachable or the project's OIDC token is
 * missing, the message goes through and the failure goes to Sentry: losing a
 * real enquiry costs more than letting one spam through, and the honeypot in
 * `contact-spam.ts` still runs either way.
 */
export async function isBotRequest(context: {
  component: string;
  action: string;
}): Promise<boolean> {
  if (!process.env.VERCEL) return false;

  try {
    const verification = await checkBotId();
    return verification.isBot;
  } catch (error) {
    logError("BotID check failed; request allowed through", error, context);
    return false;
  }
}
