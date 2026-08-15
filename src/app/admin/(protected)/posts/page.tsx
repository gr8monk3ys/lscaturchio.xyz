import Link from "next/link";
import { listBlogSlugs } from "@/lib/admin/github";

export default async function AdminPostsPage() {
  let slugs: string[] = [];
  let loadError: string | null = null;
  try {
    slugs = (await listBlogSlugs()).sort();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Could not list posts";
  }

  return (
    <main>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blog posts</h1>
        <Link
          href="/admin/posts/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          New post
        </Link>
      </div>
      {loadError ? (
        <p className="text-sm text-red-600 dark:text-red-400">{loadError}</p>
      ) : (
        <ul className="divide-y divide-border border-t border-border">
          {slugs.map((slug) => (
            <li key={slug}>
              <Link href={`/admin/posts/${slug}`} className="block py-2 text-sm hover:underline">
                {slug}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
