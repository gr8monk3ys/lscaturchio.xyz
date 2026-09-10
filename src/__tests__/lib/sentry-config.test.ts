import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * `sentry.client.config.ts` must stay deleted.
 *
 * It was not merely dead. `instrumentation-client.ts` superseded it and
 * records, in a comment, why Session Replay was removed: it recorded 10% of
 * reader sessions and 100% of sessions that hit an error, which the privacy
 * policy never disclosed, and it was the bulk of a 251KB gzipped chunk that
 * every route loaded. The old file was left on disk still carrying
 * `replaysOnErrorSampleRate: 1.0`.
 *
 * The Sentry SDK prints a deprecation warning on every build saying that under
 * Turbopack `sentry.client.config.ts` "will no longer work" — but the failure
 * mode before that is worse than not working: while both files exist, the
 * toolchain has two client configs to choose between, and one of them turns
 * session recording back on. A privacy decision should not depend on which
 * bundler is in use.
 *
 * The server and edge configs are a different matter and stay: those are still
 * the supported path for the Node and edge runtimes.
 */
describe("sentry client config", () => {
  it("does not exist, so replay cannot come back through the back door", () => {
    const stale = path.join(process.cwd(), "sentry.client.config.ts");

    expect(
      fs.existsSync(stale),
      [
        "sentry.client.config.ts is back.",
        "It superseded-and-was-superseded-by instrumentation-client.ts, and the",
        "version that keeps reappearing enables replaysOnErrorSampleRate: 1.0 —",
        "recording every session that hits an error, undisclosed.",
        "Put client Sentry config in instrumentation-client.ts.",
      ].join("\n")
    ).toBe(false);
  });

  it("keeps replay off in the config that is actually live", () => {
    const live = fs.readFileSync(
      path.join(process.cwd(), "instrumentation-client.ts"),
      "utf-8"
    );

    // Not a comment mentioning replay — an actual sample-rate setting.
    const enabled = /replays(OnError|Session)SampleRate\s*:\s*(?!0\b)/.test(live);

    expect(
      enabled,
      "instrumentation-client.ts sets a non-zero replay sample rate. Session recording is not disclosed in the privacy policy."
    ).toBe(false);
  });
});
