interface FaqItem {
  question: string;
  answer: string;
}

export const questions: FaqItem[] = [
  {
    question: "What is your typical project engagement process?",
    answer: "A 30-minute call first, free, to find out what the constraint actually is. Then a written scope with deliverables, timeline and a price, so you can say no to a document rather than to a meeting. After that the work runs in short passes with something you can look at each time. If the smallest useful version turns out to be cheaper than you expected, I will say so on the call.",
  },
  {
    question: "What industries have you worked with?",
    answer: "Food and restaurant data at Sizzle, plant-microbe research at JGI, a data lab at UC Merced, and four Upwork clients with document Q&A and classification work. The experience page lists each engagement with its numbers. If your domain is not on it, say so on the call and I will tell you whether that matters.",
  },
  {
    question: "How do you handle pricing and estimates?",
    answer: "Engagements start around $5,000 for a scoped first sprint: one end-to-end slice, with real data and a measurement you can argue with. Fixed price when the scope is clear, hourly when it genuinely is not. I do not quote a number before I understand the constraint, so the first call is the estimate.",
  },
  {
    question: "What deliverables can clients expect?",
    answer: "Working code in your repository, a short document of the decisions and why, a deployment path a team can keep running, and a handoff session. For retrieval and model work, an eval set you can rerun and the measured numbers it produced.",
  },
  {
    question: "How do you handle data confidentiality and NDAs?",
    answer: "I will sign an NDA before anything sensitive moves, and I work inside whatever security setup you already have rather than asking you to adopt mine. I would rather agree the handling rules with you in writing than publish a general promise about them here.",
  },
  {
    question: "What is the difference between one-time consulting and ongoing support?",
    answer: "One-time consulting is for a specific problem: a proof of concept, an audit of an existing system, or a technical question that needs an answer. Ongoing support covers maintenance, new features, and advisory. Either can turn into the other once the scope is real.",
  },
  {
    question: "Do you work with teams or just individuals?",
    answer: "Both. I have worked one to one with individual clients through Upwork, and inside engineering teams at Sizzle, the Joint Genome Institute and a data lab at UC Merced. On a team I can advise, review code, or work as an embedded contributor."
  },
  {
    question: "What is your availability and typical response time?",
    answer: "I am in Los Angeles (Pacific Time) and work Monday through Friday. On active projects I reply within a business day and take scheduled calls during business hours. If something is urgent, we can agree a faster arrangement up front.",
  },
];