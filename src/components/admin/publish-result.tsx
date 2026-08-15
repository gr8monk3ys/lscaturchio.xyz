export type PublishState =
  | { state: "idle" }
  | { state: "saving" }
  | { state: "done"; commitUrl: string; viewPath?: string }
  | { state: "error"; message: string };

export function PublishResult({ result }: { result: PublishState }) {
  if (result.state === "idle") return null;
  if (result.state === "saving") {
    return <p className="mt-4 text-sm text-muted-foreground">Publishing…</p>;
  }
  if (result.state === "error") {
    return (
      <p className="mt-4 whitespace-pre-wrap text-sm text-red-600 dark:text-red-400">
        {result.message}
      </p>
    );
  }
  return (
    <div className="mt-4 rounded-md border border-border bg-card p-4 text-sm">
      <p>
        Committed — live in ~2 minutes once Vercel deploys.{" "}
        <a
          href={result.commitUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          View commit
        </a>
        {result.viewPath && (
          <>
            {" · "}
            <a href={result.viewPath} className="underline">
              View page
            </a>
          </>
        )}
      </p>
    </div>
  );
}
