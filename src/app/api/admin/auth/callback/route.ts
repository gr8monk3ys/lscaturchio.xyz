import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/lib/with-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";
import {
  ADMIN_SESSION_COOKIE,
  OAUTH_STATE_COOKIE,
  adminCookieOptions,
  allowedLogin,
  createSessionToken,
  isAdminConfigured,
} from "@/lib/admin/session";

function loginRedirect(req: NextRequest, error: string): NextResponse {
  const res = NextResponse.redirect(new URL(`/admin/login?error=${error}`, req.url));
  res.cookies.delete(OAUTH_STATE_COOKIE);
  return res;
}

async function handler(req: NextRequest): Promise<NextResponse> {
  if (!isAdminConfigured()) return loginRedirect(req, "unconfigured");

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const cookieState = req.cookies.get(OAUTH_STATE_COOKIE)?.value;
  if (!code || !state || !cookieState || state !== cookieState) {
    return loginRedirect(req, "state");
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
        client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
        code,
      }),
    });
    const tokenData = (await tokenRes.json()) as { access_token?: string };
    if (!tokenRes.ok || !tokenData.access_token) return loginRedirect(req, "exchange");

    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const user = (await userRes.json()) as { login?: string };
    if (!userRes.ok || !user.login || user.login.toLowerCase() !== allowedLogin().toLowerCase()) {
      return loginRedirect(req, "denied");
    }

    const res = NextResponse.redirect(new URL("/admin", req.url));
    res.cookies.delete(OAUTH_STATE_COOKIE);
    res.cookies.set(
      ADMIN_SESSION_COOKIE,
      createSessionToken(user.login),
      adminCookieOptions(7 * 24 * 60 * 60)
    );
    return res;
  } catch (error) {
    logError("Admin OAuth callback failed", error, {
      component: "admin-auth",
      action: "callback",
    });
    return loginRedirect(req, "exchange");
  }
}

export const GET = withRateLimit(handler, RATE_LIMITS.ADMIN_AUTH);
