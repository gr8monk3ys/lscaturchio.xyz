import { loadJsonFromMain, NOW_JSON_PATH } from "@/lib/admin/json-content";
import { NowEditor } from "@/components/admin/now-editor";
import type { NowContent } from "@/lib/admin/schemas";

export default async function AdminNowPage() {
  const { data, error } = await loadJsonFromMain<NowContent>(NOW_JSON_PATH);

  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold">Now page</h1>
      {data ? (
        <NowEditor initial={data} />
      ) : (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </main>
  );
}
