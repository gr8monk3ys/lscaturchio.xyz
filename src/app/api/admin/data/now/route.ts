import { makeJsonContentPut, NOW_JSON_PATH } from "@/lib/admin/json-content";
import { nowContentSchema } from "@/lib/admin/schemas";

export const PUT = makeJsonContentPut({
  filePath: NOW_JSON_PATH,
  schema: nowContentSchema,
  commitMessage: "content(now): update /now via portal",
  logLabel: "now",
});
