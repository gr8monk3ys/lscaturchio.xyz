import { Product } from "@/types/products";

import cocoon from "../../public/images/logos-modern/cocoon.svg";
import verso from "../../public/images/logos-modern/verso.svg";
import unlinkd from "../../public/images/logos-modern/unlinkd.svg";
import fraudStream from "../../public/images/logos-modern/fraud-stream.svg";
import feedless from "../../public/images/logos-modern/feedless.svg";
import qsensorSim from "../../public/images/logos-modern/qsensor-sim.svg";
import tidyRoll from "../../public/images/logos-modern/tidy-roll.svg";
import piLab from "../../public/images/logos-modern/pi-lab.svg";
import tradingBot from "../../public/images/logos-modern/trading-bot.svg";
import TAlker from "../../public/images/logos-modern/talker.svg";
import blogAI from "../../public/images/logos-modern/blog-ai.svg";
import paperSummarizer from "../../public/images/logos-modern/paper-summarizer.svg";

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
    featured: true,
    categories: ["tools", "open-source"],
    status: "active",
    startDate: "2026-02",
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
    href: "https://github.com/gr8monk3ys/fraud-stream",
    title: "FraudStream",
    description:
      "A production-grade streaming pipeline that scores financial transactions for fraud in milliseconds rather than hours, built on Kafka, Spark Structured Streaming, and a Snowflake medallion warehouse.",
    thumbnail: fraudStream,
    stack: ["Python", "Apache Kafka", "Spark Streaming", "Snowflake"],
    slug: "fraud-stream",
    featured: true,
    categories: ["data-science", "open-source"],
    status: "active",
    startDate: "2025-08",
    sourceUrl: "https://github.com/gr8monk3ys/fraud-stream",
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
      "An open source teaching assistant RAG leveraging OLlama2 with a FAISS knowledge base. Increased student engagement by 30% and learning efficiency by 25%.",
    thumbnail: TAlker,
    stack: ["Python", "FAISS", "OLlama2", "RAG"],
    slug: "talker",
    featured: true,
    categories: ["ai-ml", "open-source"],
    status: "active",
    startDate: "2024-01",
    sourceUrl: "https://github.com/gr8monk3ys/TAlker",
    caseStudy: {
      challenge: "Students struggled to get timely answers to course-specific questions outside of office hours, leading to bottlenecks and disengagement.",
      solution: "Built a RAG-powered teaching assistant using OLlama2 and FAISS that answers questions based on class syllabus, slides, and materials. Added multi-modal support including YouTube videos with timestamp links.",
      results: [
        "30% increase in student engagement",
        "25% improvement in learning efficiency",
        "Multi-modal responses with video timestamps",
        "Open source with community contributions"
      ],
      metrics: [
        { label: "Engagement", value: "+30%" },
        { label: "Learning efficiency", value: "+25%" },
        { label: "Answer style", value: "Citations-first" },
        { label: "Modalities", value: "Text + video" },
      ],
      process: [
        {
          title: "Source corpus",
          description: "Collected course syllabus, slides, and materials; normalized formats for consistent chunking.",
        },
        {
          title: "Index + retrieval",
          description: "Chunked content into semantically coherent spans and indexed with FAISS for fast retrieval.",
        },
        {
          title: "Grounded generation",
          description: "Used retrieved context to generate answers with citations and optional video timestamps when available.",
        },
        {
          title: "Iteration",
          description: "Measured usage/feedback, tightened prompts/guardrails, and improved citations and fallback behavior.",
        },
      ],
      whatIdDoNext: [
        "Add an eval harness for retrieval quality (recall@k, faithfulness) and regression tests.",
        "Introduce caching + rate limiting for peak traffic periods and more robust context selection.",
        "Improve citation UX: quote snippets, highlight sources, and add per-source confidence.",
      ],
    },
    details: [
      "Implemented and collaborated on an open source teaching assistant RAG leveraging OLlama2 with a FAISS knowledge base, answering students' questions based on class criteria, syllabus, and slides, increasing student engagement by 30%.",
      "Included features of providing multi-modal results to queries from classrooms such as YouTube videos with video time queues based on question context, enhancing learning efficiency by 25%.",
    ],
  },
  {
    href: "https://github.com/gr8monk3ys/trading-bot",
    title: "AI-Powered Trading Bot",
    description:
      "An advanced AI-driven stock trading bot leveraging FinBERT sentiment analysis, technical indicators, and sophisticated risk management for automated intelligent trading.",
    thumbnail: tradingBot,
    stack: ["Python", "FinBERT", "Alpaca Trading API", "Pandas"],
    slug: "ai-powered-trading-bot",
    featured: true,
    categories: ["ai-ml", "data-science"],
    status: "maintained",
    startDate: "2023-08",
    sourceUrl: "https://github.com/gr8monk3ys/trading-bot",
    caseStudy: {
      challenge: "Manual trading is emotional and time-consuming. Traders need systematic approaches that combine market sentiment with technical analysis while managing risk.",
      solution: "Built an automated trading system combining FinBERT sentiment analysis of financial news with technical indicators (SMA, RSI). Implemented strict risk management with portfolio-wide and position-level limits.",
      results: [
        "Automated trading with sentiment + technical signals",
        "Real-time and paper trading modes",
        "Portfolio-wide risk management",
        "Integration with Alpaca Trading API"
      ],
      metrics: [
        { label: "Signals", value: "Sentiment + TA" },
        { label: "Risk controls", value: "Portfolio + position" },
        { label: "Modes", value: "Paper + live" },
        { label: "Broker", value: "Alpaca API" },
      ],
      process: [
        {
          title: "Feature design",
          description: "Combined FinBERT news sentiment with technical indicators (SMA/RSI) to produce a single signal.",
        },
        {
          title: "Risk layer",
          description: "Implemented portfolio-wide and per-position limits to bound downside before any order is placed.",
        },
        {
          title: "Paper trading",
          description: "Validated the strategy against live data with no capital at risk before enabling execution.",
        },
        {
          title: "Execution + monitoring",
          description: "Wired the Alpaca API for order placement and logged fills, signals, and risk states for review.",
        },
      ],
      whatIdDoNext: [
        "Add walk-forward backtesting with transaction costs and slippage modeled honestly.",
        "Introduce regime detection so the strategy stands down in conditions it was not designed for.",
        "Track live-vs-paper divergence as a first-class metric.",
      ],
    },
    details: [
      "Engineered an AI-powered trading bot that automates stock trading by analyzing market sentiment using FinBERT and integrating key technical indicators such as SMA and RSI. The bot employs strict risk management strategies, including portfolio-wide and individual position risk limits.",
      "Integrated with the Alpaca Trading API, enabling real-time trading and paper trading for safe strategy testing before live deployment.",
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
    featured: false,
    categories: ["tools", "open-source"],
    status: "active",
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
    href: "https://github.com/gr8monk3ys/tidy-roll",
    title: "Tidy Roll",
    description:
      "A Tinder-swipe interface for cleaning up your camera roll. Swipe right to keep, left to toss, watch the megabytes tick up. Free, no ads, no accounts, entirely on-device.",
    thumbnail: tidyRoll,
    stack: ["React Native", "Expo", "TypeScript", "Next.js"],
    slug: "tidy-roll",
    featured: false,
    categories: ["web-apps", "tools", "open-source"],
    status: "active",
    startDate: "2026-02",
    demoUrl: "https://tidyroll-legal.vercel.app",
    sourceUrl: "https://github.com/gr8monk3ys/tidy-roll",
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
    href: "https://github.com/gr8monk3ys/pi-lab",
    title: "pi-lab",
    description:
      "A self-hosted homelab running 37 Docker Compose services on a Raspberry Pi 5 — DNS ad-blocking, VPN, media, documents, passwords, and intrusion detection behind wildcard TLS.",
    thumbnail: piLab,
    stack: ["Docker Compose", "Nginx Proxy Manager", "Pi-hole", "WireGuard"],
    slug: "pi-lab",
    featured: false,
    categories: ["tools", "open-source"],
    status: "maintained",
    startDate: "2026-02",
    sourceUrl: "https://github.com/gr8monk3ys/pi-lab",
    caseStudy: {
      challenge:
        "Self-hosting advice is either a single-service tutorial or a rack-mounted enterprise build. There was no honest middle: what can one 8 GB Raspberry Pi actually carry, and what does it cost in complexity to run the services that would otherwise be a dozen subscriptions?",
      solution:
        "Thirty-seven services on one Pi 5, each a Docker Compose stack in its own directory, all reachable behind Nginx Proxy Manager with wildcard TLS on a real domain. DNS resolves through Pi-hole to Unbound to DNSCrypt, so there is no upstream resolver watching the queries either.",
      results: [
        "37 services covering DNS, VPN, media, documents, passwords, automation, and monitoring",
        "Recursive DNS chain — Pi-hole to Unbound to DNSCrypt — with no upstream dependency",
        "Wildcard TLS on *.lscaturchio.xyz via Nginx Proxy Manager and Let's Encrypt",
        "Authelia for single sign-on and CrowdSec for intrusion detection across the estate",
      ],
      metrics: [
        { label: "Services", value: "37" },
        { label: "Hardware", value: "Pi 5, 8 GB" },
        { label: "Arch", value: "aarch64" },
        { label: "TLS", value: "Wildcard" },
      ],
      process: [
        {
          title: "One stack per directory",
          description:
            "Kept each service self-contained so a single broken image can be rebuilt without touching the other thirty-six.",
        },
        {
          title: "Own the resolver",
          description:
            "Chained Pi-hole to a local Unbound recursive resolver rather than a public upstream, so ad-blocking does not just relocate the surveillance.",
        },
        {
          title: "One front door",
          description:
            "Put everything behind Nginx Proxy Manager with wildcard certificates instead of exposing ports per service.",
        },
        {
          title: "Assume it will be attacked",
          description:
            "Added Authelia in front and CrowdSec underneath, on the assumption that anything reachable will eventually be probed.",
        },
      ],
      whatIdDoNext: [
        "Move the compose sprawl to K3s and reuse the Helm work from the homelab repo.",
        "Add automated restore drills — backups that have never been restored are not backups.",
        "Publish per-service memory ceilings so the 8 GB budget is legible to anyone copying this.",
      ],
    },
    details: [
      "Deployed and maintain a 37-service self-hosted homelab on a Raspberry Pi 5 (8 GB, aarch64) covering DNS ad-blocking, VPN, media streaming, document management with OCR, password management, workflow automation, and intrusion detection.",
      "Fronted the estate with Nginx Proxy Manager and wildcard Let's Encrypt TLS, with Authelia for SSO and a Pi-hole to Unbound to DNSCrypt resolver chain that removes the upstream DNS dependency.",
    ],
  },
  {
    href: "https://github.com/gr8monk3ys/qsensor-sim",
    title: "qsensor-sim",
    description:
      "A physics-based quantum sensor simulation API for GPS-denied navigation research — synthetic IMU data with quantum decoherence effects, processed through Kalman filtering and bias correction.",
    thumbnail: qsensorSim,
    stack: ["Python", "FastAPI", "Celery", "SciPy"],
    slug: "qsensor-sim",
    featured: false,
    categories: ["data-science", "tools"],
    status: "maintained",
    startDate: "2025-08",
    sourceUrl: "https://github.com/gr8monk3ys/qsensor-sim",
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
      "An AI content generation tool using GPT-4 and LangChain to create SEO-optimized blog posts and structured books. Outputs clean MDX for blogs and DOCX for books.",
    thumbnail: blogAI,
    stack: ["Python", "OpenAI GPT-4", "LangChain", "MDX"],
    slug: "blog-ai",
    featured: false,
    categories: ["ai-ml", "tools"],
    status: "maintained",
    startDate: "2023-11",
    sourceUrl: "https://github.com/gr8monk3ys/blog-AI",
    caseStudy: {
      challenge: "Creating high-quality, SEO-optimized blog content is time-consuming. Writers need assistance generating structured content while maintaining their voice.",
      solution: "Constructed an automated blog content generation system using GPT-4 and LangChain. Implements workflows for generating SEO-optimized titles, descriptions, and detailed sections with context memory.",
      results: [
        "SEO-optimized content generation",
        "MDX output for static site blogs",
        "DOCX export for book formats",
        "Context-aware writing with memory"
      ],
      metrics: [
        { label: "Outputs", value: "MDX + DOCX" },
        { label: "Workflows", value: "SEO-aware" },
        { label: "Context", value: "Memory buffer" },
        { label: "Structure", value: "Sectioned" },
      ],
      process: [
        {
          title: "Brief → outline",
          description: "Turned topic + keywords into a stable outline with clear sections and intent.",
        },
        {
          title: "Workflow orchestration",
          description: "Used LangChain to chain steps and keep context consistent across generations.",
        },
        {
          title: "Draft + refine",
          description: "Generated drafts with iterative passes for clarity, tone, and SEO constraints.",
        },
        {
          title: "Export + publish",
          description: "Emitted clean MDX for static sites and DOCX for book-friendly formatting.",
        },
      ],
      whatIdDoNext: [
        "Add citations + fact checks for claims that require sources.",
        "Introduce a style guide layer to preserve voice and enforce editorial constraints.",
        "Add multilingual generation pipelines for international SEO and distribution.",
      ],
    },
    details: [
      "Constructed an automated blog content generation system using OpenAI's GPT-4 model and LangChain.",
      "Accomplished workflows for generating SEO-optimized blog titles, descriptions, and detailed sections.",
      "Used Python and ConversationBufferMemory for maintaining context and orchestrating tasks.",
    ],
  },
  // ============================================
  // ARCHIVED
  // ============================================
  {
    href: "https://github.com/gr8monk3ys/Paper-Summarizer",
    title: "Paper Summarizer",
    description:
      "A tool for summarizing academic papers using advanced NLP techniques.",
    thumbnail: paperSummarizer,
    stack: ["Python", "NLP", "Transformers"],
    slug: "paper-summarizer",
    featured: false,
    categories: ["ai-ml", "tools"],
    status: "archived",
    startDate: "2021-02",
    sourceUrl: "https://github.com/gr8monk3ys/Paper-Summarizer",
    details: [
      "A tool for summarizing academic papers using NLP techniques. Extracts key points and generates concise summaries from research documents.",
      "Built with transformers for accurate extraction. Accepts papers from various sources.",
    ],
  },
];
