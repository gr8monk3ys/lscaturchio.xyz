# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

**Layout: single-context.** One `CONTEXT.md` at the repo root and one `docs/adr/` directory. This is not a monorepo, so there are no per-context glossaries.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root
- **`docs/adr/`**: read ADRs that touch the area you're about to work in

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

Neither file exists yet. That is the expected starting state.

## Also read, before touching these areas

These are not domain docs, but they carry binding constraints that an exploring agent will otherwise violate:

- **`PRODUCT.md`**: product truth, including the rule that nothing on the site may claim more than it can show, and the list of absences (no testimonials, no client metrics, no named clients) that must never be fabricated.
- **`DESIGN.md`**: the visual system and its named rules.
- **`docs/writing-style.md`**: required reading before editing any essay under `src/app/blog/`.
- **`docs/operations.md`**: content, audio, database and monitoring procedures.

## File structure

```
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-....md
│   └── 0002-....md
└── src/
```

A multi-context layout (a root `CONTEXT-MAP.md` pointing at per-context `CONTEXT.md` files) does not apply here. If this repo ever gains packages, revisit.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_
