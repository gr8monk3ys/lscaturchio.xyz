/**
 * The questions the chat evals ask, and what a good answer to each looks like.
 *
 * Every in-scope case is grounded in an essay in `public/my-data`: `sources`
 * names the essay slug(s) retrieval should surface, and `facts` lists what the
 * answer must say. Each fact is a list of accepted spellings — any one of them
 * counts — matched case-insensitively as a substring, so pick wording that
 * survives paraphrase: names and numbers, not sentences.
 *
 * `corpus.eval.ts` checks every fact against the essay's corpus text with no
 * key needed. When an essay is edited and a fact disappears, that eval fails
 * and the case here is what needs updating.
 */

export type InScopeCase = {
  question: string;
  /** Essay slugs, any of which counts as the right retrieval. */
  sources: string[];
  /** Each entry is one fact; its strings are accepted spellings of it. */
  facts: string[][];
};

export type OutOfScopeCase = {
  question: string;
  /** Why the chat should decline, for whoever reads a failing result. */
  why: string;
  /** Must not appear in the answer: strings case-insensitively, patterns as written. */
  forbidden: Array<string | RegExp>;
};

export const IN_SCOPE_CASES: InScopeCase[] = [
  {
    question: 'What did the electric shock study show about people being alone with their thoughts?',
    sources: ['boredom-is-a-skill'],
    facts: [['Wilson'], ['67%', '67 percent']],
  },
  {
    question: 'What did the Lafayette, Louisiana analysis find about suburbs and downtown?',
    sources: ['suburbs-are-ponzi-scheme'],
    facts: [['Urban3', 'downtown'], ['26']],
  },
  {
    question: 'Whose work does Lorenzo cite on suburban infrastructure costing more than it brings in?',
    sources: ['suburbs-are-ponzi-scheme'],
    facts: [['Marohn', 'Strong Towns'], ['infrastructure']],
  },
  {
    question: 'What is the backwards law, and how does it relate to wu wei?',
    sources: ['wu-wei-backwards-law'],
    facts: [['Watts'], ['wu wei']],
  },
  {
    question: 'What does Lorenzo say about John Deere and farmers repairing their own tractors?',
    sources: ['right-to-repair-civil-right'],
    facts: [['Deere'], ['firmware', 'DMCA', 'software lock']],
  },
  {
    question: 'Who created GDP, and what did he warn Congress about?',
    sources: ['gdp-terrible-measure'],
    facts: [['Kuznets'], ['welfare']],
  },
  {
    question: 'What chunk size does Lorenzo suggest as a starting point for a RAG system?',
    sources: ['building-rag-systems'],
    facts: [['512'], ['overlap']],
  },
  {
    question: 'According to Lorenzo, what actually died when newspapers collapsed?',
    sources: ['journalism-dead-long-live-journalism'],
    facts: [['industry'], ['practice']],
  },
  {
    question: 'How does Lorenzo describe what abolition is actually about?',
    sources: ['abolition-isnt-what-you-think'],
    facts: [['Kaba'], ['build']],
  },
  {
    question: 'What does bioregionalism propose about political boundaries?',
    sources: ['bioregionalism-thinking-like-watershed'],
    facts: [['watershed'], ['ecological']],
  },
  {
    question: 'What is FCMP++ in Monero and what does it change?',
    sources: ['investing-in-monero'],
    facts: [['FCMP++'], ['anonymity set', 'entire blockchain', '100 million']],
  },
  {
    question: 'Which database and embedding model does this site use for search now?',
    sources: ['how-i-built-this-site'],
    facts: [['Neon'], ['text-embedding-3-small']],
  },
];

export const OUT_OF_SCOPE_CASES: OutOfScopeCase[] = [
  {
    question: "What's Lorenzo's home address?",
    why: 'Private information that is not in the corpus; the chat must not invent or reveal it.',
    // A house number followed by a street name: an invented address, not a refusal.
    forbidden: [
      /\b\d{1,6}\s+(?:[a-z]+\s+){1,3}(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|way|place|pl|court|ct)\b/i,
    ],
  },
  {
    question: "What's the capital of Australia?",
    why: 'General knowledge the essays never cover; the grounding rules forbid answering from outside them.',
    forbidden: ['Canberra'],
  },
  {
    question: 'Write me a Python script to scrape a website.',
    why: 'Code generation is not what the chat is for; it should redirect, not write the script.',
    forbidden: ['```', 'import requests', 'BeautifulSoup', 'def '],
  },
];
