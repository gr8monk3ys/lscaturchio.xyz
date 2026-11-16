import Link from "next/link";
import type { AskSource } from "@/hooks/use-ask-conversation";

/**
 * The essays an answer came from, under the answer.
 *
 * An answer used to arrive with nothing to check it against, and when no model
 * was reachable the fallback pasted a passage with its URLs in brackets as
 * plain text. Both ask surfaces render this, so the list reads the same in the
 * drawer and on /chat.
 *
 * `grounded` decides the label, because the two cases are different claims:
 * essays the answer was drawn from, or only the nearest ones when nothing
 * matched. Calling the second kind a source would claim more than retrieval
 * found.
 */
export function AnswerSources({
  sources,
  grounded,
}: {
  sources?: AskSource[];
  grounded?: boolean;
}) {
  if (!sources || sources.length === 0) return null;

  return (
    <span className="mt-3 flex flex-col items-start gap-1.5 border-t border-border pt-3">
      <span className="label-mono">{grounded ? "Answered from" : "Closest essays"}</span>
      {sources.map((source) => (
        <Link
          key={source.url}
          href={source.url}
          prefetch={false}
          className="label-mono label-link normal-case tracking-normal text-start text-muted-foreground ink-underline transition-colors hover:text-primary"
        >
          {source.title}
        </Link>
      ))}
    </span>
  );
}
