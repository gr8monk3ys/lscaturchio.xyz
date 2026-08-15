import { NextRequest } from "next/server";
import { withRateLimit } from "@/lib/with-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { logError } from "@/lib/logger";
import { parseBody } from "@/lib/validations";
import { apiSuccess, ApiErrors } from "@/lib/api-response";
import { requireAdmin } from "@/lib/admin/session";
import { getFile, commitToMain } from "@/lib/admin/github";
import { nowContentSchema } from "@/lib/admin/schemas";

const FILE_PATH = "src/data/now.json";

async function getHandler(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;
  try {
    const file = await getFile(FILE_PATH);
    if (!file) return ApiErrors.notFound(`${FILE_PATH} not found on main`);
    return apiSuccess(JSON.parse(file.text));
  } catch (error) {
    logError("Admin now fetch failed", error, { component: "admin-data", action: "GET now" });
    return ApiErrors.internalError("Could not load current content");
  }
}

async function putHandler(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;
  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;
  try {
    const parsed = parseBody(nowContentSchema, await req.json());
    if (!parsed.success) return ApiErrors.badRequest(parsed.error);
    const commit = await commitToMain(
      [{ path: FILE_PATH, content: `${JSON.stringify(parsed.data, null, 2)}\n` }],
      "content(now): update /now via portal"
    );
    return apiSuccess({ commitUrl: commit.url });
  } catch (error) {
    logError("Admin now publish failed", error, { component: "admin-data", action: "PUT now" });
    return ApiErrors.internalError("Publish failed — nothing was committed");
  }
}

export const GET = withRateLimit(getHandler, RATE_LIMITS.STANDARD);
export const PUT = withRateLimit(putHandler, RATE_LIMITS.STANDARD);
