import { NextRequest, NextResponse } from "next/server";
import type { ZodSchema } from "zod";
import { validateCsrf } from "@/lib/csrf";
import { logError } from "@/lib/logger";
import { parseBody } from "@/lib/validations";
import { apiSuccess, ApiErrors } from "@/lib/api-response";
import { requireAdmin } from "@/lib/admin/session";
import { getFile, commitToMain } from "@/lib/admin/github";

// The single source of truth for where portal-managed JSON lives. The PUT
// routes and the admin pages must agree on these or writes and reads split.
export const NOW_JSON_PATH = "src/data/now.json";
export const LINKS_JSON_PATH = "src/data/links.json";
export const PHOTOS_JSON_PATH = "src/data/photos.json";

/** Canonical formatting for JSON files the portal commits. */
export function jsonFileContent(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

/**
 * Build the PUT handler for a JSON content file: session gate, CSRF, Zod
 * validation, then a single commit to main. Wrap the result in withRateLimit
 * at the route.
 */
export function makeJsonContentPut(config: {
  filePath: string;
  schema: ZodSchema;
  commitMessage: string;
  logLabel: string;
}) {
  return async function handler(req: NextRequest): Promise<NextResponse> {
    const authError = requireAdmin(req);
    if (authError) return authError;
    const csrfError = validateCsrf(req);
    if (csrfError) return csrfError;
    try {
      const parsed = parseBody(config.schema, await req.json());
      if (!parsed.success) return ApiErrors.badRequest(parsed.error);
      const commit = await commitToMain(
        [{ path: config.filePath, content: jsonFileContent(parsed.data) }],
        config.commitMessage
      );
      return apiSuccess({ commitUrl: commit.url });
    } catch (error) {
      logError(`Admin ${config.logLabel} publish failed`, error, {
        component: "admin-data",
        action: `PUT ${config.logLabel}`,
      });
      return ApiErrors.internalError("Publish failed — nothing was committed");
    }
  };
}

/** Server-side loader the admin editor pages seed their forms from. */
export async function loadJsonFromMain<T>(
  path: string
): Promise<{ data: T; error: null } | { data: null; error: string }> {
  try {
    const file = await getFile(path);
    if (!file) return { data: null, error: `${path} not found on main` };
    return { data: JSON.parse(file.text) as T, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : `Could not load ${path}`,
    };
  }
}
