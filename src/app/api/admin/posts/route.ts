import { NextRequest } from "next/server";
import { withRateLimit } from "@/lib/with-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { logError } from "@/lib/logger";
import { parseBody } from "@/lib/validations";
import { apiSuccess, ApiErrors } from "@/lib/api-response";
import { requireAdmin } from "@/lib/admin/session";
import { getFile, commitToMain, type CommitFile } from "@/lib/admin/github";
import { postPublishSchema } from "@/lib/admin/schemas";
import {
  buildContentMdx,
  buildPageTsx,
  validateMdx,
  type PostMeta,
} from "@/lib/admin/blog-content";
import { toWebp } from "@/lib/admin/images";

async function handler(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;
  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;

  try {
    const parsed = parseBody(postPublishSchema, await req.json());
    if (!parsed.success) return ApiErrors.badRequest(parsed.error);
    const input = parsed.data;

    const contentPath = `src/app/blog/${input.slug}/content.mdx`;
    const existing = await getFile(contentPath);
    if (existing && !input.overwrite) {
      return ApiErrors.conflict(`A post with slug "${input.slug}" already exists`);
    }
    if (!existing && input.overwrite) {
      return ApiErrors.notFound(`No post with slug "${input.slug}" to update`);
    }

    const meta: PostMeta = {
      title: input.title,
      description: input.description,
      date: input.date,
      tags: input.tags,
      series: input.series,
      seriesOrder: input.seriesOrder,
      stage: input.stage,
      image: input.image,
    };

    // Order matters for the commit: content.mdx, page.tsx (create only), cover.
    const files: CommitFile[] = [];
    let cover: CommitFile | null = null;
    if (input.coverImage) {
      const base64 = input.coverImage.slice(input.coverImage.indexOf(",") + 1);
      const { data } = await toWebp(Buffer.from(base64, "base64"));
      cover = { path: `public/images/blog/${input.slug}.webp`, content: data };
      meta.image = `/images/blog/${input.slug}.webp`;
    }

    const mdx = buildContentMdx(meta, input.body);
    const mdxCheck = await validateMdx(mdx);
    if (!mdxCheck.ok) return ApiErrors.badRequest(`MDX does not compile: ${mdxCheck.error}`);

    files.push({ path: contentPath, content: mdx });
    if (!existing) {
      files.push({ path: `src/app/blog/${input.slug}/page.tsx`, content: buildPageTsx(input.slug) });
    }
    if (cover) files.push(cover);

    const verb = existing ? "update" : "add";
    const commit = await commitToMain(files, `content(blog): ${verb} ${input.slug} via portal`);
    return apiSuccess({ commitUrl: commit.url, path: `/blog/${input.slug}` });
  } catch (error) {
    logError("Admin post publish failed", error, { component: "admin-posts", action: "POST" });
    return ApiErrors.internalError("Publish failed — nothing was committed");
  }
}

export const POST = withRateLimit(handler, RATE_LIMITS.STANDARD);
