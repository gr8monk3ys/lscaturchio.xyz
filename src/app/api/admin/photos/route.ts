import { NextRequest } from "next/server";
import { withRateLimit } from "@/lib/with-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { logError } from "@/lib/logger";
import { apiSuccess, ApiErrors } from "@/lib/api-response";
import { requireAdmin } from "@/lib/admin/session";
import { getFile, commitToMain, type CommitFile } from "@/lib/admin/github";
import { photoEntriesSchema } from "@/lib/admin/schemas";
import { slugify } from "@/lib/admin/blog-content";
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
    const parsed = photoEntriesSchema.safeParse(JSON.parse(entriesRaw));
    if (!parsed.success) {
      return ApiErrors.badRequest(parsed.error.issues[0]?.message || "Invalid entries");
    }
    const entries = parsed.data;

    const uploads = form.getAll("files").filter((f): f is File => f instanceof File);
    if (uploads.length !== entries.length) {
      return ApiErrors.badRequest("Each uploaded file needs exactly one metadata entry");
    }

    const current = await getFile("src/data/photos.json");
    const photos = JSON.parse(current?.text ?? "[]") as Photo[];

    const files: CommitFile[] = [];
    const added: string[] = [];
    for (let i = 0; i < uploads.length; i++) {
      const upload = uploads[i];
      const entry = entries[i];
      if (upload.size > MAX_UPLOAD_BYTES) {
        return ApiErrors.badRequest(
          `${upload.name} exceeds ${MAX_UPLOAD_BYTES / 1024 / 1024}MB`
        );
      }
      const base = slugify(entry.filename.replace(/\.[^.]+$/, ""));
      const src = `/images/photos/${entry.category}/${base}.webp`;
      if (photos.some((p) => p.src === src)) {
        return ApiErrors.conflict(`${src} already exists in the gallery`);
      }
      const { data, aspectRatio } = await toWebp(Buffer.from(await upload.arrayBuffer()));
      files.push({ path: `public/images/photos/${entry.category}/${base}.webp`, content: data });
      photos.push({
        id: `${entry.category}-${base}`,
        src,
        alt: entry.alt,
        category: entry.category,
        camera: entry.camera,
        lens: entry.lens,
        settings: entry.settings,
        recipe: entry.recipe,
        location: entry.location,
        date: entry.date,
        aspectRatio,
      });
      added.push(src);
    }
    files.push({ path: "src/data/photos.json", content: `${JSON.stringify(photos, null, 2)}\n` });

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
