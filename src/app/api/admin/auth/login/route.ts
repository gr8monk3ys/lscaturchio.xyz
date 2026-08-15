import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/lib/with-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { isAdminConfigured, OAUTH_STATE_COOKIE } from "@/lib/admin/session";

async function handler(req: NextRequest): Promise<NextResponse> {
  if (!isAdminConfigured()) {
    return NextResponse.redirect(new URL("/admin/login?error=unconfigured", req.url));
  }
  const state = crypto.randomBytes(16).toString("hex");
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", process.env.GITHUB_OAUTH_CLIENT_ID as string);
  authorize.searchParams.set(
    "redirect_uri",
    new URL("/api/admin/auth/callback", req.url).toString()
  );
  authorize.searchParams.set("state", state);
  const res = NextResponse.redirect(authorize);
  res.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}

export const GET = withRateLimit(handler, RATE_LIMITS.NEWSLETTER);
