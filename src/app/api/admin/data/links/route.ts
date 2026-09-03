import { makeJsonContentPut, LINKS_JSON_PATH } from "@/lib/admin/json-content";
import { linksContentSchema } from "@/lib/admin/schemas";

export const PUT = makeJsonContentPut({
  filePath: LINKS_JSON_PATH,
  schema: linksContentSchema,
  commitMessage: "content(links): update /links via portal",
  logLabel: "links",
});
