interface SectionHeadingProps {
  /**
   * The heading level. Defaults to h2, but a page whose opening line is this
   * component needs an h1 — /about had none at all, so the document had a
   * title and no top-level heading.
   */
  as?: "h1" | "h2" | "h3";
  children: React.ReactNode;
  className?: string;
}

/**
 * Section heading. Deliberately static: an `initial={{ opacity: 0 }}` mount
 * animation under `LazyMotion strict` can be missed entirely, leaving the
 * heading at opacity 0 forever. Page content never mounts hidden.
 */
export function SectionHeading({
  children,
  className = "",
  as: Tag = "h2",
}: SectionHeadingProps) {
  return (
    <Tag
      className={`text-3xl font-bold tracking-tight text-foreground sm:text-4xl ${className}`}
    >
      {children}
    </Tag>
  );
}
