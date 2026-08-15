import { describe, it, expect, beforeEach } from "vitest";
import {
  createSessionToken,
  verifySessionToken,
} from "@/lib/admin/session";

describe("admin session", () => {
  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = "test-secret";
    process.env.ADMIN_ALLOWED_LOGIN = "gr8monk3ys";
  });

  it("round-trips a valid token", () => {
    const token = createSessionToken("gr8monk3ys");
    expect(verifySessionToken(token)).toEqual({ login: "gr8monk3ys" });
  });

  it("rejects a tampered signature", () => {
    const token = createSessionToken("gr8monk3ys");
    expect(verifySessionToken(`${token.slice(0, -2)}xx`)).toBeNull();
  });

  it("rejects an expired token", () => {
    const token = createSessionToken("gr8monk3ys", Date.now() - 8 * 24 * 60 * 60 * 1000);
    expect(verifySessionToken(token)).toBeNull();
  });

  it("rejects a login not on the allowlist", () => {
    const token = createSessionToken("someone-else");
    expect(verifySessionToken(token)).toBeNull();
  });

  it("rejects everything when the secret is unset", () => {
    const token = createSessionToken("gr8monk3ys");
    delete process.env.ADMIN_SESSION_SECRET;
    expect(verifySessionToken(token)).toBeNull();
  });
});
