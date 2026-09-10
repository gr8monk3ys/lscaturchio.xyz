import { loadJsonFromMain, LINKS_JSON_PATH } from "@/lib/admin/json-content";
import { LinksEditor } from "@/components/admin/links-editor";
import type { LinksContent } from "@/types/links";

export default async function AdminLinksPage() {
  const { data, error } = await loadJsonFromMain<LinksContent>(LINKS_JSON_PATH);

  return (
    <main>
      <h1 className="mb-6 text-page-title">Links</h1>
      {data ? (
        <LinksEditor initial={data} />
      ) : (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </main>
  );
}
