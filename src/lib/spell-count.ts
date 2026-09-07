/**
 * Counts spelled as words: "Six books", "Eighty-three essays".
 *
 * This lives in `lib` rather than beside its first caller because the counts it
 * spells appear in two places that must agree: the page body, which renders in
 * a Client Component, and the `<meta name="description">`, which is built on the
 * server. When the helper was private to `BooksList`, only the body could derive
 * its number and the description was typed by hand — which is exactly how
 * `/books` came to advertise "the three books I gave full marks" while the page
 * below it correctly said six, and how four separate strings came to assert
 * "Eighty-three essays" that nothing rechecks.
 *
 * The site's voice spells counts out rather than printing digits, so this covers
 * 0–999 instead of stopping at the handful `BooksList` happened to need.
 */
const ONES = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];

const TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

/**
 * Lowercase, for mid-sentence use: "…the six books I gave full marks."
 *
 * Zero reads as "no" rather than "zero" because every caller uses it in a
 * sentence where "no books" is the natural phrasing. Anything outside 0–999
 * falls back to digits rather than throwing: a wrong-looking number on the page
 * is a smaller failure than a page that will not render.
 */
export function spellCountLower(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 999) return String(n);
  if (n === 0) return "no";
  if (n < 20) return ONES[n];
  if (n < 100) {
    const tens = TENS[Math.floor(n / 10)];
    const ones = n % 10;
    return ones === 0 ? tens : `${tens}-${ONES[ones]}`;
  }
  const hundreds = `${ONES[Math.floor(n / 100)]} hundred`;
  const rest = n % 100;
  return rest === 0 ? hundreds : `${hundreds} ${spellCountLower(rest)}`;
}

/** Capitalised, for the start of a sentence: "Eighty-three essays on power…". */
export function spellCount(n: number): string {
  const word = spellCountLower(n);
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/** `1 book` / `2 books`, so callers stop hand-rolling the plural. */
export function pluralize(n: number, singular: string, plural = `${singular}s`): string {
  return n === 1 ? singular : plural;
}
