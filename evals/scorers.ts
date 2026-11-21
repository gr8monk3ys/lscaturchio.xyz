/**
 * Deterministic scorers for the chat evals. None of them calls a model, so a
 * score means the same thing on every run and costs nothing to compute.
 */

import { createScorer } from 'evalite';

import type { InScopeCase, OutOfScopeCase } from './cases';

/** Lower-case, straight quotes, single spaces: what fact matching compares. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ');
}

/** The facts of `facts` that `text` states, by any accepted spelling. */
export function factsFound(text: string, facts: string[][]): string[][] {
  const haystack = normalize(text);
  return facts.filter((spellings) =>
    spellings.some((spelling) => haystack.includes(normalize(spelling))),
  );
}

/**
 * Phrasings of "Lorenzo hasn't written about that" and of a plain refusal. The
 * system prompt asks for the first in close to those words; the second covers
 * a model declining to share something private.
 */
const DECLINE_PATTERNS: RegExp[] = [
  /\bhas(?:n't| not) written\b/,
  /\bhas(?:n't| not) (?:covered|addressed|discussed|shared)\b/,
  /\bdoes(?:n't| not) (?:cover|address|mention|discuss|include)\b/,
  /\b(?:isn't|is not|aren't|are not) (?:covered|something|part of|in (?:his|the))\b/,
  /\b(?:can't|cannot|can not|won't|will not|unable to|not able to) (?:help|share|provide|give|write|answer|assist)\b/,
  /\bno (?:information|notes|essays?|writing)\b/,
  /\bnot (?:something|a topic) (?:lorenzo|he)\b/,
  /\boutside (?:of )?(?:what|the scope|his)\b/,
];

export function isDecline(answer: string): boolean {
  const text = normalize(answer);
  return DECLINE_PATTERNS.some((pattern) => pattern.test(text));
}

/** Rank (1-based) of the first expected essay in `slugs`, or 0 when absent. */
export function rankOfSource(slugs: string[], sources: string[]): number {
  const index = slugs.findIndex((slug) => sources.includes(slug));
  return index === -1 ? 0 : index + 1;
}

/** What the retrieval evals return: essay slugs, best first. */
export type RetrievedEssays = { slugs: string[] };

export const hitAt3 = createScorer<string, RetrievedEssays, InScopeCase>({
  name: 'Hit@3',
  description: 'An expected essay is among the three closest essays retrieval returned.',
  scorer: ({ output, expected }) => {
    const rank = rankOfSource(output.slugs.slice(0, 3), expected?.sources ?? []);
    return { score: rank > 0 ? 1 : 0, metadata: { rank, retrieved: output.slugs } };
  },
});

export const reciprocalRank = createScorer<string, RetrievedEssays, InScopeCase>({
  name: 'Reciprocal rank',
  description: '1 when the expected essay ranks first, 1/2 when second, 0 when absent.',
  scorer: ({ output, expected }) => {
    const rank = rankOfSource(output.slugs, expected?.sources ?? []);
    return rank > 0 ? 1 / rank : 0;
  },
});

/** What the end-to-end chat eval returns for each question. */
export type ChatOutput = RetrievedEssays & {
  answer: string;
  provider: string;
  model: string;
  confidence: string;
};

export const requiredFacts = createScorer<string, { answer: string }, InScopeCase>({
  name: 'Required facts',
  description: 'Share of the expected facts the answer states (case-insensitive substring).',
  scorer: ({ output, expected }) => {
    const facts = expected?.facts ?? [];
    if (facts.length === 0) return 1;
    const found = factsFound(output.answer, facts);
    const missing = facts.filter((fact) => !found.includes(fact)).map((fact) => fact.join(' | '));
    return { score: found.length / facts.length, metadata: { missing } };
  },
});

export const answersInsteadOfDeclining = createScorer<string, { answer: string }, InScopeCase>({
  name: 'Answers',
  description: 'The answer does not decline a question the essays do cover.',
  scorer: ({ output }) => (isDecline(output.answer) ? 0 : 1),
});

export const declines = createScorer<string, { answer: string }, OutOfScopeCase>({
  name: 'Declines',
  description: "The answer says Lorenzo hasn't written about it, or refuses.",
  scorer: ({ output }) => (isDecline(output.answer) ? 1 : 0),
});

export const avoidsForbidden = createScorer<string, { answer: string }, OutOfScopeCase>({
  name: 'Avoids forbidden content',
  description: 'None of the strings the case forbids appears in the answer.',
  scorer: ({ output, expected }) => {
    const text = normalize(output.answer);
    const present = (expected?.forbidden ?? [])
      .filter((f) => (typeof f === 'string' ? text.includes(normalize(f)) : f.test(output.answer)))
      .map(String);
    return { score: present.length === 0 ? 1 : 0, metadata: { present } };
  },
});
