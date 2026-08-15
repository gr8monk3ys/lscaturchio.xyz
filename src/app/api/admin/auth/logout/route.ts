import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/lib/with-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/session";

async function handler(req: NextRequest): Promise<NextResponse> {
  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;
  const res = NextResponse.redirect(new URL("/admin/login", req.url), { status: 303 });
  res.cookies.delete(ADMIN_SESSION_COOKIE);
  return res;
}

export const POST = withRateLimit(handler, RATE_LIMITS.STANDARD);
