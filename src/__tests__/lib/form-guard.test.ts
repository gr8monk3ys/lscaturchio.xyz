/**
 * The human form guard at its own interface: the rules, the BotID adapters,
 * and the one invariant nothing at runtime can check — that every route the
 * server guards is a route the browser attaches a BotID token to.
 *
 * What the guard does to a real request (the envelope a dropped submission
 * gets, the empty outbox, where it runs relative to Zod) is pinned through
 * the real write chain in `src/__tests__/api/write-chain.test.ts`.
 */

import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("botid/server", () => ({
  checkBotId: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
  logNotice: vi.fn(),
}));

import { checkBotId } from "botid/server";
import { installBotClassifier, runGuard, type GuardPolicy } from "@/lib/form-guard/guard";
import { BOTID_PROTECT, HUMAN_FORM_PATHS } from "@/lib/form-guard/shared";
import { logError, logNotice } from "@/lib/logger";

const context = { component: "contact", action: "POST" };

const policy: GuardPolicy<{ message: string }> = {
  kind: "humanForm",
  path: "/api/contact",
  minFillMs: 3000,
  refusal: "This message was flagged as automated and was not sent.",
  dropped: { message: "sent" },
};

type Verdict = Awaited<ReturnType<typeof checkBotId>>;
function verdict(isBot: boolean): Verdict {
  return { isHuman: !isBot, isBot, isVerifiedBot: false, bypassed: false } as Verdict;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("runGuard: the rules", () => {
  const classifier = vi.fn(async () => false);
  let restore: () => void;
  beforeEach(() => {
    classifier.mockClear();
    restore = installBotClassifier(classifier);
  });
  afterEach(() => restore());

  it("passes a form filled by hand, after asking the classifier", async () => {
    expect(await runGuard(policy, { contact_ref: "", elapsedMs: 45_000 }, context)).toEqual({
      kind: "pass",
    });
    expect(await runGuard(policy, { elapsedMs: 3000 }, context)).toEqual({ kind: "pass" });
    expect(classifier).toHaveBeenCalledTimes(2);
  });

  it("drops any value in the honeypot, answering with the policy's success value", async () => {
    for (const value of ["x", 0, null, {}]) {
      expect(await runGuard(policy, { contact_ref: value, elapsedMs: 45_000 }, context)).toEqual({
        kind: "drop",
        answer: { message: "sent" },
      });
    }
    expect(logNotice).toHaveBeenCalledWith("[contact] dropped submission: honeypot");
    expect(classifier).not.toHaveBeenCalled();
  });

  it("drops a form sent faster than the policy's floor, honeypot first", async () => {
    expect((await runGuard(policy, { elapsedMs: 2999 }, context)).kind).toBe("drop");
    expect(logNotice).toHaveBeenLastCalledWith("[contact] dropped submission: too-fast");

    await runGuard(policy, { contact_ref: "x", elapsedMs: 10 }, context);
    expect(logNotice).toHaveBeenLastCalledWith("[contact] dropped submission: honeypot");
  });

  // A tab opened before a deploy runs the previous bundle, which may never
  // send a fill time. Dropping it would lose a real message while saying it
  // arrived; BotID is the check for a bare script.
  it("does not treat a missing or non-numeric fill time as a signal", async () => {
    for (const body of [{}, { elapsedMs: "soon" }, undefined, "not an object"]) {
      expect(await runGuard(policy, body, context)).toEqual({ kind: "pass" });
    }
    expect(classifier).toHaveBeenCalledTimes(4);
  });

  it("refuses, visibly, what the classifier calls a bot", async () => {
    classifier.mockResolvedValueOnce(true);
    expect(await runGuard(policy, { elapsedMs: 45_000 }, context)).toEqual({
      kind: "refuse",
      refusal: { status: 403, error: policy.refusal },
    });
    expect(classifier).toHaveBeenCalledWith(context);
  });

  it("does nothing for a route that declares none", async () => {
    const none: GuardPolicy = { kind: "none", reason: "test" };
    expect(await runGuard(none, { contact_ref: "x", elapsedMs: 0 }, context)).toEqual({
      kind: "pass",
    });
    expect(classifier).not.toHaveBeenCalled();
  });
});

describe("runGuard: the BotID adapters", () => {
  const originalVercel = process.env.VERCEL;
  afterEach(() => {
    if (originalVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = originalVercel;
  });

  const human = { contact_ref: "", elapsedMs: 45_000 };

  it("asks Vercel BotID on Vercel, and uses its verdict", async () => {
    process.env.VERCEL = "1";
    vi.mocked(checkBotId).mockResolvedValueOnce(verdict(true));
    expect((await runGuard(policy, human, context)).kind).toBe("refuse");

    vi.mocked(checkBotId).mockResolvedValueOnce(verdict(false));
    expect((await runGuard(policy, human, context)).kind).toBe("pass");
  });

  // `checkBotId` in a production build off Vercel throws for want of an OIDC
  // token; CI's E2E server is exactly that build.
  it("lets everyone through off Vercel, without asking", async () => {
    delete process.env.VERCEL;
    expect((await runGuard(policy, human, context)).kind).toBe("pass");
    expect(checkBotId).not.toHaveBeenCalled();
  });

  it("fails open, and loudly, when BotID throws", async () => {
    process.env.VERCEL = "1";
    const failure = new Error("The 'x-vercel-oidc-token' header is missing");
    vi.mocked(checkBotId).mockRejectedValueOnce(failure);

    expect((await runGuard(policy, human, context)).kind).toBe("pass");
    expect(logError).toHaveBeenCalledWith(
      "BotID check failed; request allowed through",
      failure,
      context
    );
  });
});

/**
 * A route the server asks BotID about but the browser never attached a token
 * for classifies every visitor as a bot — a contact form that refuses
 * everyone. The policy's `path` is typed as a member of `HUMAN_FORM_PATHS`,
 * so a route cannot name a path the list lacks; these check the two things
 * the type cannot: that the path a route names is its own, and that the
 * browser is actually handed the list.
 */
describe("the BotID protect list", () => {
  const root = process.cwd();
  const API_DIR = path.join(root, "src", "app", "api");
  const HUMAN_FORM = /kind:\s*["']humanForm["']/;

  function routeFiles(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return routeFiles(full);
      return entry.name === "route.ts" ? [full] : [];
    });
  }

  /** `src/app/api/newsletter/subscribe/route.ts` -> `/api/newsletter/subscribe`. */
  function urlPath(file: string): string {
    return "/" + path.relative(path.join(root, "src", "app"), path.dirname(file)).split(path.sep).join("/");
  }

  const guarded = routeFiles(API_DIR)
    .map((file) => ({ file, source: fs.readFileSync(file, "utf8") }))
    .filter(({ source }) => HUMAN_FORM.test(source));

  // Both directions: a guarded route missing from the list refuses every
  // visitor; a listed path no route guards makes the browser solve a
  // challenge nobody reads.
  it("guards exactly the routes the list protects", () => {
    expect(guarded.map(({ file }) => urlPath(file)).sort()).toEqual([...HUMAN_FORM_PATHS].sort());
  });

  it("each guarded route names its own path in its policy", () => {
    for (const { file, source } of guarded) {
      // The policy is written `kind: "humanForm", path: "..."`, in that order.
      const declared = source.match(/kind:\s*["']humanForm["'],\s*path:\s*["']([^"']+)["']/)?.[1];
      expect(declared, file).toBe(urlPath(file));
    }
  });

  it("hands the browser every guarded path, for POST", () => {
    expect(BOTID_PROTECT).toEqual(HUMAN_FORM_PATHS.map((p) => ({ path: p, method: "POST" })));
  });

  it("instrumentation-client.ts passes the imported list to initBotId, not its own", () => {
    const source = fs.readFileSync(path.join(root, "instrumentation-client.ts"), "utf8");
    expect(source).toMatch(
      /import\s*\{\s*BOTID_PROTECT\s*\}\s*from\s*["']@\/lib\/form-guard\/shared["']/
    );
    expect(source).toMatch(/initBotId\(\s*\{\s*protect:\s*BOTID_PROTECT\s*\}\s*\)/);
    expect(source).not.toMatch(/["']\/api\//);
  });
});
