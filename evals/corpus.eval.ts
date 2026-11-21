/**
 * @vitest-environment node
 *
 * Offline: needs no database and no key, so it always runs.
 *
 * Two things are scored per in-scope case. "Facts in source" checks that every
 * fact the chat eval demands is actually in the expected essay — a case that
 * fails here is asking the model for something the essay no longer says, so
 * fix the case (or the essay) before reading anything into the live scores.
 * "Hit@3" and "Reciprocal rank" score a BM25 keyword baseline over the same
 * corpus; see keyword-baseline.ts for why that is a proxy, not production.
 */

import { createScorer, evalite } from 'evalite';

import { IN_SCOPE_CASES, type InScopeCase } from './cases';
import { corpusText, keywordSearch } from './keyword-baseline';
import { factsFound, hitAt3, reciprocalRank, type RetrievedEssays } from './scorers';

const factsInSource = createScorer<string, RetrievedEssays, InScopeCase>({
  name: 'Facts in source',
  description: 'Every expected fact appears in at least one of the expected essays.',
  scorer: ({ expected }) => {
    const facts = expected?.facts ?? [];
    const text = (expected?.sources ?? []).map(corpusText).join('\n');
    const found = factsFound(text, facts);
    const missing = facts.filter((fact) => !found.includes(fact)).map((fact) => fact.join(' | '));
    return { score: facts.length === 0 ? 1 : found.length / facts.length, metadata: { missing } };
  },
});

evalite<string, RetrievedEssays, InScopeCase>('Chat cases: corpus and keyword baseline (offline)', {
  data: IN_SCOPE_CASES.map((c) => ({ input: c.question, expected: c })),
  task: (question) => ({ slugs: keywordSearch(question) }),
  scorers: [factsInSource, hitAt3, reciprocalRank],
  columns: ({ output, expected }) => [
    { label: 'Expected', value: expected?.sources.join(', ') ?? '' },
    { label: 'Baseline top 3', value: output.slugs.slice(0, 3).join(', ') },
  ],
});
