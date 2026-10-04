import { describe, expect, it } from "vitest";
import { MIN_FILL_MS, spamSignal } from "@/lib/contact-spam";

describe("spamSignal", () => {
  it("passes a form filled by hand", () => {
    expect(spamSignal({ website: "", elapsedMs: 45_000 })).toBeNull();
    expect(spamSignal({ elapsedMs: MIN_FILL_MS })).toBeNull();
  });

  it("flags any value in the honeypot, whatever its type", () => {
    expect(spamSignal({ website: "x", elapsedMs: 45_000 })).toBe("honeypot");
    expect(spamSignal({ website: 0, elapsedMs: 45_000 })).toBe("honeypot");
    expect(spamSignal({ website: null, elapsedMs: 45_000 })).toBe("honeypot");
  });

  it("flags a post that carries no fill time", () => {
    expect(spamSignal({ website: "" })).toBe("no-timing");
  });

  it("flags a form sent faster than a person can type it", () => {
    expect(spamSignal({ elapsedMs: MIN_FILL_MS - 1 })).toBe("too-fast");
    expect(spamSignal({ elapsedMs: -5 })).toBe("too-fast");
  });

  it("checks the honeypot before the clock", () => {
    expect(spamSignal({ website: "x", elapsedMs: 10 })).toBe("honeypot");
  });
});
