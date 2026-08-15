import { getFile } from "@/lib/admin/github";
import { NowEditor } from "@/components/admin/now-editor";
import type { NowContent } from "@/lib/now-data";

export default async function AdminNowPage() {
  let initial: NowContent | null = null;
  let loadError: string | null = null;
  try {
    const file = await getFile("src/data/now.json");
    if (file) initial = JSON.parse(file.text) as NowContent;
    else loadError = "src/data/now.json not found on main";
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Could not load /now content";
  }

  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold">Now page</h1>
      {initial ? (
        <NowEditor initial={initial} />
      ) : (
        <p className="text-sm text-red-600 dark:text-red-400">{loadError}</p>
      )}
    </main>
  );
}
