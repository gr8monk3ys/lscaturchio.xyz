"use client";

import Link from "next/link";

/**
 * The one rendering of a suggested question, for all three ask surfaces.
 *
 * There used to be three. The home masthead used wall-label links (the form
 * `DESIGN.md` specifies). `/chat` used four bordered, rounded, body-sans boxes
 * left-aligned in a vertical stack at 522 / 610 / 761 / 550px — a ragged
 * staircase, and the exact shape the document forbids by name: "Suggested
 * questions and tag lists are not chips at all: they are wall-label links…
 * not pills." The ask drawer used body-sans links prefixed with a `↳` glyph,
 * which is a Unicode character standing in for an icon.
 *
 * So the flagship interaction was the messiest block on the site, and a reader
 * who met it twice met it in two costumes. One component, one voice.
 *
 * The element differs by surface because the fallback does. On the masthead it
 * must be a real `<Link>` to `/chat?q=`: without JavaScript, or before
 * hydration, clicking a suggestion has to go somewhere, and `onSelect` only
 * intercepts once the drawer is mounted. Inside the drawer or `/chat` there is
 * already a conversation to add to and nowhere to navigate, so a `<button>` is
 * the honest element.
 */
export interface SuggestedQuestionsProps {
  questions: readonly string[];
  /** Ask in place. Return true to swallow the click; false lets a link navigate. */
  onSelect?: (question: string) => boolean;
  /** The wall label above the row. Omit to render none. */
  label?: string;
  /** `row` for the masthead's flex-wrap line, `column` inside a panel. */
  layout?: "row" | "column";
  /**
   * `link` keeps a no-JS path to `/chat?q=` (the masthead). `button` is for
   * surfaces that already hold the conversation and have nowhere to go.
   */
  as?: "link" | "button";
}

export function SuggestedQuestions({
  questions,
  onSelect,
  label,
  layout = "row",
  as = "link",
}: SuggestedQuestionsProps) {
  if (questions.length === 0) return null;

  /* The shared link/button face. `label-mono label-link` is the wall-label
     link stack the document assigns to this register; `normal-case` and
     `tracking-normal` undo the utility's uppercase and 0.16em, because these
     are sentences, not labels — a question set in tracked uppercase is the
     Wall Label Rule absorbing the content it was meant to caption. */
  const face =
    "label-mono label-link normal-case tracking-normal text-start text-muted-foreground ink-underline transition-colors hover:text-primary";

  return (
    <div className="flex flex-col gap-3">
      {label ? <span className="label-mono">{label}</span> : null}
      <div
        className={
          layout === "row"
            ? "flex flex-wrap gap-x-5 gap-y-2"
            : "flex flex-col items-start gap-2.5"
        }
      >
        {questions.map((question) =>
          as === "button" ? (
            <button key={question} type="button" onClick={() => onSelect?.(question)} className={face}>
              {question}
            </button>
          ) : (
            <Link
              key={question}
              href={`/chat?q=${encodeURIComponent(question)}`}
              prefetch={false}
              onClick={(event) => {
                if (onSelect?.(question)) event.preventDefault();
              }}
              className={face}
            >
              {question}
            </Link>
          )
        )}
      </div>
    </div>
  );
}
