import { getFile } from "@/lib/admin/github";
import { parseMeta, extractBody } from "@/lib/admin/blog-content";
import { PostEditor } from "@/components/admin/post-editor";

export default async function AdminEditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const file = await getFile(`src/app/blog/${slug}/content.mdx`);
  if (!file) {
    return (
      <main>
        <h1 className="text-2xl font-bold">Edit post</h1>
        <p className="mt-4 text-muted-foreground">No post found for &ldquo;{slug}&rdquo;.</p>
      </main>
    );
  }

  const meta = parseMeta(file.text);
  if (!meta) {
    return (
      <main>
        <h1 className="text-2xl font-bold">Edit post</h1>
        <p className="mt-4 text-muted-foreground">
          This post&apos;s meta block isn&apos;t in the machine-editable shape, so the portal
          won&apos;t edit it. Edit it in the repository instead.
        </p>
      </main>
    );
  }

  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold">Edit: {meta.title}</h1>
      <PostEditor
        initial={{
          slug,
          title: meta.title,
          description: meta.description,
          date: meta.date,
          tags: meta.tags,
          series: meta.series,
          seriesOrder: meta.seriesOrder,
          stage: meta.stage,
          image: meta.image,
          body: extractBody(file.text),
        }}
      />
    </main>
  );
}
