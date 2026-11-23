# lscaturchio.xyz

Lorenzo Scaturchio's personal site: a publishing platform for essays, a project catalogue, and a chat that answers only from his own writing. Terms below are read from the code (`src/lib`, `src/types`, `src/constants`, `supabase/migrations`).

## Language

### Essays

**Essay**:
One piece of writing, stored as `src/app/blog/<slug>/content.mdx`. Nothing else under the blog route is an essay, including a flat `<slug>.mdx`.
_Avoid_: Blog post, article (the TypeScript type is still named `BlogPost`)

**Slug**:
The folder name of an essay, and its identity in URLs (`/blog/<slug>`), view counts, reactions and embeddings.
_Avoid_: ID, permalink

**Meta export**:
The `export const meta = {...}` block inside an essay's MDX that carries its title, description, date, tags, series, stage and image. Parsed by `parseMetaExport`.
_Avoid_: Front matter

**Essay source**:
An essay's `EssaySource.body`: the MDX with its meta export, imports and tag-only lines removed. The one text every consumer (reading time, feed, chat, embeddings, TTS, webmentions) reads.
_Avoid_: Raw MDX, content

**Catalogue**:
The set of essays a query runs over, built by `createEssayCatalogue` and queried through `getAllBlogs`, `getBlogPost`, `getBlogsByTag`, `getBlogsInTheme` and `listSeries`.
_Avoid_: Blog index, posts list

**Published essay**:
An essay whose date is not in the future. Every default catalogue answer is published essays only, newest first.
_Avoid_: Live post

**Scheduled essay**:
An essay dated in the future. It prerenders and is reachable at its URL, but is left out of every listing, the feed and the sitemap.
_Avoid_: Draft (drafts live in `content/drafts`, outside the route)

**Series**:
A named run of essays read in order, by `series` and `seriesOrder` in the meta export.
_Avoid_: Collection, sequence

**Theme**:
One of the site's topic groupings in `BLOG_THEMES`, derived from tag distribution. An essay has one primary theme but can belong to several.
_Avoid_: Category, topic hub

**Stage**:
A digital-garden maturity label on an essay: `seedling`, `budding` or `evergreen`. An invalid value means no stage.
_Avoid_: Status, maturity

**Garden**:
The `/garden` page: the map of every doorway on the site.
_Avoid_: Sitemap (that is `src/app/sitemap.ts`)

### Chat and retrieval

**Retrieval corpus**:
The generated `public/my-data/blog-<slug>.md` files, one per essay, derived from essay sources. Never hand-edited; CI fails on drift.
_Avoid_: Knowledge base, training data

**Chunk**:
A piece of an essay stored with its embedding in the `embeddings` table. The index stores chunks, not essays.
_Avoid_: Passage, segment

**Hybrid search**:
Vector (cosine) and Postgres full-text candidates fused with Reciprocal Rank Fusion. A lexical-only match has similarity 0.
_Avoid_: Semantic search

**Relevant essays**:
The essays ranked by hybrid search for a query (`relevantEssays`), used by search and related posts.
_Avoid_: Search results

**Grounding**:
The excerpts of Lorenzo's writing that back a chat answer (`groundingFor`). The chat answers only from grounding, and says so when there is none.
_Avoid_: Context, sources

**Blog context**:
The title, description, headings and text of the essay a reader is currently on, passed to chat (`BlogContext`).
_Avoid_: Page context

### Projects

**Project catalogue**:
The list of projects in `src/constants/products.tsx`, queried through `src/lib/project-catalogue.ts`. A catalogue entry is a `Product`.
_Avoid_: Portfolio, products list

**Project status**:
`active`, `maintained` or `archived`.
_Avoid_: State

**Project category**:
One of `ai-ml`, `web-apps`, `tools`, `open-source`, `data-science`, `games`.
_Avoid_: Tag, type

**Now**:
The `/now` page, driven by `src/data/now.json`: what Lorenzo is building at the moment.
_Avoid_: Current projects

### Reader interaction

**Views**:
The per-essay read count in the `views` table.
_Avoid_: Hits, traffic

**Reactions**:
Per-essay emoji counts (`likes`, `bookmarks`, `fire`, `celebrate`, `insightful`, `thinking`) in the `reactions` table, deduplicated through `vote_records`.
_Avoid_: Likes (one of the six, not the whole)

**Guestbook entry**:
A name and a message of at most 500 characters left on `/guestbook`, stored in the `guestbook` table.
_Avoid_: Comment

**Newsletter subscriber**:
A person in `newsletter_subscribers` with an unsubscribe token and a list of topics.
_Avoid_: Member, user

**Webmention**:
An IndieWeb mention (`like`, `repost`, `reply` or `mention`) of an essay, fetched by `src/lib/webmentions.ts` and sent by `scripts/send-webmentions.ts`.
_Avoid_: Backlink

### Audio

**Audio manifest**:
`src/generated/audio-manifest.ts`: the generated list of essays that have recorded audio. The audio itself lives on Vercel Blob, not in git.
_Avoid_: Playlist
