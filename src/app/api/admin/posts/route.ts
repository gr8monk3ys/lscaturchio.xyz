import { RATE_LIMITS } from "@/lib/rate-limit";
import { withWriteRoute, writeError } from "@/lib/api/write-route";
import { getFile, commitToMain, type CommitFile } from "@/lib/admin/github";
import { postPublishSchema } from "@/lib/admin/schemas";
import {
  buildContentMdx,
  buildPageTsx,
  validateMdx,
  type PostMeta,
} from "@/lib/admin/blog-content";
import { toWebp } from "@/lib/admin/images";

export const POST = withWriteRoute(
  {
    limit: RATE_LIMITS.STANDARD,
    auth: { kind: "adminSession" },
    csrf: { kind: "required" },
    body: { kind: "json", schema: postPublishSchema },
    envelope: { kind: "standard" },
    errors: {
      log: "Admin post publish failed",
      component: "admin-posts",
      action: "POST",
      message: "Publish failed — nothing was committed",
    },
  },
  async ({ data: input }) => {
    const contentPath = `src/app/blog/${input.slug}/content.mdx`;
    const coverPath = `public/images/blog/${input.slug}.webp`;

    const meta: PostMeta = {
      title: input.title,
      description: input.description,
      date: input.date,
      updated: input.updated,
      tags: input.tags,
      syndication: input.syndication,
      series: input.series,
      seriesOrder: input.seriesOrder,
      stage: input.stage,
      // A new cover's path is known before it is converted, so the MDX can be
      // built (and compiled) without waiting for the image.
      image: input.coverImage ? `/images/blog/${input.slug}.webp` : input.image,
    };
    const mdx = buildContentMdx(meta, input.body);

    // The existence check, the cover conversion and the MDX compile do not
    // depend on each other; they used to run one after another.
    const [existing, coverData, mdxCheck] = await Promise.all([
      getFile(contentPath),
      input.coverImage
        ? toWebp(
            Buffer.from(input.coverImage.slice(input.coverImage.indexOf(",") + 1), "base64")
          ).then(({ data }) => data)
        : Promise.resolve(null),
      validateMdx(mdx),
    ]);

    if (existing && !input.overwrite) {
      throw writeError.conflict(`A post with slug "${input.slug}" already exists`);
    }
    if (!existing && input.overwrite) {
      throw writeError.notFound(`No post with slug "${input.slug}" to update`);
    }
    if (!mdxCheck.ok) throw writeError.badRequest(`MDX does not compile: ${mdxCheck.error}`);

    const files: CommitFile[] = [];
    const cover: CommitFile | null = coverData ? { path: coverPath, content: coverData } : null;

    files.push({ path: contentPath, content: mdx });
    if (!existing) {
      files.push({ path: `src/app/blog/${input.slug}/page.tsx`, content: buildPageTsx(input.slug) });
    }
    if (cover) files.push(cover);

    const verb = existing ? "update" : "add";
    const commit = await commitToMain(files, `content(blog): ${verb} ${input.slug} via portal`);
    return { commitUrl: commit.url, path: `/blog/${input.slug}` };
  }
);
