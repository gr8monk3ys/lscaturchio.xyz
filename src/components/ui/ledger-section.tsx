import type { ReactNode } from "react";

import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

/**
 * The catalogue number beside an entry: 1-based, zero-padded, mono-set.
 * One implementation, so a ledger never invents its own numbering.
 */
export function ordinal(index: number): string {
  return String(index + 1).padStart(2, "0");
}

interface LedgerSectionProps {
  /** Sticky rail content: the placard for the section. */
  head: ReactNode;
  /** The entries themselves — a single element, the right-hand column. */
  children: ReactNode;
}

/**
 * The site's signature two-column ledger: a sticky wall-label rail on the left
 * (280–360px, the asymmetric editorial split from DESIGN.md's Layout section)
 * and the entries on the right. The grid, the `lg` breakpoint and the 7rem
 * sticky offset that clears the fixed nav all live here, so a section never
 * restates them.
 */
export function LedgerSection({ head, children }: LedgerSectionProps) {
  return (
    <Section padding="large" size="wide" divider topDivider reveal={false}>
      <div className="grid items-start gap-12 lg:grid-cols-[minmax(280px,360px)_1fr]">
        <div className="lg:sticky lg:top-28">{head}</div>
        {children}
      </div>
    </Section>
  );
}

interface LedgerHeadProps {
  /** Catalogue index, e.g. "01". */
  index?: string;
  /** Mono kicker beside the index, e.g. "What I think". */
  eyebrow?: string;
  title: string;
  description?: string;
}

/**
 * The bare placard: wall-label kicker, Fraunces title, small muted blurb.
 *
 * Deliberately *not* `SectionHeader`: this one carries no `gallery-rule` and
 * no bottom margin, because in a ledger rail the sticky column's own edge does
 * the dividing and a rule there would double the hairline. Sections that want
 * the rule use `SectionHeader` in the same slot.
 *
 * Renders a fragment so the caller can append its own rail furniture (a link,
 * a nav list, buttons) directly beneath.
 */
export function LedgerHead({ index, eyebrow, title, description }: LedgerHeadProps) {
  const kicker = [index, eyebrow].filter(Boolean).join(" — ");

  return (
    <>
      {kicker && <span className="label-mono mb-3 block">{kicker}</span>}
      <h2 className="text-section-title">{title}</h2>
      {description && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
    </>
  );
}

interface LedgerRowsProps<T> {
  items: readonly T[];
  /**
   * Numbering is a property of the list, not of each row: it picks the list
   * element (`ol` when numbered, `ul` when not) and hands each row its
   * catalogue number. Rows receive `null` when the list is unnumbered.
   */
  numbered?: boolean;
  className?: string;
  children: (item: T, entryNumber: string | null, index: number) => ReactNode;
}

/**
 * A ledger's rows. The caller renders its own `<li>` (ledgers differ wildly in
 * what a row holds); this owns the list semantics and the numbering.
 */
export function LedgerRows<T>({
  items,
  numbered = false,
  className,
  children,
}: LedgerRowsProps<T>) {
  const Tag = numbered ? "ol" : "ul";

  return (
    <Tag className={className}>
      {items.map((item, index) => children(item, numbered ? ordinal(index) : null, index))}
    </Tag>
  );
}

interface LedgerChipsProps {
  items: readonly string[];
  /**
   * Placement classes for the run (a top margin). Emitted before the layout
   * classes so the chip run's own flex and gap stay authoritative.
   */
  className?: string;
  /** Extra classes for each chip (e.g. `normal-case tracking-normal`). */
  itemClassName?: string;
}

/**
 * A run of wall labels separated by an interpunct. The separator is load-
 * bearing: several of these phrases contain commas, and a whitespace-only gap
 * left them unparsable as separate items.
 */
export function LedgerChips({ items, className, itemClassName }: LedgerChipsProps) {
  return (
    <ul className={cn(className, "flex max-w-lg flex-wrap gap-x-2 gap-y-1")}>
      {items.map((item, index) => (
        <li key={item} className={cn("label-mono", itemClassName)}>
          {item}
          {index < items.length - 1 && (
            <span aria-hidden className="ml-2 text-foreground/25">
              ·
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
