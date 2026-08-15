import { loadJsonFromMain, LINKS_JSON_PATH } from "@/lib/admin/json-content";
import { LinksEditor } from "@/components/admin/links-editor";
import type { LinksContent } from "@/types/links";

export default async function AdminLinksPage() {
  const { data, error } = await loadJsonFromMain<LinksContent>(LINKS_JSON_PATH);

  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold">Links</h1>
      {data ? (
        <LinksEditor initial={data} />
      ) : (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </main>
  );
}
