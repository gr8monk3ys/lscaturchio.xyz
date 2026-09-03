import { RATE_LIMITS } from "@/lib/rate-limit";
import { withWriteRoute, writeError } from "@/lib/api/write-route";
import { getFile, commitToMain, type CommitFile } from "@/lib/admin/github";
import { jsonFileContent, PHOTOS_JSON_PATH } from "@/lib/admin/json-content";
import { photoEntriesSchema } from "@/lib/admin/schemas";
import { slugify } from "@/lib/admin/slugify";
import { toWebp } from "@/lib/admin/images";
import type { Photo } from "@/constants/photos";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export const POST = withWriteRoute(
  {
    limit: RATE_LIMITS.STANDARD,
    auth: { kind: "adminSession" },
    csrf: { kind: "required" },
    // Multipart: the image bytes ride alongside a JSON metadata field, which
    // is what the schema validates.
    body: { kind: "formData", jsonField: "entries", schema: photoEntriesSchema },
    envelope: { kind: "standard" },
    errors: {
      log: "Admin photo publish failed",
      component: "admin-photos",
      action: "POST",
      message: "Publish failed — nothing was committed",
    },
  },
  async ({ data: entries, form }) => {
    const uploads = (form?.getAll("files") ?? []).filter((f): f is File => f instanceof File);
    if (uploads.length !== entries.length) {
      throw writeError.badRequest("Each uploaded file needs exactly one metadata entry");
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
        throw writeError.badRequest(`${t.upload.name} exceeds ${MAX_UPLOAD_BYTES / 1024 / 1024}MB`);
      }
      if (photos.some((p) => p.src === t.src)) {
        throw writeError.conflict(`${t.src} already exists in the gallery`);
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
    return { commitUrl: commit.url, added };
  }
);
