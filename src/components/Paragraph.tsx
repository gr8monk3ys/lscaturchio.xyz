import { cn } from "@/lib/utils";

interface ParagraphProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Body paragraph for page heads. Deliberately static: this used to animate
 * in on scroll, and the sentence that explains a page stayed at opacity 0
 * whenever the motion features loaded late. Text is never gated behind JS.
 */
export function Paragraph({ children, className }: ParagraphProps) {
  return (
    <p
      className={cn(
        "text-base md:text-lg lg:text-xl leading-relaxed text-muted-foreground",
        "selection:bg-primary/20 selection:text-primary",
        className
      )}
    >
      {children}
    </p>
  );
}
