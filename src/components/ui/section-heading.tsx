interface SectionHeadingProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Section heading. Deliberately static: an `initial={{ opacity: 0 }}` mount
 * animation under `LazyMotion strict` can be missed entirely, leaving the
 * heading at opacity 0 forever. Page content never mounts hidden.
 */
export function SectionHeading({ children, className = "" }: SectionHeadingProps) {
  return (
    <h2
      className={`text-3xl font-bold tracking-tight text-foreground sm:text-4xl ${className}`}
    >
      {children}
    </h2>
  );
}
