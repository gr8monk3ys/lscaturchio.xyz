/**
 * The path prefix `withBotId` (next.config.mjs) rewrites to Vercel's BotID
 * challenge and proxy endpoints.
 *
 * Kept out of `form-guard/guard.ts` because `src/proxy.ts` imports it, and
 * the proxy bundle should not pull in `botid/server`. `proxy.test.ts` checks this
 * against the rewrites `withBotId` actually generates, so a package bump that
 * moves the path fails a test instead of breaking the challenge.
 */
export const BOTID_PATH_PREFIX = "/149e9513-01fa-4fb0-aad4-566afd725d1b/";
