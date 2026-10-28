import { Product } from "@/types/products";

import cocoon from "../../public/images/projects/covers/cocoon.webp";
import verso from "../../public/images/projects/covers/verso.webp";
import unlinkd from "../../public/images/projects/covers/unlinkd.webp";
import fraudStream from "../../public/images/projects/covers/fraud-stream.webp";
import feedless from "../../public/images/projects/covers/feedless.webp";
import qsensorSim from "../../public/images/projects/covers/qsensor-sim.webp";
import tidyRoll from "../../public/images/projects/covers/tidy-roll.webp";
import tradingBot from "../../public/images/projects/covers/trading-bot.webp";
import TAlker from "../../public/images/projects/covers/talker.webp";
import blogAI from "../../public/images/projects/covers/blog-ai.webp";
import mergeGate from "../../public/images/projects/covers/merge-gate.webp";
import healthcalc from "../../public/images/projects/covers/healthcalc.webp";
import remedi from "../../public/images/projects/covers/remedi.webp";
import albumConceptualizer from "../../public/images/projects/covers/album-conceptualizer.webp";
import monkeySmp from "../../public/images/projects/covers/monkey-smp.webp";
import frontDesk from "../../public/images/projects/covers/front-desk.webp";
import hollowCrown from "../../public/images/projects/covers/hollow-crown.webp";
import fleetOrchestrator from "../../public/images/projects/covers/fleet-orchestrator.webp";
import homelab from "../../public/images/projects/covers/homelab.webp";
import financeOwl from "../../public/images/projects/covers/finance-owl.webp";
import mtgDeckLab from "../../public/images/projects/covers/mtg-deck-lab.webp";
import backtestAudit from "../../public/images/projects/covers/backtest-audit.webp";

