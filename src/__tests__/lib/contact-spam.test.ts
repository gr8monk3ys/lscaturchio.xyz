import { describe, expect, it } from "vitest";
import { MIN_FILL_MS, spamSignal } from "@/lib/contact-spam";

describe("spamSignal", () => {
  it("passes a form filled by hand", () => {
    expect(spamSignal({ contact_ref: "", elapsedMs: 45_000 })).toBeNull();
    expect(spamSignal({ elapsedMs: MIN_FILL_MS })).toBeNull();
  });

  it("flags any value in the honeypot, whatever its type", () => {
    expect(spamSignal({ contact_ref: "x", elapsedMs: 45_000 })).toBe("honeypot");
    expect(spamSignal({ contact_ref: 0, elapsedMs: 45_000 })).toBe("honeypot");
    expect(spamSignal({ contact_ref: null, elapsedMs: 45_000 })).toBe("honeypot");
  });

  it("flags a form sent faster than a person can type it", () => {
    expect(spamSignal({ elapsedMs: MIN_FILL_MS - 1 })).toBe("too-fast");
    expect(spamSignal({ elapsedMs: -5 })).toBe("too-fast");
  });

  // The previous bundle never sent a fill time, and a tab opened before a
  // deploy still runs it. Dropping that silently would lose a real message.
  it("does not treat a missing fill time as spam", () => {
    expect(spamSignal({ contact_ref: "" })).toBeNull();
    expect(spamSignal({})).toBeNull();
  });

  it("checks the honeypot before the clock", () => {
    expect(spamSignal({ contact_ref: "x", elapsedMs: 10 })).toBe("honeypot");
  });
});
