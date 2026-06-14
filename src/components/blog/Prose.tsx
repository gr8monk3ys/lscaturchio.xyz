import clsx from "clsx";

export function Prose({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        className,
        // Gallery reading experience: editorial rhythm on top of Tailwind prose.
        "prose prose-lg max-w-none prose-gallery",
        "prose-headings:font-display prose-headings:text-foreground prose-headings:font-semibold prose-headings:tracking-tight",
        "prose-p:text-foreground/90 prose-p:leading-relaxed",
        "prose-strong:text-foreground",
        // Links: ink with a green underline, not a loud color swap.
        "prose-a:text-foreground prose-a:underline prose-a:decoration-primary/40 prose-a:underline-offset-2 hover:prose-a:decoration-primary",
        // Pull-quote: flat left rule + Fraunces, no italic, no card.
        "prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-5 prose-blockquote:not-italic prose-blockquote:font-display prose-blockquote:text-xl prose-blockquote:font-medium prose-blockquote:text-foreground",
        // Inline code in the wall-label mono.
        "prose-code:font-mono prose-code:text-[0.9em] prose-code:before:content-none prose-code:after:content-none",
        // Framed images + hairline rules to match the gallery.
        "prose-img:border prose-img:border-border prose-hr:border-border",
        "prose-ul:text-foreground/90 prose-ol:text-foreground/90 prose-li:text-foreground/90",
        "dark:prose-invert"
      )}
    >
      {children}
    </div>
  );
}