export const products: Product[] = [
  // ============================================
  // FEATURED PROJECTS (6)
  // ============================================
  {
    href: "https://github.com/gr8monk3ys/cocoon",
    title: "Cocoon",
    description:
      "A privacy-first Chrome extension that lowers sensory load online: it softens algorithmic feeds, reduces motion, and keeps a grounding exercise one click away. No accounts, no analytics, nothing leaves the device.",
    thumbnail: cocoon,
    stack: ["TypeScript", "React", "Manifest V3", "Vite"],
    slug: "cocoon",
    thesis: "Lower the sensory load of the web",
    homeCard: {
      kicker: "Accessibility",
      blurb:
        "For people who find the web overwhelming: calmer feeds, less motion, and a breathing exercise one click away. No account, and nothing leaves their browser.",
      metrics: ["No account needed", "Zero network calls", "4 presets"],
      coverSrc: "/images/projects/covers/cocoon.webp",
    },
    featured: true,
    categories: ["tools", "open-source"],
    status: "active",
    startDate: "2026-02",
    demoUrl: "https://cocoon.lscaturchio.xyz/",
    sourceUrl: "https://github.com/gr8monk3ys/cocoon",
    caseStudy: {
      challenge:
        "Accessibility tooling for neurodivergent and mental-health needs is mostly built as a wellness product: an account, a subscription, and a dashboard that watches you. The people most helped by calmer browsing are the least well served by software that adds another surface to monitor.",
      solution:
        "A Manifest V3 extension where every adaptation is local and reversible. Profile presets (ADHD, Autism, Anxiety, Custom) set a baseline; feed cleaning, reduced motion, and color inversion adjust the page in place; scenario switches like Focus and Low stimulation expire on a timer and restore the baseline automatically.",
      results: [
        "Feed cleaning across seven platforms with three intensities and per-site overrides",
        "Scenario modes that self-expire at 15/30/60 minutes so a temporary change never becomes permanent",
        "Motion-free grounding overlay: guided breathing plus a 5-4-3-2-1 flow",
        "Host permissions scoped to exactly the supported domains — no <all_urls>",
      ],
      metrics: [
        { label: "Storage", value: "Local only" },
        { label: "Network calls", value: "Zero" },
        { label: "Presets", value: "4 profiles" },
        { label: "Scoped hosts", value: "7 domains" },
      ],
      process: [
        {
          title: "Rationale before rules",
          description:
            "Wrote down the intent behind each preset first (docs/PROFILE_RATIONALE.md) so the defaults could be argued with rather than assumed.",
        },
        {
          title: "Domain-scoped hiding",
          description:
            "Kept feed rules in one typed module per domain instead of a global stylesheet, so a broken selector degrades on one site rather than everywhere.",
        },
        {
          title: "Fail loudly, not silently",
          description:
            "Added a banner that warns when a site's layout changes and the rules stop matching — a silent no-op is the worst outcome for an accessibility tool.",
        },
        {
          title: "Expiry as a first-class idea",
          description:
            "Built scenario timers on service-worker alarms so the baseline restores itself without the user having to remember what they changed.",
        },
      ],
      whatIdDoNext: [
        "Ship the Chrome Web Store listing so installation stops requiring developer mode.",
        "Add a Firefox build — the MV3 surface is close enough that most of the content script carries over.",
        "Let presets be exported and shared, so an occupational therapist can hand someone a starting point.",
      ],
    },
    details: [
      "Built a Manifest V3 Chrome extension that reduces online overwhelm through feed cleaning, sensory controls, and a grounding overlay, with every setting stored locally via chrome.storage.local.",
      "Designed scenario quick-switches (Focus, Low stimulation, Calm reset, Social guardrails) that expire on a user-chosen timer and automatically restore the baseline profile.",
    ],
  },
  {
    href: "https://github.com/gr8monk3ys/verso",
    title: "Verso",
    description:
      "A diary for artworks — Letterboxd where the unit is an individual work, not a visit. Offline-first capture over a real catalogue of 10,000 works currently on view at The Met.",
    thumbnail: verso,
    stack: ["Next.js", "TypeScript", "SQLite", "Zod"],
    slug: "verso",
    thesis: "A diary for artworks, not visits",
    homeCard: {
      kicker: "Consumer App",
      blurb:
        "For museum-goers: log each work you stand in front of, even in a basement with no signal, and rate them later that evening. Letterboxd for paintings rather than visits.",
      metrics: ["10k Met works preloaded", "Works offline", "Rate later, in one queue"],
      coverSrc: "/images/projects/covers/verso.webp",
    },
    featured: true,
    categories: ["web-apps"],
    status: "active",
    startDate: "2026-07",
    sourceUrl: "https://github.com/gr8monk3ys/verso",
    caseStudy: {
      challenge:
        "Every previous attempt at a Letterboxd for art has stalled at one city, and the usual diagnosis is execution. The more likely one is frequency: a film enthusiast logs 50–150 titles a year, while a dedicated gallery-goer sees maybe 15 exhibitions. Fifteen events a year is too few to form a habit, and a feed with fifteen posts a year is not a feed.",
      solution:
        "Log works, not visits. One gallery visit contains fifteen things worth logging, which turns ~15 events a year into plausibly 150+. Every other product decision exists to protect that: the capture screen never navigates away, rating is always deferrable to an evening queue, and nothing waits for the network because gallery basements have no signal.",
      results: [
        "Committed seed catalogue of 10,000 works currently on view at The Met — the demo touches no network",
        "Offline-first capture writing to the device before sync",
        "Evening queue that returns unrated sightings one thumb at a time",
        "Year in Art recap built to be screenshotted",
      ],
      metrics: [
        { label: "Catalogue", value: "10k works" },
        { label: "Unit of record", value: "The work" },
        { label: "Capture", value: "Offline-first" },
        { label: "Thesis", value: "Measured, not assumed" },
      ],
      process: [
        {
          title: "Write the PRD first",
          description:
            "Started from docs/PRD.md so the frequency bet was stated explicitly and could be falsified rather than quietly assumed.",
        },
        {
          title: "Ingest a real catalogue",
          description:
            "Built ingestion for The Met (and Art Institute of Chicago) with a reconciliation pass, then committed the seed so nothing about the demo depends on an upstream API being up.",
        },
        {
          title: "Protect the capture loop",
          description:
            "Made logging re-shortlist for the next work instead of bouncing to a confirmation page — that bounce is exactly how work-logging reverts to visit-logging.",
        },
        {
          title: "Instrument the bet",
          description:
            "Added metric gates and an evaluation harness for catalogue reconciliation so the question 'is the frequency thesis holding' has a number attached to it.",
        },
      ],
      whatIdDoNext: [
        "Expand ingestion beyond two museums; the reconciliation arm is the hard part, not the fetching.",
        "Take the capture screen into an actual gallery basement and measure the offline path under real conditions.",
        "Test whether the evening queue survives contact with people who are not me.",
      ],
    },
    details: [
      "Designed and built an artwork-logging app around a single product bet — that logging individual works instead of visits raises logging frequency by an order of magnitude — and instrumented the app to measure whether that bet holds.",
      "Shipped offline-first capture, a deferred-rating evening queue, a social layer, and a committed 10,000-work seed catalogue so the whole app runs with no network access.",
    ],
  },
  {
    href: "https://github.com/gr8monk3ys/unlinkd",
    title: "unlinkd",
    description:
      "Get yourself removed from the internet — and keep the proof. A local-first, fully encrypted workspace for data-broker removal requests and the tamper-evident paper trail a GDPR or CCPA escalation actually needs.",
    thumbnail: unlinkd,
    stack: ["TypeScript", "Vite", "IndexedDB", "Web Crypto"],
    slug: "unlinkd",
    thesis: "Get removed from the internet, and keep the proof",
    featured: true,
    categories: ["tools", "open-source"],
    status: "active",
    startDate: "2026-02",
    sourceUrl: "https://github.com/gr8monk3ys/unlinkd",
    caseStudy: {
      challenge:
        "Removal is not the hard part; proving it is. Requests get ignored, brokers re-list you months later, and by the time you need to escalate you no longer remember what you sent, to whom, or when. The tools that promise to do this for you require handing your identifiers to a company — which is the same trade you were trying to get out of.",
      solution:
        "A browser-only workspace with no backend and no account. Personas, identifiers, accounts, findings, and evidence are encrypted with AES-256-GCM under a key derived from your passphrase by memory-hard scrypt, and every action appends to an HMAC-chained audit log that is verified on unlock.",
      results: [
        "Encrypted local vault and evidence store in IndexedDB with no server component",
        "HMAC-chained audit log verified automatically at unlock",
        "Auto-lock clears the decrypted vault and passphrase after 15 minutes",
        "Cross-tab safety via compare-and-swap writes and BroadcastChannel sync",
      ],
      metrics: [
        { label: "Encryption", value: "AES-256-GCM" },
        { label: "Key derivation", value: "scrypt" },
        { label: "Backend", value: "None" },
        { label: "Audit log", value: "HMAC-chained" },
      ],
      process: [
        {
          title: "Threat model first",
          description:
            "Wrote down what the audit chain does and does not protect against before building it, so the security claims stay bounded to what is true.",
        },
        {
          title: "Migrate old envelopes forward",
          description:
            "Legacy PBKDF2 and unversioned envelopes stay readable and are proactively re-encrypted with scrypt on the next unlock rather than stranding existing vaults.",
        },
        {
          title: "Bound hostile inputs",
          description:
            "Clamped KDF cost parameters read from stored or imported envelopes so a malicious backup cannot peg the tab with an absurd work factor.",
        },
        {
          title: "State the scope honestly",
          description:
            "The connector catalog is guided manual checklists — it captures and organizes evidence, it does not submit opt-outs for you. The README says so before the feature list does.",
        },
      ],
      whatIdDoNext: [
        "Broaden the connector catalog and formalize the governance cadence that keeps it from going stale.",
        "Add a hardware-key unlock path so the passphrase is not the only factor.",
        "Generate escalation-ready PDF bundles directly from the audit chain.",
      ],
    },
    details: [
      "Built a local-first, zero-backend workspace for data-broker and account removal that encrypts every record (personas, identifiers, accounts, findings, evidence, audit log) client-side under a scrypt-derived key.",
      "Implemented an HMAC-chained audit log, auto-lock, persistent-storage requests, backup-staleness warnings, and cross-tab compare-and-swap writes so the evidence trail survives real-world browser conditions.",
    ],
  },
  {
    href: "/projects/fraud-stream",
    title: "FraudStream",
    description:
      "A production-grade streaming pipeline that scores financial transactions for fraud in milliseconds rather than hours, built on Kafka, Spark Structured Streaming, and a Snowflake medallion warehouse.",
    thumbnail: fraudStream,
    stack: ["Python", "Apache Kafka", "Spark Streaming", "Snowflake"],
    slug: "fraud-stream",
    thesis: "Score a transaction for fraud in milliseconds, not hours",
    featured: true,
    categories: ["data-science", "open-source"],
    status: "archived",
    startDate: "2025-08",
    sourcePrivate: true,
    caseStudy: {
      challenge:
        "Financial institutions process thousands of card transactions a second, and hidden among them are account takeovers, card-testing attacks, and synthetic-identity fraud. Traditional batch processing surfaces these hours or days later — by which point the money is gone and the job is recovery, not prevention.",
      solution:
        "A streaming pipeline where transactions arrive through Kafka under Avro schema validation, pass multi-level data-quality checks, get enriched with velocity and anomaly features in Spark Structured Streaming, and land in Snowflake's Bronze/Silver/Gold layers. PII is masked with HMAC-SHA256 before anything is stored.",
      results: [
        "Eight distinct fraud patterns detected, including card testing, geographic impossibility, merchant collusion, and bust-out fraud",
        "Sub-second latency from transaction to alert",
        "Schema validation via Avro and a Schema Registry, with quality scoring and trend monitoring",
        "ML-ready feature set so a model can be dropped in without re-plumbing the pipeline",
      ],
      metrics: [
        { label: "Fraud patterns", value: "8" },
        { label: "Alert latency", value: "Sub-second" },
        { label: "Warehouse", value: "Medallion" },
        { label: "PII", value: "HMAC-SHA256" },
      ],
      process: [
        {
          title: "Contract at the edge",
          description:
            "Put Avro and a Schema Registry at ingestion so malformed producers fail at the boundary rather than corrupting downstream layers.",
        },
        {
          title: "Quality as a measured signal",
          description:
            "Layered required-field, type, range, and business-rule checks, then scored and trended quality so degradation triggers an alert instead of a silent drift.",
        },
        {
          title: "Feature engineering in-stream",
          description:
            "Calculated velocity metrics, risk scores, and geographic anomalies inside the streaming job so detection does not wait on a batch window.",
        },
        {
          title: "Mask before you store",
          description:
            "Applied HMAC-SHA256 to PII before the Bronze layer, so no raw identifier is ever written to the warehouse at rest.",
        },
      ],
      whatIdDoNext: [
        "Replace the rules layer with a trained model and hold the rules as a fallback and a baseline.",
        "Add drift detection on the feature distributions, not just the data-quality checks.",
        "Run a replay harness against labelled historical fraud to get real precision/recall numbers rather than pattern coverage.",
      ],
    },
    details: [
      "Engineered a real-time fraud detection pipeline processing financial transactions through Kafka, Spark Structured Streaming, and Snowflake, detecting eight fraud patterns with sub-second transaction-to-alert latency.",
      "Implemented Avro schema validation, multi-level data quality checks with scoring and trend monitoring, and HMAC-SHA256 PII masking ahead of the Bronze layer.",
    ],
  },
  {
    href: "https://github.com/gr8monk3ys/TAlker",
    title: "Talker",
    description:
      "An open source teaching assistant, built as a USC master's capstone, that drafts answers to course-forum questions from the lecture notes, with hybrid retrieval, a reranker, and an evaluation harness that scores its own retrieval.",
    thumbnail: TAlker,
    stack: ["Python", "LangChain", "ChromaDB", "Streamlit"],
    slug: "talker",
    thesis: "A teaching assistant that answers from the lecture notes",
    featured: true,
    categories: ["ai-ml", "open-source"],
    status: "archived",
    startDate: "2024-03",
    sourceUrl: "https://github.com/gr8monk3ys/TAlker",
    caseStudy: {
      challenge:
        "Students wait on course forums for answers that are already somewhere in the lecture notes. A chatbot that answers from general knowledge is worse than waiting: it is confident about a course it has never seen.",
      solution:
        "A retrieval-augmented assistant over the course's own material. Questions run through hybrid retrieval (BM25 plus vector search in ChromaDB), a cross-encoder reranker and LLM query expansion, and the answer is drafted from what was retrieved. An optional Piazza bot closes the loop on the course forum itself.",
      results: [
        "Hybrid BM25 + vector retrieval, so exact course terms and paraphrased questions both find their passage",
        "Five model providers behind one interface — OpenAI, Anthropic, Gemini, Cohere and Ollama — with Ollama for a fully local setup, and token cost tracked per provider",
        "A RAGAS-style LLM-as-judge harness that scores retrieval and answer quality instead of eyeballing it",
      ],
      metrics: [
        { label: "Retrieval", value: "BM25 + vector" },
        { label: "Providers", value: "5" },
        { label: "Evaluation", value: "LLM-as-judge" },
        { label: "Context", value: "MS capstone" },
      ],
      process: [
        {
          title: "Retrieval before generation",
          description:
            "Combined lexical and semantic search in one ensemble retriever, because course vocabulary is exactly the kind of term pure embeddings blur.",
        },
        {
          title: "Rerank the shortlist",
          description:
            "Added a cross-encoder pass over the retrieved passages so the context window holds the best few, not merely the first few.",
        },
        {
          title: "Measure the retriever",
          description:
            "Built a RAGAS-style evaluation harness so a change to chunking or retrieval comes with a score, not an impression.",
        },
        {
          title: "Meet students where they ask",
          description:
            "Wired an optional Piazza bot so drafted answers land on the course forum instead of in a separate app nobody opens.",
        },
      ],
    },
    details: [
      "Built a retrieval-augmented teaching assistant as a USC MS capstone, with hybrid BM25 + vector retrieval over ChromaDB, a cross-encoder reranker, and five interchangeable model providers.",
      "Added a RAGAS-style LLM-as-judge evaluation harness and an optional Piazza bot that drafts answers on the course forum.",
    ],
  },
  {
    href: "https://github.com/gr8monk3ys/trading-bot",
    title: "trading-bot",
    description:
      "An Alpaca paper-trading bot built to answer one question — can a retail momentum system beat the market? — and the measurement work that showed the answer is no. Over 2020–2024 the best validated strategy returned +16.3% against SPY's +95.3%.",
    thumbnail: tradingBot,
    stack: ["Python", "Alpaca API", "pandas", "TA-Lib"],
    slug: "ai-powered-trading-bot",
    thesis: "Measure the edge before you believe it",
    featured: false,
    categories: ["data-science", "open-source"],
    status: "maintained",
    startDate: "2024-01",
    sourceUrl: "https://github.com/gr8monk3ys/trading-bot",
    caseStudy: {
      challenge:
        "The first backtests said +646%, then +53%, then +42.9%. Every one was a measurement bug rather than an edge, and a backtest that flatters you is more dangerous than one that fails, because it is the one you trade.",
      solution:
        "Fix the measurement first. The four defects behind those numbers — exits that could never fire, a strategy blind to its own positions, short sales that booked no liability, and sizing off idle cash — were fixed, then turned into mechanical checks in a separate tool, backtest-audit, which now audits every committed result.",
      results: [
        "An honest headline: +16.3% (Sharpe 0.16) for the best validated strategy against +95.3% (0.75) for SPY buy-and-hold, 2020–2024",
        "Strategy and benchmark compared at matched gross exposure, so the comparison is like-for-like",
        "Superseded runs still audit as NOT TRUSTWORTHY, reconstructing their defects from the trade log alone",
        "Unvalidated research moved off main to an archive branch rather than left looking finished",
      ],
      metrics: [
        { label: "Best strategy", value: "+16.3%" },
        { label: "SPY, same window", value: "+95.3%" },
        { label: "Real capital", value: "None — paper only" },
        { label: "Audited by", value: "backtest-audit" },
      ],
      process: [
        {
          title: "Make exits reachable",
          description:
            "Found that the signal generator never emitted a sell and the engine never called the method holding exit logic, so every early run measured enter-and-hold.",
        },
        {
          title: "Book every liability",
          description:
            "Fixed position detection and naked shorts, which together had invented tens of thousands of dollars of cash in the backtest.",
        },
        {
          title: "A/B the filter",
          description:
            "Turned the Bollinger filter off to reach a statistically meaningful trade count, and found the unfiltered signal loses money.",
        },
        {
          title: "Make the lesson mechanical",
          description:
            "Extracted the four defects into backtest-audit so they are checked on every result instead of remembered.",
        },
      ],
      whatIdDoNext: [
        "Revisit pairs trading, the one archived research thread with a case for a second look.",
        "Push trade counts past the 50-trade significance bar before quoting any new result.",
      ],
    },
    details: [
      "Built an Alpaca paper-trading bot in async Python with a backtest engine modelling slippage and spread, a risk manager (VaR, correlation, sizing) and a daily-loss circuit breaker.",
      "Traced three inflated backtest results (+646%, +53%, +42.9%) to measurement bugs, published the honest result that the strategy does not beat buy-and-hold, and extracted the defects into an audit tool.",
    ],
  },
  // ============================================
  // ACTIVE PROJECTS
  // ============================================
  {
    href: "https://github.com/gr8monk3ys/feedless",
    title: "Feedless",
    description:
      "Hide the distracting parts of Instagram and Facebook — feeds, Reels, Stories, suggested posts, notification badges. Nineteen independent toggles, zero network requests.",
    thumbnail: feedless,
    stack: ["TypeScript", "Bun", "Vitest", "Playwright"],
    slug: "feedless",
    thesis: "Hide the distracting parts of Instagram and Facebook",
    featured: false,
    categories: ["tools", "open-source"],
    status: "archived",
    startDate: "2026-07",
    sourceUrl: "https://github.com/gr8monk3ys/feedless",
    caseStudy: {
      challenge:
        "Unhook solved this for YouTube years ago, but Meta's surfaces have no equivalent. Blunt blockers remove the whole site, which is not what most people want — they want Instagram's DMs without Instagram's Reels, and there is no setting for that.",
      solution:
        "One toggle per surface, nineteen of them, applied instantly with no page reload and no flash of hidden content. Feature definitions in src/features are the single source of truth: the popup UI, the generated hiding CSS, and the test suite are all derived from them.",
      results: [
        "19 independent toggles — 9 on Instagram, 10 on Facebook",
        "Instant apply with no reload and no flash of unhidden content",
        "Settings sync across browsers; per-site pause switch",
        "Zero analytics and zero network requests — the storage permission is the only one requested",
      ],
      metrics: [
        { label: "Toggles", value: "19" },
        { label: "Permissions", value: "storage only" },
        { label: "Network calls", value: "Zero" },
        { label: "Source of truth", value: "One module" },
      ],
      process: [
        {
          title: "One definition, three consumers",
          description:
            "Made the feature modules generate the popup UI, the hiding CSS, and the test fixtures, so adding a toggle cannot leave one of the three behind.",
        },
        {
          title: "Attribute-gated CSS",
          description:
            "Content scripts stamp data-df-* attributes on <html> at document_start and CSS does all the hiding — which is why there is no flash of content before the rules apply.",
        },
        {
          title: "Selector fixtures under test",
          description:
            "Pinned Meta's selectors in Playwright fixtures so a silent upstream markup change fails a test instead of quietly un-hiding a feed.",
        },
        {
          title: "Verify against the live site",
          description:
            "Kept a manual release checklist for live-site verification, because fixtures can only prove the selectors that were captured.",
        },
      ],
      whatIdDoNext: [
        "Automate detection of upstream markup drift rather than catching it at release time.",
        "Extend the same model to a third surface — the feature-definition layer is the reusable part.",
        "Publish to the Chrome Web Store and Firefox Add-ons.",
      ],
    },
    details: [
      "Built a browser extension hiding 19 individually toggleable Instagram and Facebook surfaces, derived from a single typed feature-definition module that also generates the hiding CSS and the test suite.",
      "Used document_start attribute stamping with attribute-gated CSS to apply changes instantly with no reload and no flash of hidden content, requesting only the storage permission.",
    ],
  },
  {
    href: "https://tidyroll-legal.vercel.app",
    title: "Tidy Roll",
    description:
      "A Tinder-swipe interface for cleaning up your camera roll. Swipe right to keep, left to toss, watch the megabytes tick up. Free, no ads, no accounts, entirely on-device.",
    thumbnail: tidyRoll,
    stack: ["React Native", "Expo", "TypeScript", "Next.js"],
    slug: "tidy-roll",
    thesis: "Swipe your camera roll clean",
    featured: false,
    categories: ["web-apps", "tools", "open-source"],
    status: "active",
    startDate: "2026-02",
    demoUrl: "https://tidyroll-legal.vercel.app",
    sourcePrivate: true,
    caseStudy: {
      challenge:
        "Photo cleanup apps are a well-known dark-pattern category: they upload your library, gate the delete behind a subscription, or quietly keep a copy. The interaction itself is also wrong — a multi-select grid asks you to make a hundred decisions at once, which is why nobody finishes.",
      solution:
        "Deal photos out one card at a time and make each decision binary. Deletes are staged, never immediate: you get a summary of everything you tossed and nothing is removed until you confirm. Everything runs on-device, through the system photo library, so the space you free is space you actually get back.",
      results: [
        "Native Android and iOS app operating on the real camera roll",
        "Web showcase with the actual swipe deck playable in-browser, no install",
        "Optional desktop extension that tidies any local folder",
        "Staged deletes with a confirmation summary; GPL-3.0, no ads, no accounts",
      ],
      metrics: [
        { label: "Platforms", value: "iOS + Android + web" },
        { label: "Processing", value: "100% on-device" },
        { label: "Deletes", value: "Staged" },
        { label: "License", value: "GPL-3.0" },
      ],
      process: [
        {
          title: "Fix the interaction first",
          description:
            "Chose one-card-at-a-time over multi-select because the failure mode of photo cleanup is abandonment, not inaccuracy.",
        },
        {
          title: "Stage every destructive action",
          description:
            "Routed deletes through the system photo library with an explicit confirmation step, so an accidental swipe is recoverable.",
        },
        {
          title: "Make the payoff visible",
          description:
            "Surfaced reclaimed megabytes live during the session — the counter is the reason people finish a month.",
        },
        {
          title: "Ship the deck to the web",
          description:
            "Reused the swipe deck on the marketing site so the core interaction can be tried before installing anything.",
        },
      ],
      whatIdDoNext: [
        "Add on-device duplicate and near-duplicate detection to pre-sort the deck.",
        "Get the EAS builds through Play and App Store review.",
        "Measure completion rate per session length to find where people actually stop.",
      ],
    },
    details: [
      "Built a cross-platform photo cleanup app with a card-swipe interaction, shipping a React Native/Expo mobile app, a Next.js showcase site with a playable demo deck, and an optional desktop browser extension.",
      "Implemented month-by-month sessions, On This Day, albums, and bookmarks with staged deletes through the system photo library so reclaimed space is real and every deletion is confirmed.",
    ],
  },
  {
    href: "/projects/qsensor-sim",
    title: "qsensor-sim",
    description:
      "A physics-based quantum sensor simulation API for GPS-denied navigation research — synthetic IMU data with quantum decoherence effects, processed through Kalman filtering and bias correction.",
    thumbnail: qsensorSim,
    stack: ["Python", "FastAPI", "Celery", "SciPy"],
    slug: "qsensor-sim",
    thesis: "Quantum sensing for navigation without GPS",
    featured: false,
    categories: ["data-science", "tools"],
    status: "archived",
    startDate: "2025-08",
    sourcePrivate: true,
    caseStudy: {
      challenge:
        "Quantum inertial sensors are a serious answer to GPS-denied navigation, but the hardware is scarce and classified-adjacent. Anyone wanting to develop the signal processing that sits downstream of such a sensor has no data to develop against.",
      solution:
        "Simulate the sensor instead. Generate physics-based trajectories, apply realistic noise and quantum decoherence effects, then run the synthetic output through the same calibration and filtering stack real navigation data would face — Kalman filtering, complementary filtering, and bias correction — exposed as an async job API.",
      results: [
        "Physics-based trajectory generation with quantum decoherence modeling",
        "Kalman and complementary filtering with bias correction on the processing side",
        "Asynchronous job processing via Celery and Redis with progress tracking",
        "FastAPI REST gateway with auto-generated docs, containerized for Docker and Kubernetes",
      ],
      metrics: [
        { label: "Domain", value: "GPS-denied nav" },
        { label: "Filters", value: "Kalman + complementary" },
        { label: "Jobs", value: "Async, tracked" },
        { label: "Runtime", value: "Python 3.13" },
      ],
      process: [
        {
          title: "Model the physics, then the noise",
          description:
            "Generated clean trajectories first and layered noise and decoherence on top, so the ground truth stays available for evaluating the filters.",
        },
        {
          title: "Make long jobs first-class",
          description:
            "Pushed simulation onto Celery workers with Redis as the broker, since a physically meaningful run is not a request-response operation.",
        },
        {
          title: "Expose progress, not just results",
          description:
            "Added job status and progress endpoints so a caller can tell the difference between slow and stuck.",
        },
        {
          title: "Keep an HPC escape hatch",
          description:
            "Left an optional gRPC service alongside the REST gateway for cases where the numerical work outgrows the Python worker.",
        },
      ],
      whatIdDoNext: [
        "Validate the noise model against published characterizations of real cold-atom interferometers.",
        "Add a benchmark suite comparing filter families on identical synthetic runs.",
        "Ship reproducible scenario definitions so results can be cited and re-run.",
      ],
    },
    details: [
      "Built a quantum sensor simulation API for GPS-denied navigation research, generating synthetic IMU-like data with physics-based trajectories and quantum decoherence effects, then processing it through calibration and filtering to clean navigation outputs.",
      "Implemented asynchronous job processing with Celery and Redis behind a FastAPI gateway, with progress tracking, auto-generated API docs, and Docker/Kubernetes deployment support.",
    ],
  },
  {
    href: "https://github.com/gr8monk3ys/blog-AI",
    title: "Blog-AI",
    description:
      "Generates blog posts and books in a trained brand voice: research, outline, per-section drafting, voice scoring, fact-checking and SEO, behind a Next.js front end and a FastAPI service.",
    thumbnail: blogAI,
    stack: ["Next.js", "FastAPI", "Python", "OpenAI / Anthropic / Gemini"],
    slug: "blog-ai",
    thesis: "Long-form drafts in a voice you trained",
    featured: false,
    categories: ["ai-ml", "tools"],
    status: "maintained",
    startDate: "2023-11",
    demoUrl: "https://blog-ai.vivancedata.com",
    sourceUrl: "https://github.com/gr8monk3ys/blog-AI",
    caseStudy: {
      challenge:
        "Generated content is cheap; generated content that sounds like the brand, makes claims it can support, and is structured for search is not. A single prompt produces the first kind.",
      solution:
        "Split generation into stages a person can inspect: research, outline, per-section drafting, a brand-voice score, a fact-check pass and SEO. Models sit behind one generate_text() interface, so OpenAI, Anthropic and Gemini are interchangeable per stage.",
      results: [
        "Staged pipeline from research to SEO rather than one long prompt",
        "Brand-voice scoring against a trained voice profile",
        "Fact-check stage for claims that need support",
        "Web app, API and a browser extension over the same pipeline",
      ],
      metrics: [
        { label: "Stages", value: "Research → SEO" },
        { label: "Providers", value: "3, swappable" },
        { label: "Outputs", value: "Posts + books" },
        { label: "Front end", value: "Next.js" },
      ],
      process: [
        {
          title: "Stage the pipeline",
          description: "Broke generation into research, outline, drafting, voice, fact-check and SEO so each step can be inspected and rerun alone.",
        },
        {
          title: "One model seam",
          description: "Put every provider behind generate_text() so swapping models is configuration rather than a rewrite.",
        },
        {
          title: "Score the voice",
          description: "Added a brand-voice score so 'sounds like us' is a number a draft has to clear.",
        },
        {
          title: "Check the claims",
          description: "Added a fact-check stage for claims that need a source.",
        },
      ],
    },
    details: [
      "Built a staged long-form generation pipeline (research, outline, per-section drafting, brand-voice scoring, fact-check, SEO) behind a FastAPI service and Next.js front end.",
      "Abstracted OpenAI, Anthropic and Gemini behind a single generation interface, with a browser extension over the same API.",
    ],
  },
  // ============================================
  // ARCHIVED
  // ============================================
  // ============================================
  // ADDED 2026-08-30 — recent public work with live deployments
  // ============================================
  {
    href: "https://github.com/gr8monk3ys/merge-gate",
    title: "merge-gate",
    description:
      "Keeps a fleet of repositories patched without a person reading every dependency update. It merges only changes that cannot alter behaviour, judged from the diff itself, and never grants standing permission to merge later changes.",
    thumbnail: mergeGate,
    stack: ["Python", "GitHub API", "pytest"],
    slug: "merge-gate",
    thesis: "Decide what merges without a human",
    homeCard: {
      kicker: "Automation",
      blurb:
        "Keeps a fleet of repositories patched without one person reading every update. Updates that cannot change behaviour merge on their own; anything that could waits for a human.",
      metrics: ["~80 repos kept current", "Behaviour changes always wait", "162 tests"],
      coverSrc: "/images/projects/covers/merge-gate.webp",
    },
    featured: true,
    categories: ["tools", "open-source"],
    status: "active",
    startDate: "2026-08",
    sourceUrl: "https://github.com/gr8monk3ys/merge-gate",
    caseStudy: {
      challenge:
        "A fleet of ~80 repos produces more pull requests than one person can read \u2014 mostly dependency bumps, mostly safe, occasionally not. Reviewing by eye does not scale, and the obvious shortcut is worse than the problem: GitHub's auto-merge grants standing permission to merge future content based on a judgement about past content.",
      solution:
        "Classify every PR by the shape of its diff, and merge only the shapes that cannot carry behaviour: lockfiles, tests, data artifacts, whitelisted CI fixes, and dependency bumps whose every version delta is patch or minor. Content never auto-merges. The gate merges a green PR immediately against the exact SHA it judged, and disables any standing arm it finds.",
      results: [
        "162 tests covering the classifier and the merge decision, with DECISIONS.md recording why each rule exists",
        "v0.8.0 (October 2026): REST transport with a GraphQL fallback, at most one merge per base branch per sweep, and parallel reads behind a cache",
        "Version deltas read from the PR body, not the title \u2014 a group bump titled '21 updates' names no versions but its body tabulates the majors that must block it",
        "A group is as risky as its riskiest member: bump_kind() takes the max",
        "requirements*.txt treated as a manifest, not a lockfile \u2014 the bug that let pytest 7\u21929 and cryptography 48\u219250 through",
      ],
      metrics: [
        { label: "Tests", value: "162" },
        { label: "Repos governed", value: "~80" },
        { label: "Arms granted", value: "Zero" },
        { label: "Policy surface", value: "3 constants" },
      ],
      process: [
        {
          title: "Measure before merging",
          description:
            "The classifier runs against the live fleet and prints its decision per PR, so the policy can be audited before it is trusted.",
        },
        {
          title: "Never arm auto-merge",
          description:
            "A PR armed as a minor bump was force-pushed to a major and merged 130 seconds later. No polling cadence catches that window, so arming was removed entirely rather than made faster.",
        },
        {
          title: "Judge the head you merge",
          description:
            "Merges pass --match-head-commit with the judged SHA; GitHub refuses server-side if the branch moved. A pending PR waits for the next sweep \u2014 that latency is the price of never merging unjudged content.",
        },
        {
          title: "Put the policy in three constants",
          description:
            "AUTO_MERGE_BUMP_KINDS, ZERO_MAJOR_MINOR_IS_BREAKING and TRUST_SHA_PINNED_ACTION_BUMPS sit at the top of the file. Changing what merges is a one-line, reviewable decision.",
        },
      ],
      whatIdDoNext: [
        "Publish the classification history so drift in the fleet's PR mix is visible over time.",
        "Let a repo carry its own overrides without forking the constants.",
      ],
    },
    details: [
      "Extracted the fleet's merge policy into a standalone public engine with 162 tests and a DECISIONS.md that records the reasoning behind each rule.",
      "Proved a tempting optimisation wrong with measurement: grouping Dependabot PRs to cut noise makes them strictly less mergeable here, because one 0.x minor or SHA-pinned action in a group demotes the whole PR.",
    ],
  },
  {
    href: "https://healthcalc.xyz",
    title: "HealthCalc",
    description:
      "56 health and fitness calculators \u2014 BMI, body fat, TDEE, GLP-1 tracking, Army fitness testing \u2014 each backed by a cited formula rather than a black box. No account, no paywall.",
    thumbnail: healthcalc,
    stack: ["Next.js", "TypeScript", "Tailwind", "Bun"],
    slug: "healthcalc",
    thesis: "Health calculators that show their formula",
    featured: false,
    categories: ["web-apps", "tools"],
    status: "active",
    startDate: "2025-02",
    demoUrl: "https://healthcalc.xyz",
    sourceUrl: "https://github.com/gr8monk3ys/healthcalc.xyz",
    caseStudy: {
      challenge:
        "Health calculators online are mostly ad-farms: the number appears, the formula behind it does not, and the page wants an email before it will tell you anything. The arithmetic is trivial \u2014 the trust is the hard part.",
      solution:
        "Every calculator names the formula it uses and links the source. Nothing is gated, nothing requires an account, and the unit system is a first-class toggle rather than an assumption baked into the inputs.",
      results: [
        "56 calculators, each showing its underlying formula",
        "Metric and imperial as a global toggle, not per-form",
        "No account required for any calculator",
        "Guides alongside the tools so the number has context",
      ],
      metrics: [
        { label: "Calculators", value: "56" },
        { label: "Account required", value: "None" },
        { label: "Formulas", value: "Cited" },
        { label: "Cost", value: "Free" },
      ],
    },
  },
  {
    href: "https://remedi.vivancedata.com",
    title: "Remedi",
    description:
      "Search a drug or supplement and get evidence-based natural alternatives, with the strength of evidence and the dosage guidance attached \u2014 not just a list of herbs.",
    thumbnail: remedi,
    stack: ["Next.js", "TypeScript", "Prisma", "Postgres"],
    slug: "remedi",
    thesis: "Alternatives with the evidence attached",
    featured: false,
    categories: ["web-apps", "ai-ml"],
    status: "active",
    startDate: "2025-02",
    demoUrl: "https://remedi.vivancedata.com",
    sourceUrl: "https://github.com/gr8monk3ys/remedi",
    caseStudy: {
      challenge:
        "Natural-remedy content is the worst-quality corner of health search: confident claims, no sourcing, and no way to tell a well-studied intervention from folklore. The failure mode of building here is producing more of the same.",
      solution:
        "Every remedy carries an evidence level and scientific references, so a weak result is visibly weak rather than presented with the same confidence as a strong one. Search accepts a drug name, a symptom, or a plain-language description.",
      results: [
        "Evidence level and references attached to every remedy",
        "Search by drug, symptom, or natural-language description",
        "Comparison view for weighing alternatives side by side",
      ],
      metrics: [
        { label: "Every remedy", value: "Cited" },
        { label: "Search modes", value: "3" },
        { label: "Evidence", value: "Graded, not implied" },
      ],
    },
  },
  {
    href: "https://album-conceptualizer.vercel.app",
    title: "Album Conceptualizer",
    description:
      "Turn one idea into a coherent album blueprint \u2014 album bible, tracklist, lyric drafts, chord progressions, narrative arcs \u2014 and hand off to a DAW. A blueprint, not an audio generator.",
    thumbnail: albumConceptualizer,
    stack: ["Python", "Next.js", "FastAPI"],
    slug: "album-conceptualizer",
    thesis: "One idea into an album blueprint",
    featured: false,
    categories: ["ai-ml", "web-apps"],
    status: "active",
    startDate: "2026-01",
    demoUrl: "https://album-conceptualizer.vercel.app",
    sourceUrl: "https://github.com/gr8monk3ys/album-conceptualizer",
    caseStudy: {
      challenge:
        "Generative music tools produce audio nobody asked for and skip the part that is actually hard: deciding what an album is about and keeping thirteen tracks pointed in the same direction. The blank session, not the missing waveform, is where records stall.",
      solution:
        "Work before the DAW, not instead of it. The output is an album bible \u2014 themes, motifs, references, narrative rules \u2014 plus a tracklist, lyric drafts and chord progressions, exported as MIDI, ChordPro and MusicXML so a human finishes the record.",
      results: [
        "Album bible carrying themes, motifs and narrative rules across the tracklist",
        "DAW handoff: MIDI, ChordPro, MusicXML export packs",
        "Comments, versions and remix handoff in one workspace",
        "Explicitly not an audio generator \u2014 a blueprint a musician executes",
      ],
      metrics: [
        { label: "Unit of work", value: "The album" },
        { label: "Export", value: "MIDI · ChordPro · MusicXML" },
        { label: "Generates audio", value: "No, deliberately" },
      ],
    },
  },
  // ============================================
  // ADDED 2026-10-28 — September and October work
  // ============================================
  {
    href: "https://monkeysmp.lscaturchio.xyz",
    title: "Monkey SMP",
    description:
      "A whitelisted, modded Minecraft Java factions server I run, with a one-command installer for every platform, a live world map, and pull-based deploys that update the server overnight after a backup.",
    thumbnail: monkeySmp,
    stack: ["Fabric", "PowerShell", "Python", "Docker"],
    slug: "monkey-smp",
    thesis: "A modded server friends can join in one command",
    homeCard: {
      kicker: "Games",
      blurb:
        "For a group of friends who want a modded Minecraft season without an afternoon of setup: one installer on any platform, a live map, and a server that updates itself overnight.",
      metrics: ["166 server mods", "Windows · macOS · Linux", "v2.8.0 live"],
      coverSrc: "/images/projects/covers/monkey-smp.webp",
    },
    featured: true,
    categories: ["games", "tools"],
    status: "active",
    startDate: "2026-10",
    demoUrl: "https://monkeysmp.lscaturchio.xyz",
    sourcePrivate: true,
    caseStudy: {
      challenge:
        "A modded server is only as good as the number of friends who manage to join it. Every client needs the exact same mod versions, nobody wants to read a setup guide, and the person running it does not want to SSH in every time a mod updates.",
      solution:
        "Pin every mod by hash in one manifest and download it from its original source, so nothing is redistributed and nothing drifts. One installer, run through a pinned PowerShell 7, installs the matching client on Windows, macOS and Linux. The server pulls its own releases: it polls for new tags and deploys in a 4 AM window, after a backup and an in-game warning.",
      results: [
        "Moved from Paper to Fabric in v2.0.0",
        "One installer for Windows, macOS, Linux and Docker",
        "An HTTPS world map, clipped to the world border, at map.monkeysmp.lscaturchio.xyz",
        "Traced server lag to a permissions mod and removed it in v2.7.0",
        "Season I opens Saturday 21 November 2026",
      ],
      metrics: [
        { label: "Server mods", value: "166" },
        { label: "Releases", value: "10" },
        { label: "Tests", value: "451 pytest + 127 Pester" },
        { label: "ADRs", value: "8" },
      ],
      process: [
        {
          title: "Verify, don't redistribute",
          description:
            "Every mod is downloaded from its own author's host and checked against a hash pinned in the manifest. The pack never ships anyone else's jar.",
        },
        {
          title: "One installer, every platform",
          description:
            "Rather than three scripts that drift, the installer runs on a pinned PowerShell 7 everywhere, so a fix lands on every platform at once.",
        },
        {
          title: "Pull, don't push",
          description:
            "The server watches for tagged releases and deploys itself overnight, after a backup and a warning in chat. Shipping a release is tagging it.",
        },
        {
          title: "Rehearse the release",
          description:
            "Releases go through a rehearsal before they are tagged, and a consolidation pass after v2.7.0 simplified the architecture they ship.",
        },
      ],
      whatIdDoNext: [
        "A season calendar and a job runner on the server, planned for v2.9.0.",
        "Publish the client pack on Modrinth once its review allows it.",
      ],
    },
    details: [
      "Built and run a whitelisted, modded Minecraft Java server on Fabric, with hash-pinned mods, a cross-platform installer and a live HTTPS world map.",
      "Automated deploys as a pull: the server polls for tagged releases and updates itself in an overnight window after a backup.",
    ],
  },
  {
    href: "https://github.com/gr8monk3ys/discord-server",
    title: "Front Desk",
    description:
      "The bot that runs the Chill Gamers Discord: levels, roles, moderation, a Minecraft bridge, and a catch-up summary of what you missed, written by a local model. It replaced two hosted bots.",
    thumbnail: frontDesk,
    stack: ["Python", "discord.py", "SQLite", "Ollama"],
    slug: "front-desk",
    thesis: "One bot instead of two hosted ones",
    featured: false,
    categories: ["tools", "open-source"],
    status: "active",
    startDate: "2026-09",
    demoUrl: "https://discord.lscaturchio.xyz",
    sourceUrl: "https://github.com/gr8monk3ys/discord-server",
    caseStudy: {
      challenge:
        "A small community server ends up renting its personality from hosted bots: one for levels, one for moderation, each with a paywall on the feature you actually want and no way to make them talk to each other.",
      solution:
        "Write the server's one bot. Front Desk replaces Lurkr and MEE6 with cogs it owns, bridges chat to the Minecraft server, and summarises a channel you missed with a model running locally, so a conversation never leaves the machine to be summarised.",
      results: [
        "Replaced Lurkr and MEE6 with one bot the server owns",
        "A Minecraft bridge, and a ping when three or more players are online, read from the public status protocol only",
        "/catchup summaries from a local Ollama model",
        "A security pass on the rewards system, and a self-check that reports missing permissions before a command fails",
        "A landing page and ban-appeal form at discord.lscaturchio.xyz",
      ],
      metrics: [
        { label: "Tests", value: "4,334 bot + 278 server" },
        { label: "Cogs", value: "48" },
        { label: "Release", value: "v1.0.0" },
        { label: "Hosted bots replaced", value: "2" },
      ],
      process: [
        {
          title: "Replace, then extend",
          description:
            "Rebuilt what the hosted bots did as cogs the server owns, then added what they could not do: the Minecraft bridge and local summaries.",
        },
        {
          title: "Keep logic out of cogs",
          description:
            "Discord handlers are thin; the rules live in plain modules that the test suite exercises without a gateway connection.",
        },
        {
          title: "Audit the economy",
          description:
            "Ran a security pass over the rewards system before the server relied on it.",
        },
        {
          title: "Fail loudly about permissions",
          description:
            "A self-check names the permissions the bot is missing, instead of a command failing silently later.",
        },
      ],
    },
    details: [
      "Built the single bot that runs a community Discord, replacing two hosted bots with owned cogs, a Minecraft bridge and local-model catch-up summaries.",
      "Covered it with a CI-run test suite of over four thousand tests and a startup permission self-check.",
    ],
  },
  {
    href: "/projects/hollow-crown",
    title: "Hollow Crown",
    description:
      "A rooftop stealth game in Godot about a thief who robs a greedy crown to feed a village, with a ten-night roguelite mode, The Long Winter.",
    thumbnail: hollowCrown,
    stack: ["Godot", "GDScript", "Jolt"],
    slug: "hollow-crown",
    thesis: "Steal from the crown, keep the village alive",
    featured: false,
    categories: ["games"],
    status: "active",
    startDate: "2026-10",
    sourcePrivate: true,
    videoSrc: "/videos/hollow-crown-trailer.mp4",
    caseStudy: {
      challenge:
        "Stealth games usually end the moment the heist does. The question here was whether what you steal could matter after you get home — whether a village with needs could turn a run of rooftop thefts into a reason to go out again.",
      solution:
        "A loop in two halves: rooftop heists through the town with a kit of vault powers, and a village that the take goes back to. The Long Winter compresses that into a ten-night run.",
      results: [
        "Three waves of greybox gameplay, then two architecture passes",
        "The Long Winter, a ten-night roguelite mode",
        "Every note from the 26 October playtest fixed",
        "A first trailer",
      ],
      metrics: [
        { label: "Engine", value: "Godot 4.7" },
        { label: "Test functions", value: "117" },
        { label: "Vault powers", value: "7" },
        { label: "Public build", value: "Not yet" },
      ],
      process: [
        {
          title: "Greybox in waves",
          description:
            "Built the game in greybox waves and played each one, so the feel was settled before anything was expensive to change.",
        },
        {
          title: "Headless tests for a game",
          description:
            "Scenes run headless in a test harness, so a guard's sight cone or a vault's timing is checked the same way a function would be.",
        },
        {
          title: "Playtest, then fix everything",
          description:
            "Took a full playtest's notes as a backlog and closed every one, instead of picking the convenient half.",
        },
      ],
      whatIdDoNext: [
        "Five more vault tricks.",
        "Seed codes so a Long Winter run can be shared and replayed.",
        "Voiced guard barks.",
      ],
    },
    details: [
      "Building a rooftop stealth game in Godot 4.7 with a village-economy loop and a ten-night roguelite mode, tested with headless scene suites.",
    ],
  },
  {
    href: "/projects/fleet-orchestrator",
    title: "Fleet Orchestrator",
    description:
      "Scheduled Claude routines that keep my repositories healthy without me: dependency hygiene, CI repair, test backfill and PR shepherding, with every merge decision handed to merge-gate.",
    thumbnail: fleetOrchestrator,
    stack: ["Python", "Claude Code", "GitHub API"],
    slug: "fleet-orchestrator",
    thesis: "Maintenance that runs while I'm doing something else",
    featured: false,
    categories: ["ai-ml", "tools"],
    status: "active",
    startDate: "2026-06",
    sourcePrivate: true,
    caseStudy: {
      challenge:
        "Dozens of repositories each need the same unglamorous care — dependencies bumped, flaky CI repaired, untested code covered, stale PRs moved along. Done by hand it never happens; done by agents with no structure, it happens noisily and occasionally wrong.",
      solution:
        "A registry of repositories, a declared schedule of loops per repository, and a hard boundary: agents propose, but whether anything merges is decided by merge-gate, a separate deterministic policy engine. Each run passes an admission step and records what it did in a ledger.",
      results: [
        "986 fleet PRs merged in the 60 days to 6 September 2026, about 115 a week",
        "Every repository audited against one scorecard before the first loop ran",
        "Merge policy moved out into merge-gate rather than vendored into each loop",
        "A run that cannot reach GitHub now fails, instead of reporting an empty queue as success",
      ],
      metrics: [
        { label: "In the registry", value: "78" },
        { label: "With active loops", value: "42" },
        { label: "PRs merged / week", value: "~115" },
        { label: "ADRs", value: "10" },
      ],
      process: [
        {
          title: "Audit before automating",
          description:
            "Scored every repository on one scorecard first, so the loops started from a known baseline rather than discovering it.",
        },
        {
          title: "Separate proposing from merging",
          description:
            "Agents open PRs; merge-gate decides. The judgement that can lose data is the one part that is not a model.",
        },
        {
          title: "Admission and a ledger",
          description:
            "Each run passes an admission step and records what it did, so a week of automation can be read back afterwards.",
        },
        {
          title: "Declare the schedule",
          description:
            "Which loop runs where, and when, is one declared file rather than a set of hand-made scheduled tasks.",
        },
      ],
    },
    details: [
      "Built a scheduler of Claude routines that maintains a fleet of repositories — dependency hygiene, CI repair, test backfill, PR shepherding — with merges delegated to a deterministic policy engine.",
    ],
  },
  {
    href: "https://github.com/gr8monk3ys/homelab",
    title: "homelab",
    description:
      "The second version of my homelab: a K3s cluster with a declarative service catalogue, TLS from cert-manager, secrets encrypted in git, and a Prometheus stack watching all of it. It replaced a Raspberry Pi running Docker Compose.",
    thumbnail: homelab,
    stack: ["Kubernetes", "K3s", "Traefik", "Prometheus"],
    slug: "homelab",
    thesis: "Self-hosting as a catalogue, not a pile",
    featured: false,
    categories: ["tools", "open-source"],
    status: "active",
    startDate: "2026-01",
    sourceUrl: "https://github.com/gr8monk3ys/homelab",
    caseStudy: {
      challenge:
        "pi-lab answered whether one Raspberry Pi could carry a homelab, and then hit the limits of Compose: every service its own snowflake, secrets in env files, and no way to say which services should exist without reading every directory.",
      solution:
        "Describe each service once in a catalogue, choose what is installed per environment, and let the cluster converge. Traefik and cert-manager handle ingress and TLS, External Secrets with SOPS and age keep secrets encrypted in git, and kube-prometheus-stack watches everything. ArgoCD is optional.",
      results: [
        "A 65-entry service catalogue: 18 installed by default, the rest opt-in",
        "58 of 64 manifests applied cleanly to a real API server, not just linted",
        "31 of 31 Prometheus targets up on the first real deploy",
        "Garage replaced MinIO for object storage",
      ],
      metrics: [
        { label: "Catalogue", value: "65 entries" },
        { label: "Default install", value: "18" },
        { label: "Prometheus targets", value: "31/31 up" },
        { label: "ADRs", value: "10" },
      ],
      process: [
        {
          title: "Catalogue first",
          description:
            "Refactored the service list into a catalogue so adding a service is one entry, and choosing what runs is configuration.",
        },
        {
          title: "Test against a real API server",
          description:
            "Applied the manifests to a real Kubernetes API server, which catches failures that schema linting passes.",
        },
        {
          title: "Deploy, then measure",
          description:
            "Counted Prometheus targets after the first real deploy rather than assuming the monitoring was wired.",
        },
      ],
    },
    details: [
      "Rebuilt a self-hosted homelab as a K3s cluster with a declarative service catalogue, cert-manager TLS, SOPS-encrypted secrets and a Prometheus stack.",
    ],
  },
  {
    href: "https://github.com/gr8monk3ys/finance-owl",
    title: "Finance Owl",
    description:
      "A personal finance app — bank sync, budgets, investments — across web and mobile, where the AI features are optional and can run on a local model.",
    thumbnail: financeOwl,
    stack: ["NestJS", "SvelteKit", "Expo", "Postgres"],
    slug: "finance-owl",
    thesis: "Personal finance with the AI optional",
    featured: false,
    categories: ["web-apps", "ai-ml"],
    status: "active",
    startDate: "2026-02",
    sourceUrl: "https://github.com/gr8monk3ys/finance-owl",
    caseStudy: {
      challenge:
        "Finance apps want your bank login and then send your transactions to a model you did not choose. The useful parts — a budget, a categorised ledger, an investment view — do not need either compromise.",
      solution:
        "A NestJS API with Drizzle on Postgres, a SvelteKit web app and an Expo mobile app over the same API. Plaid handles bank sync; a rules-based categorizer runs before any model is asked; and the AI layer can point at a local Ollama model or be switched off.",
      results: [
        "Rules-based categorisation first, AI only for what the rules cannot place",
        "Passkeys and TOTP, with the 2FA QR code rendered locally rather than by a third party",
        "An idempotent Stripe webhook and a real job scheduler",
        "One pricing source instead of prices restated across the app",
      ],
      metrics: [
        { label: "API modules", value: "26" },
        { label: "Test files", value: "59" },
        { label: "Merged PRs", value: "91" },
        { label: "Status", value: "Pre-launch" },
      ],
      process: [
        {
          title: "Rules before models",
          description:
            "Put a deterministic categorizer in front of the AI, so most transactions never reach a model at all.",
        },
        {
          title: "Make payments idempotent",
          description:
            "Made the Stripe webhook safe to receive twice, because webhooks are delivered at least once.",
        },
        {
          title: "Keep secrets local",
          description:
            "Rendered the TOTP enrolment QR code on the server instead of sending the secret to an image service.",
        },
      ],
    },
    details: [
      "Building a personal finance app with a NestJS API, SvelteKit web and Expo mobile clients, Plaid sync, passkeys, and an optional local-model AI layer.",
    ],
  },
  {
    href: "/projects/mtg-deck-lab",
    title: "MTG Deck Lab",
    description:
      "Builds Magic: The Gathering Commander decks as an optimisation problem: a mixed-integer program picks 99 cards for a commander, bracket and budget, then a Monte Carlo simulator goldfishes the result ten thousand times.",
    thumbnail: mtgDeckLab,
    stack: ["Python", "SciPy", "Next.js", "Neon"],
    slug: "mtg-deck-lab",
    thesis: "Deckbuilding as an optimisation problem",
    featured: false,
    categories: ["data-science", "web-apps"],
    status: "active",
    startDate: "2026-10",
    sourcePrivate: true,
    caseStudy: {
      challenge:
        "Commander deckbuilding is a constrained search: 99 singleton cards, a colour identity, a power bracket the table agreed on, and a budget. People do it by intuition and spreadsheets, and the result is rarely checked before it is played.",
      solution:
        "Model the deck as a mixed-integer linear program with constraints for colour identity, bracket and budget. Combos flagged by the Commander Spellbook estimator are forbidden outright, so a deck cannot drift above its bracket. All eight budget tiers are solved together so each cheaper deck is nested inside the next.",
      results: [
        "Eight nested budget tiers from one solve",
        "Bracket-breaking combos excluded as hard constraints",
        "A 10,000-game goldfish simulation for every deck",
        "Forty decks each for two commanders",
      ],
      metrics: [
        { label: "Cards per deck", value: "99" },
        { label: "Budget tiers", value: "8, nested" },
        { label: "Simulated games", value: "10,000" },
        { label: "Test functions", value: "656" },
      ],
      process: [
        {
          title: "Constraints, not heuristics",
          description:
            "Wrote the rules of a legal, on-bracket deck as constraints, so the solver cannot return one that breaks them.",
        },
        {
          title: "Nest the budgets",
          description:
            "Solved every budget tier together so upgrading a deck is adding cards, not rebuilding it.",
        },
        {
          title: "Simulate before trusting",
          description:
            "Goldfished every deck ten thousand times to check it actually curves out the way the model claims.",
        },
      ],
    },
    details: [
      "Built a Commander deck optimiser as a mixed-integer program with nested budget tiers and bracket constraints, verified by a 10,000-game Monte Carlo simulation.",
    ],
  },
  {
    href: "https://github.com/gr8monk3ys/backtest-audit",
    title: "backtest-audit",
    description:
      "Audits a trading backtest from its trade log and returns a verdict: TRUSTWORTHY or NOT TRUSTWORTHY. Built from the measurement bugs that made my own trading bot look profitable.",
    thumbnail: backtestAudit,
    stack: ["Python", "GitHub Actions"],
    slug: "backtest-audit",
    thesis: "A verdict on a backtest, from its trade log alone",
    featured: false,
    categories: ["data-science", "tools", "open-source"],
    status: "active",
    startDate: "2026-08",
    sourceUrl: "https://github.com/gr8monk3ys/backtest-audit",
    caseStudy: {
      challenge:
        "My trading bot's backtests said +646%, then +53%, then +42.9%. Each was a measurement bug, and each looked like a result. A backtest that flatters you is the one you end up trusting.",
      solution:
        "Turn each bug into a mechanical check over the trade log: exits that never fire, positions the strategy cannot see, shorts with no liability booked, sizing off idle cash. The audit returns a verdict, and an unjudged check is never a pass.",
      results: [
        "Reconstructs all three of trading-bot's inflated results from their trade logs alone",
        "Runs as a GitHub Action, so a committed result is audited before it is quoted",
        "Zero runtime dependencies",
        "An unjudged check counts against the verdict, never for it",
      ],
      metrics: [
        { label: "Checks", value: "8" },
        { label: "Tests", value: "43" },
        { label: "Dependencies", value: "Zero" },
        { label: "Release", value: "v0.1.0" },
      ],
      process: [
        {
          title: "Start from real failures",
          description:
            "Every check began as a bug that had already produced a convincing number, not as a hypothetical.",
        },
        {
          title: "Need only the trade log",
          description:
            "The audit reads the log a backtest already writes, so it works on results from code it has never seen.",
        },
        {
          title: "Fail closed",
          description:
            "If a check cannot decide, the verdict is NOT TRUSTWORTHY. Silence is not evidence.",
        },
      ],
    },
    details: [
      "Extracted four backtest measurement bugs into a zero-dependency audit tool that returns a verdict from a trade log and runs as a CI action.",
    ],
  },
];
