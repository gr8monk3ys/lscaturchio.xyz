import { NextRequest } from "next/server";
import { withRateLimit } from "@/lib/with-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { logError } from "@/lib/logger";
import { parseBody } from "@/lib/validations";
import { apiSuccess, ApiErrors } from "@/lib/api-response";
import { requireAdmin } from "@/lib/admin/session";
import { getFile, commitToMain } from "@/lib/admin/github";
import { linksContentSchema } from "@/lib/admin/schemas";

const FILE_PATH = "src/data/links.json";

async function getHandler(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;
  try {
    const file = await getFile(FILE_PATH);
    if (!file) return ApiErrors.notFound(`${FILE_PATH} not found on main`);
    return apiSuccess(JSON.parse(file.text));
  } catch (error) {
    logError("Admin links fetch failed", error, { component: "admin-data", action: "GET links" });
    return ApiErrors.internalError("Could not load current content");
  }
}

async function putHandler(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;
  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;
  try {
    const parsed = parseBody(linksContentSchema, await req.json());
    if (!parsed.success) return ApiErrors.badRequest(parsed.error);
    const commit = await commitToMain(
      [{ path: FILE_PATH, content: `${JSON.stringify(parsed.data, null, 2)}\n` }],
      "content(links): update /links via portal"
    );
    return apiSuccess({ commitUrl: commit.url });
  } catch (error) {
    logError("Admin links publish failed", error, { component: "admin-data", action: "PUT links" });
    return ApiErrors.internalError("Publish failed — nothing was committed");
  }
}

export const GET = withRateLimit(getHandler, RATE_LIMITS.STANDARD);
export const PUT = withRateLimit(putHandler, RATE_LIMITS.STANDARD);
