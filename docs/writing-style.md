# Writing style

How writing on this site should sound. Derived from Lorenzo's actual writing
(the Palimpsest album notes, the Parley film treatment, literature notes, and
poetry in the `lorenzo-obsidian` vault), plus the specific AI tells found in
this blog's corpus during the June 2026 voice pass. Apply to every new post
and to any edit of an existing one.

## The voice

Quiet confidence. The writing trusts the reader and doesn't perform for them.
Reference points, from Lorenzo's own notes:

> A palimpsest is a manuscript that's been written over but still carries
> traces of the original text underneath. That's misinformation — not erasure,
> but layering. The truth doesn't disappear, it gets buried under enough
> rewrites that you stop being able to find it.

> Almost danceable. Almost. The beat loops back on itself in a way that starts
> to feel wrong around the third minute.

> The moment of finding something real beneath the rewrites — not clean, not
> triumphant, but real.

What those passages do, and what posts here should do:

1. **Short declarative sentences, with deliberate fragments for rhythm.**
   "Sparse. Maybe strings, maybe steel guitar." Fragments are punctuation, not
   a default — one or two per section, where the pause earns something.
2. **Redefinition as an argumentative move.** Take a familiar word and turn it:
   "That's misinformation — not erasure, but layering." This is the native
   gesture of these essays. Use it instead of thesis-statement scaffolding.
3. **Concrete images carry abstract ideas.** Sawdust on a shirt, a backward
   clock, an empty prescription bottle. If a paragraph has been abstract for
   three sentences, land it on an object, a number, or a named person.
4. **Casual erudition, immediately grounded.** Drop Baudrillard without
   ceremony, then make him concrete in the same breath: "the map precedes the
   territory — this track is the map." Never introduce a thinker with their
   title and a summary of their importance.
5. **Second person to implicate, not to instruct.** "You stop being able to
   find it." Not "you should" — "you already do."
6. **Let ambiguity sit.** Endings don't have to resolve. "Fades out without
   answering anything" is a legitimate closing move. The essay can leave the
   reader holding the problem.
7. **Tie ideas back to building things** when it's honest to do so. "You can
   explain patterns, but understanding comes from struggling with real
   problems." The author is someone who ships software; the essays know that.
8. **Dry, not loud.** The wit is in the placement, not the volume. "Wilson's
   team called this result 'striking.' That's one word for it" — keep that
   register; don't escalate it to a zinger per paragraph.

## The anti-patterns

These are the tells actually found in this corpus, worst first. The general
reference is Wikipedia's "Signs of AI writing"; these are the local offenders.

1. **Uniform punchiness.** Every paragraph ending on a mic-drop is as
   mechanical as every paragraph ending on a hedge. Vary the rhythm: let some
   paragraphs trail off, qualify, or just stop. A zinger lands because the
   three paragraphs before it didn't have one.
2. **Rule-of-three cascades.** "You choose to love people who will die. You
   choose to build things that will decay. You choose to fight for things that
   may not work." Break the symmetry: two items, or four, or one developed at
   length. If a triple survives, make the third element break pattern.
3. **Stock pivots.** Banned: "Here's the thing nobody tells you about X",
   "Let's be clear", "The truth is", "Make no mistake", "It's worth noting",
   "Enter X", "But here's the kicker". If a sentence exists to signal that the
   next sentence matters, delete it.
4. **Negative parallelism as a crutch.** "It's not just X, it's Y" / "The
   problem isn't X. The problem is Y." Once per essay, maximum. It's a strong
   move that the corpus uses every fourth paragraph.
5. **Title Case Headings.** Headings are sentence case. "The mind that wanders
   is working", not "The Mind That Wanders Is Working". (When editing an old
   post, keep heading *text* stable where possible — heading ids feed anchors
   and chat context extraction.)
6. **Mechanical boldface and inline-header bullets.** No `**Term:**
   explanation` lists. No bolding numbers or jargon for emphasis. Bold almost
   nothing in prose. Tables only when the data is genuinely tabular.
7. **"Definitive/comprehensive/ultimate guide" framing.** Kill it in titles
   and descriptions. Say what the post actually covers: "what broke when I
   shipped RAG to production, and what fixed it."
8. **AI vocabulary.** Watch for: delve, crucial, pivotal, landscape (abstract),
   tapestry, testament, underscore, showcase, foster, leverage (verb),
   intricate, vibrant, robust, seamless, "in today's world". Replace with the
   plain word or cut.
9. **Superficial -ing trailers.** "...reflecting the community's deep
   connection to the land." If the participle clause adds a claim, give it its
   own sentence with evidence. If it doesn't, cut it.
10. **Vague authorities.** "Experts argue", "studies show", "researchers have
    found" with no names. This corpus is actually good at citing named
    researchers — keep that standard everywhere. A specific study with a year
    beats three vague ones.
11. **Em-dash inflation.** One em dash per paragraph, at most. Lorenzo uses
    them well but singly. (Historical note: a bad processing pass once
    stripped em dashes entirely and glued words together — "productionsuccess".
    When editing old posts, check for fused words.)
12. **Tidy uplift endings.** No "The future is bright", no closing
    call-to-action paragraph that restates the essay in imperative mood. The
    strongest endings here either narrow to one concrete image or admit what
    the essay can't resolve.

## Garden metadata

Every post declares a `stage` in its meta (backfilled across the corpus in
July 2026 — keep it that way for new posts):

- `seedling` — rough notes, still forming: a first pass, thin sourcing, or a
  familiar argument not yet made yours. Publishing seedlings is encouraged;
  the label is the honesty.
- `budding` — developing: a coherent essay that could still grow, or leans on
  secondhand synthesis of well-known sources.
- `evergreen` — finished and maintained: complete argument, dense named
  evidence, original synthesis. Polish and length don't qualify a post on
  their own, and time-sensitive pieces (profiles of sitting politicians,
  market forecasts) cap at budding — they rot by design and can't honestly
  claim "maintained".

Promote a stage when the post is revised, not when it feels overdue.

Series are reading arcs, not tags: ordered by narrative (problem → mechanism
→ response), not by date. If a new post extends an existing series, join it
with the next `seriesOrder`; don't create a new series until at least three
posts would sit in it.

## Mechanical conventions

- Headings: sentence case, `##` level for sections, no emoji anywhere.
- Straight quotes in MDX source are fine; don't hand-curl them.
- Citations: name, venue, year, inline ("a 2014 study in *Science*"), no
  footnote apparatus.
- Numbers: keep the specific ones ("190 times", "67% of men"). Specificity is
  the house style's load-bearing wall.
- Length: essays run 1,200–2,500 words. If a section exists only for
  completeness ("Challenges", "Future outlook"), cut the section.
- Meta descriptions: one sentence, declarative, no colon-subtitle stacking.

## Editing checklist for a voice pass

1. Read the post's headings alone — do they sound like a person or a deck?
2. Count negative parallelisms and triples; break all but the best one.
3. Find every paragraph-final zinger; keep one per section.
4. Replace stock pivots with the claim they were stalling.
5. Check the ending: does it resolve like a TED talk? Rewrite to narrow or
   to admit.
6. Scan for AI vocabulary and -ing trailers.
7. Check for fused words from the em-dash stripping bug.
8. Read one paragraph aloud. If you can't hear someone saying it, fix it.
