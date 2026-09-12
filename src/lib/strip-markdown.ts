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
    // A fence and its language tag go together: an unmatched opening fence
    // left `python` sitting inline as if it were prose.
    // A fence, and the language tag that belongs to it.
    //
    // The tag is usually glued to the fence (```python) but a snippet is a
    // flattened window, so the newline between them can become a space and
    // leave `python` sitting inline as prose — which is what the live demo
    // rendered. Matching any following word fixed that and broke the opposite
    // case: "``` The result is…" lost the word "The". A closed list is the
    // only version that can tell a language from a sentence.
    .replace(
      /`{3,}[ \t]*(?:python|ts|typescript|js|javascript|tsx|jsx|bash|sh|shell|zsh|json|ya?ml|toml|css|scss|html|sql|go|rust|rs|java|kotlin|swift|rb|ruby|php|c|cpp|csharp|diff|text|txt|md|mdx)?\b/gi,
      " "
    )
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
    // Asterisk emphasis only. `*` cannot appear inside an identifier, so
    // unwrapping it is safe.
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(\S(?:.*?\S)?)\*/g, "$1")
    // Underscore emphasis is NOT unwrapped, deliberately.
    //
    // Two attempts tried to tell `__bold__` from `__init__` with lookaheads,
    // and the second one passed its unit tests and still shipped broken: with
    // two dunders in one snippet, `__(.*?)__(?!\()` backtracks to the later
    // delimiter and strips across the pair, so the live demo rendered
    // `def init__(self, privacy_mode=...)`. It was verified in source and in
    // tests and never in the browser, which is the whole reason it survived.
    //
    // The right answer is to stop trying. These are retrieval *snippets* —
    // plain-text previews of prose, never rendered as markdown — so there is
    // no emphasis to unwrap and nothing is lost by leaving `_` alone, while
    // every identifier in a quoted code sample survives intact. A visible
    // `_emphasis_` in a preview is a far cheaper defect than a corrupted
    // symbol on the page that exists to prove the author can build retrieval.
    .replace(/^\s{0,3}([-*+]|\d+\.)\s+/gm, "") // list markers
    .replace(/\s+/g, " ")
    .trim();
}
