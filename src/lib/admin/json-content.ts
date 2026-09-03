import type { ZodSchema } from "zod";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { withWriteRoute } from "@/lib/api/write-route";
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
 * Build the whole PUT route for a JSON content file: the standard write chain
 * (rate limit, admin session, CSRF, Zod, envelope) plus a single commit to
 * main. Export the result directly as the route's PUT.
 */
export function makeJsonContentPut(config: {
  filePath: string;
  schema: ZodSchema;
  commitMessage: string;
  logLabel: string;
}) {
  return withWriteRoute(
    {
      limit: RATE_LIMITS.STANDARD,
      auth: { kind: "adminSession" },
      csrf: { kind: "required" },
      body: { kind: "json", schema: config.schema },
      envelope: { kind: "standard" },
      errors: {
        log: `Admin ${config.logLabel} publish failed`,
        component: "admin-data",
        action: `PUT ${config.logLabel}`,
        message: "Publish failed — nothing was committed",
      },
    },
    async ({ data }) => {
      const commit = await commitToMain(
        [{ path: config.filePath, content: jsonFileContent(data) }],
        config.commitMessage
      );
      return { commitUrl: commit.url };
    }
  );
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
