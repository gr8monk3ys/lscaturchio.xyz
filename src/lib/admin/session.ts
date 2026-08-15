import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ApiErrors } from "@/lib/api-response";
import { safeCompare } from "@/lib/api-auth";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const OAUTH_STATE_COOKIE = "admin_oauth_state";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.GITHUB_OAUTH_CLIENT_ID &&
      process.env.GITHUB_OAUTH_CLIENT_SECRET &&
      process.env.ADMIN_SESSION_SECRET &&
      process.env.GITHUB_CONTENT_TOKEN
  );
}

/** The one place that decides which GitHub account is the admin. */
export function allowedLogin(): string {
  return process.env.ADMIN_ALLOWED_LOGIN || "gr8monk3ys";
}

/** Shared attributes for every cookie the portal sets. */
export function adminCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge,
    path: "/",
  };
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionToken(login: string, now: number = Date.now()): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  const payload = Buffer.from(
    JSON.stringify({ login, exp: now + SESSION_TTL_MS })
  ).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(
  token: string | undefined,
  now: number = Date.now()
): { login: string } | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  if (!safeCompare(sig, sign(payload, secret))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      login?: unknown;
      exp?: unknown;
    };
    if (typeof data.login !== "string" || typeof data.exp !== "number") return null;
    if (data.exp < now) return null;
    if (data.login.toLowerCase() !== allowedLogin().toLowerCase()) return null;
    return { login: data.login };
  } catch {
    return null;
  }
}

export function requireAdmin(req: NextRequest): NextResponse | null {
  if (!isAdminConfigured()) {
    return ApiErrors.internalError("Admin portal is not configured");
  }
  const session = verifySessionToken(req.cookies.get(ADMIN_SESSION_COOKIE)?.value);
  if (!session) return ApiErrors.unauthorized();
  return null;
}

export async function getServerSession(): Promise<{ login: string } | null> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_SESSION_COOKIE)?.value);
}
