interface PlateHeadProps {
  /** Catalogue index, e.g. "01". */
  index: string;
  /** Mono kicker beside the index. */
  eyebrow: string;
  title: string;
  description?: string;
}

/**
 * The placard that opens a home-page plate: wall-label kicker, handwritten
 * title, and the lede in the catalogue serif.
 */
export function PlateHead({ index, eyebrow, title, description }: PlateHeadProps) {
  return (
    <>
      <span className="label-mono mb-3 block">
        {index} — {eyebrow}
      </span>
      <h2 className="text-section-title">{title}</h2>
      {description && (
        <p className="text-lede mt-4 max-w-xl text-foreground">{description}</p>
      )}
    </>
  );
}
