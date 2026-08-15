import { NextRequest } from "next/server";
import { withRateLimit } from "@/lib/with-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { logError } from "@/lib/logger";
import { parseBody } from "@/lib/validations";
import { apiSuccess, ApiErrors } from "@/lib/api-response";
import { requireAdmin } from "@/lib/admin/session";
import { getFile, commitToMain, type CommitFile } from "@/lib/admin/github";
import { jsonFileContent, PHOTOS_JSON_PATH } from "@/lib/admin/json-content";
import { photoEntriesSchema } from "@/lib/admin/schemas";
import { slugify } from "@/lib/admin/slugify";
import { toWebp } from "@/lib/admin/images";
import type { Photo } from "@/constants/photos";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

async function handler(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;
  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;

  try {
    const form = await req.formData();
    const entriesRaw = form.get("entries");
    if (typeof entriesRaw !== "string") return ApiErrors.missingField("entries");
    const parsed = parseBody(photoEntriesSchema, JSON.parse(entriesRaw));
    if (!parsed.success) return ApiErrors.badRequest(parsed.error);
    const entries = parsed.data;

    const uploads = form.getAll("files").filter((f): f is File => f instanceof File);
    if (uploads.length !== entries.length) {
      return ApiErrors.badRequest("Each uploaded file needs exactly one metadata entry");
    }

    const current = await getFile(PHOTOS_JSON_PATH);
    const photos = JSON.parse(current?.text ?? "[]") as Photo[];

    // Validate everything cheaply before the expensive sharp conversions.
    const targets = entries.map((entry, i) => {
      const base = slugify(entry.filename.replace(/\.[^.]+$/, ""));
      return { entry, upload: uploads[i], base, src: `/images/photos/${entry.category}/${base}.webp` };
    });
    for (const t of targets) {
      if (t.upload.size > MAX_UPLOAD_BYTES) {
        return ApiErrors.badRequest(`${t.upload.name} exceeds ${MAX_UPLOAD_BYTES / 1024 / 1024}MB`);
      }
      if (photos.some((p) => p.src === t.src)) {
        return ApiErrors.conflict(`${t.src} already exists in the gallery`);
      }
    }

    const converted = await Promise.all(
      targets.map(async (t) => ({ t, webp: await toWebp(Buffer.from(await t.upload.arrayBuffer())) }))
    );

    const files: CommitFile[] = [];
    const added: string[] = [];
    for (const { t, webp } of converted) {
      files.push({ path: `public/images/photos/${t.entry.category}/${t.base}.webp`, content: webp.data });
      photos.push({
        id: `${t.entry.category}-${t.base}`,
        src: t.src,
        alt: t.entry.alt,
        category: t.entry.category,
        camera: t.entry.camera,
        lens: t.entry.lens,
        settings: t.entry.settings,
        recipe: t.entry.recipe,
        location: t.entry.location,
        date: t.entry.date,
        aspectRatio: webp.aspectRatio,
      });
      added.push(t.src);
    }
    files.push({ path: PHOTOS_JSON_PATH, content: jsonFileContent(photos) });

    const commit = await commitToMain(
      files,
      `content(photos): add ${added.length} photo(s) via portal`
    );
    return apiSuccess({ commitUrl: commit.url, added });
  } catch (error) {
    logError("Admin photo publish failed", error, { component: "admin-photos", action: "POST" });
    return ApiErrors.internalError("Publish failed — nothing was committed");
  }
}

export const POST = withRateLimit(handler, RATE_LIMITS.STANDARD);
