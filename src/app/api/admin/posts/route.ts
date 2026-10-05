import { withWriteRoute, writeError } from "@/lib/api/write-route";
import { getFile, commitToMain, type CommitFile } from "@/lib/admin/github";
import { postPublishSchema } from "@/lib/admin/schemas";
import {
  buildContentMdx,
  validateMdx,
  type PostMeta,
} from "@/lib/admin/blog-content";
import { toWebp } from "@/lib/admin/images";

export const POST = withWriteRoute(
  {
    limit: "ADMIN_WRITE",
    auth: { kind: "adminSession" },
    csrf: { kind: "required" },
    body: { kind: "json", schema: postPublishSchema },
    guard: { kind: "none", reason: "Admin-only; the session already proves the owner sent it." },
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
    const existing = await getFile(contentPath);
    if (existing && !input.overwrite) {
      throw writeError.conflict(`A post with slug "${input.slug}" already exists`);
    }
    if (!existing && input.overwrite) {
      throw writeError.notFound(`No post with slug "${input.slug}" to update`);
    }

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
      image: input.image,
    };

    // Order matters for the commit: content.mdx, then the cover. There is no
    // page.tsx to write: `src/app/blog/[slug]` renders any essay the catalogue
    // lists, so the content file is the whole post.
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
    if (!mdxCheck.ok) throw writeError.badRequest(`MDX does not compile: ${mdxCheck.error}`);

    files.push({ path: contentPath, content: mdx });
    if (cover) files.push(cover);

    const verb = existing ? "update" : "add";
    const commit = await commitToMain(files, `content(blog): ${verb} ${input.slug} via portal`);
    return { commitUrl: commit.url, path: `/blog/${input.slug}` };
  }
);
