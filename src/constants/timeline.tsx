// Source of truth is the resume repo (~/code/resume): `default/sections/
// experience.tex` for the roles that fit a one-page resume, and
// `docs/linkedin-copy.md` for the canonical longform prose, which also carries
// the roles the one-pager drops for space (VICE Lab).
//
// Reconciled 2026-08-30. Corrections made in that pass, so they are not
// silently reintroduced:
//   - JGI "98% accuracy" was wrong. The model is KNN for plant-microbe
//     interaction prediction and its score is F1 0.68.
//   - Upwork "98% customer satisfaction rate" is really a 98% Job Success
//     Score, a metric the Upwork platform computes and publishes.
//   - Upwork "average efficiency increase of 25%" and "reducing operational
//     costs by up to 20%" appear in neither the resume nor the LinkedIn copy.
//     Removed rather than carried forward.
//   - VICE Lab Cython work is a 30% runtime reduction, not 20%, and the Vue.js
//     dashboard carries no engagement metric in any source.
//   - Sizzle was described without any of its real numbers; the resume has
//     them.
//   - G&M Trailer Repair was missing entirely.
//
// Keep the two in sync. The site claiming roles, dates or numbers the resume
// does not is worse than either being stale alone.
export const timeline = [
  {
    company: "Sizzle",
    title: "Machine Learning Engineer",
    date: "June 2024 - May 2025",
    description:
      "Built and ran an end-to-end computer vision pipeline for estimating macro-nutrients from food images, and explained its behaviour and its limits to people who did not build it.",
    responsibilities: [
      "Deployed the pipeline on GCP Vertex AI and BigQuery, serving 5k+ daily inference requests in production.",
      "Integrated the fine-tuned vision model into a production REST API in Kotlin, holding a <200ms p95 target for 10+ B2B clients.",
      "Turned vague quality complaints into concrete labeling guidelines across a 50k+ image dataset, raising model accuracy by 12 percentage points.",
    ],
  },
  {
    company: "Upwork",
    title: "AI/ML Freelancer",
    date: "August 2022 - Present",
    description:
      "Discovery and scoping with clients, turning open-ended business problems into delivered systems.",
    responsibilities: [
      "Delivered custom ML for 4 clients: RAG document Q&A, fine-tuned classification, and automated data pipelines.",
      "Built the MLOps around them — CI/CD, model versioning, monitoring.",
      "Maintained a 98% Job Success Score by setting expectations up front, demoing work in progress, and documenting the handoff.",
    ],
  },
  {
    company: "G&M Trailer Repair, Inc.",
    title: "Operations Coordinator",
    date: "2022 - Present",
    description:
      "Asked to organize the files at a paper-run trailer shop; the real problem was records nobody could query.",
    responsibilities: [
      "Rebuilt receipts, pick tickets, and job scheduling into searchable Excel systems and a Kanban board inside Microsoft Teams — the suite the crew already used.",
      "Built and owned the parts inventory, an hour log normalizing labor against per-client rates, and PTO accrual formulas, automating the repetitive steps in VBA and invoicing in QuickBooks.",
      "Coordinated repair intake and dispatch for a fleet running roughly 200 trailers a month, working daily with a primarily Spanish-speaking crew.",
    ],
  },
  {
    company: "Joint Genome Institute",
    title: "Bioinformatics Data Analyst",
    date: "May 2020 - August 2021",
    description:
      "Built data processing pipelines in R for genomic homology comparison, with a team of researchers.",
    responsibilities: [
      "Cut processing time by 90%, shortening iteration cycles for the research teams.",
      "Engineered ETL pipelines for genome reference data, cutting preprocessing from 4 hours to 10 minutes.",
      "Delivered a KNN classification model for plant-microbe interaction prediction (F1 0.68), and walked researchers through what that number did and did not support.",
      "Presented pipeline capabilities and architecture to 1,000+ end users and senior leadership at the annual user meeting.",
    ],
  },
  {
    company: "VICE Lab",
    title: "Computational Systems Intern",
    date: "January 2020 - May 2021",
    description:
      "Ran hydropower models on a proprietary supercomputer, and made the results readable without an engineer present.",
    responsibilities: [
      "Parallelized model execution on Slurm HPC, cutting total runtime by 50%.",
      "Ported core Python logic to Cython for a further 30% runtime reduction.",
      "Built a Vue.js visualization layer stakeholders could read without an engineer's help.",
    ],
  },
];
