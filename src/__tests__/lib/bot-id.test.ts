import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("botid/server", () => ({
  checkBotId: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
}));

import { checkBotId } from "botid/server";
import { isBotRequest } from "@/lib/bot-id";
import { logError } from "@/lib/logger";

const context = { component: "contact", action: "POST" };
type Verdict = Awaited<ReturnType<typeof checkBotId>>;

function verdict(isBot: boolean): Verdict {
  return { isHuman: !isBot, isBot, isVerifiedBot: false, bypassed: false } as Verdict;
}

describe("isBotRequest", () => {
  const originalVercel = process.env.VERCEL;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.VERCEL = "1";
  });

  afterEach(() => {
    if (originalVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = originalVercel;
  });

  it("returns BotID's verdict on Vercel", async () => {
    vi.mocked(checkBotId).mockResolvedValueOnce(verdict(true));
    expect(await isBotRequest(context)).toBe(true);

    vi.mocked(checkBotId).mockResolvedValueOnce(verdict(false));
    expect(await isBotRequest(context)).toBe(false);
  });

  // `checkBotId` in a production build off Vercel throws for want of an OIDC
  // token; CI's E2E server is exactly that build.
  it("does not ask BotID off Vercel", async () => {
    delete process.env.VERCEL;

    expect(await isBotRequest(context)).toBe(false);
    expect(checkBotId).not.toHaveBeenCalled();
  });

  it("fails open, and loudly, when the classifier throws", async () => {
    const failure = new Error("The 'x-vercel-oidc-token' header is missing");
    vi.mocked(checkBotId).mockRejectedValueOnce(failure);

    expect(await isBotRequest(context)).toBe(false);
    expect(logError).toHaveBeenCalledWith(
      "BotID check failed; request allowed through",
      failure,
      context
    );
  });
});
