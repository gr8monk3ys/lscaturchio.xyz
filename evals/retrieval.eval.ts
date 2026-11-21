/**
 * @vitest-environment node
 *
 * The production retriever, `groundingFor`, on every in-scope question: does
 * it put the essay the answer lives in among the three essays chat grounds on?
 *
 * Needs DATABASE_URL. With an embedding provider (OPENAI_API_KEY, or Ollama
 * running) it is the full hybrid search; without one it is the keyword leg
 * alone, exactly as the live chat degrades. No chat model is called.
 */

import { evalite, type Evalite } from 'evalite';

import { groundingFor } from '@/lib/retrieval';

import { IN_SCOPE_CASES, type InScopeCase } from './cases';
import { announceSkip, missingDatabase } from './env';
import { hitAt3, reciprocalRank, type RetrievedEssays } from './scorers';

const EVAL_NAME = 'Chat retrieval: groundingFor';

type RetrievalOutput = RetrievedEssays & { confidence: string };

const opts: Evalite.RunnerOpts<string, RetrievalOutput, InScopeCase> = {
  data: IN_SCOPE_CASES.map((c) => ({ input: c.question, expected: c })),
  task: async (question) => {
    const grounding = await groundingFor(question);
    return {
      slugs: grounding.closest.map((c) => c.url.split('/').pop() ?? ''),
      confidence: grounding.confidence,
    };
  },
  scorers: [hitAt3, reciprocalRank],
  columns: ({ output, expected }) => [
    { label: 'Expected', value: expected?.sources.join(', ') ?? '' },
    { label: 'Retrieved', value: output.slugs.join(', ') },
    { label: 'Confidence', value: output.confidence },
  ],
};

const missing = missingDatabase();
if (missing) {
  announceSkip(EVAL_NAME, [missing]);
  evalite.skip(EVAL_NAME, opts);
} else {
  evalite(EVAL_NAME, opts);
}
