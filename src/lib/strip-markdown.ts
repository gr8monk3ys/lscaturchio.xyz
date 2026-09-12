/**
 * Strip MDX syntax out of a retrieval snippet.
 *
 * The corpus is raw MDX, so excerpts arrived with their markup attached and
 * the demo printed it: results read `"# Building RAG Systems in Production
 * People who've shipped…"` and `"``` The result is that vague queries still
 * land…"`, in italics, clipped mid-glyph. The page whose entire job is to show
 * that the author can build retrieval was showing one that returns markdown.
 *
 * This is the display-side half of the fix and belongs here because the API
 * returns the corpus verbatim; stripping at index time in
 * `sync-retrieval-corpus` would also help every other consumer, and is worth
 * doing, but this is the surface that shipped the defect.
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")   // fenced code, paired
    // A snippet is a window cut out of the middle of a document, so a
    // fence is more often unmatched than matched: the observed defect was
    // literally `"``` The result is that vague queries still land…"`.
    .replace(/`{3,}/g, " ")             // and any fence left over
    .replace(/`([^`]+)`/g, "$1")        // inline code
    // ATX headings, at a line start *or* mid-string. The `m` flag alone was
    // not enough: a snippet is a flattened window of a document, so a
    // heading arrives inline after a sentence — `/lab` was still printing
    // "I editorialize. ## Where RAG comes from" after the line-anchored
    // version shipped. Requiring whitespace before the hashes keeps "C#"
    // and "#1" intact, since neither has a space after the hash.
    .replace(/(^|\s)#{1,6}\s+/gm, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // images -> alt
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")  // links -> text
    .replace(/^\s{0,3}>\s?/gm, "")      // blockquotes
    .replace(/(\*\*|__)(.*?)\1/g, "$2")  // bold
    .replace(/(\*|_)(.*?)\1/g, "$2")     // italics
    .replace(/^\s{0,3}([-*+]|\d+\.)\s+/gm, "") // list markers
    .replace(/\s+/g, " ")
    .trim();
}
