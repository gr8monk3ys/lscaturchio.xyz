import { getFile } from "@/lib/admin/github";
import { LinksEditor } from "@/components/admin/links-editor";
import type { LinksContent } from "@/types/links";

export default async function AdminLinksPage() {
  let initial: LinksContent | null = null;
  let loadError: string | null = null;
  try {
    const file = await getFile("src/data/links.json");
    if (file) initial = JSON.parse(file.text) as LinksContent;
    else loadError = "src/data/links.json not found on main";
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Could not load /links content";
  }

  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold">Links</h1>
      {initial ? (
        <LinksEditor initial={initial} />
      ) : (
        <p className="text-sm text-red-600 dark:text-red-400">{loadError}</p>
      )}
    </main>
  );
}
