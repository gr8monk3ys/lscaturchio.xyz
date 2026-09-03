import { NextResponse } from "next/server";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { withWriteRoute } from "@/lib/api/write-route";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/session";

export const POST = withWriteRoute(
  {
    limit: RATE_LIMITS.STANDARD,
    auth: {
      kind: "public",
      reason:
        "Clearing your own session cookie must work even when the session is already invalid; requiring a valid session to log out would strand the browser.",
    },
    csrf: { kind: "required" },
    body: { kind: "none", reason: "Logout carries no payload — the session cookie is the whole request." },
    envelope: {
      kind: "raw",
      reason: "Answers a browser form post with a 303 redirect to /admin/login, not a JSON document.",
    },
    errors: {
      log: "Admin logout failed",
      component: "admin-auth",
      action: "POST logout",
      message: "Logout failed",
    },
  },
  async ({ req }) => {
    const res = NextResponse.redirect(new URL("/admin/login", req.url), { status: 303 });
    res.cookies.delete(ADMIN_SESSION_COOKIE);
    return res;
  }
);
