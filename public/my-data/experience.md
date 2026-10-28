Professional Experience:

Founder | VivanceData (https://www.vivancedata.com)
Current
- AI for construction, HVAC, logistics and manufacturing businesses
- After-hours calls answered and booked; permits and delivery paperwork read instead of re-keyed
- Public demos: demo-missed-call.vercel.app, demo-paperwork.vercel.app, demo-field-photos.vercel.app

Consultant AI Engineer | Upwork
August 2022 - Present
- Discovery and scoping with clients, turning open-ended business problems into delivered systems
- Delivered custom ML for 4 clients: RAG document Q&A, fine-tuned classification, and automated data pipelines
- Built the MLOps around them: CI/CD, model versioning, monitoring
- Maintained a 98% Job Success Score

Operations Coordinator | G&M Trailer Repair, Inc.
2022 - Present
- Rebuilt a paper-run trailer shop's receipts, pick tickets and job scheduling into searchable systems
- Built the parts inventory, labor hour log and PTO accrual, automating repetitive steps in VBA and invoicing in QuickBooks
- Coordinated repair intake and dispatch for roughly 200 trailers a month

Machine Learning Engineer | Sizzle (Los Angeles, CA)
June 2024 - May 2025
- Built and ran an end-to-end computer vision pipeline estimating macro-nutrients from food images
- Deployed on GCP Vertex AI and BigQuery, serving 5k+ daily inference requests
- Integrated the model into a production REST API in Kotlin with a <200ms p95 target for 10+ B2B clients
- Turned quality complaints into labeling guidelines across a 50k+ image dataset, raising accuracy by 12 points

Data Engineer | Joint Genome Institute (Berkeley, CA)
May 2020 - August 2021
- Built data processing pipelines in R for genomic homology comparison
- Engineered ETL for genome reference data, cutting preprocessing from 4 hours to 10 minutes
- Delivered a KNN classifier for plant-microbe interaction prediction (F1 0.68)

Computational Systems Intern | VICE Lab (Merced, CA)
January 2020 - May 2021
- Parallelized hydropower models on a Slurm HPC cluster, cutting runtime by 50%
- Ported core Python logic to Cython for a further 30% reduction
- Built a Vue.js visualization layer for the model outputs

Key Projects (case studies at lscaturchio.xyz/projects; source linked where the repo is public):
- Monkey SMP: a whitelisted, modded Minecraft Java server on Fabric with a cross-platform installer,
  hash-pinned mods, a live world map and pull-based overnight deploys. Season I opens 21 November 2026.
- Front Desk: the Discord bot for the Chill Gamers community; replaced Lurkr and MEE6, bridges to the
  Minecraft server, and writes catch-up summaries with a local Ollama model.
- Hollow Crown: a rooftop stealth game in Godot 4.7 with a ten-night roguelite mode, The Long Winter.
  In greybox; no public build yet.
- Fleet Orchestrator: scheduled Claude routines that maintain a fleet of repositories (78 in the
  registry, 42 with active loops), with every merge decided by merge-gate.
- merge-gate: a deterministic policy engine that auto-merges only pull requests that cannot change
  behaviour (lockfiles, tests, patch/minor bumps); everything else waits for a human. v0.8.0.
- homelab: a K3s cluster with a declarative service catalogue, cert-manager TLS, SOPS-encrypted
  secrets and a Prometheus stack. Successor to pi-lab, a Docker Compose homelab on a Raspberry Pi 5.
- Talker: a USC MS capstone RAG teaching assistant with hybrid BM25 + vector retrieval over ChromaDB,
  cross-encoder reranking, five model providers and an LLM-as-judge evaluation harness.
- trading-bot: an Alpaca paper-trading momentum bot. Over 2020-2024 its best validated strategy
  returned +16.3% against SPY's +95.3%; it does not beat buy-and-hold and is paper only. Its inflated
  early backtests were measurement bugs, now caught by backtest-audit.
- backtest-audit: audits a backtest from its trade log and returns TRUSTWORTHY or NOT TRUSTWORTHY.
- MTG Deck Lab: Commander decks built as a mixed-integer program with nested budget tiers, checked by
  a 10,000-game Monte Carlo simulation.
- Finance Owl: a personal finance app (NestJS, SvelteKit, Expo) with Plaid sync and optional,
  locally-runnable AI. Pre-launch.
- FraudStream: real-time fraud detection over Kafka, Spark Structured Streaming and Snowflake.
- Verso: an offline-first diary for artworks over a 10,000-work Met catalogue.
- Cocoon and Feedless: privacy-first browser extensions that soften algorithmic feeds and reduce
  sensory load, with zero tracking.
- unlinkd: an encrypted local-first workspace for data-broker removal evidence.
- qsensor-sim: quantum inertial sensor simulation for GPS-denied navigation research.

Music:
- Indie folk with industrial textures, made at home. A five-song EP is being recorded; nothing is
  released yet.

Technical Skills:

Programming Languages:
- Python (Advanced)
- TypeScript/JavaScript (Advanced)
- SQL (Advanced)
- GDScript

Frameworks & Libraries:
- React/Next.js
- PyTorch/TensorFlow
- FastAPI, NestJS
- discord.py
- Godot
- PostgreSQL (Neon)

Data & Streaming:
- Apache Kafka
- Spark Structured Streaming
- Snowflake
- Pandas/NumPy/SciPy

Cloud & DevOps:
- Google Cloud (Vertex AI, BigQuery)
- Kubernetes (K3s), Docker
- GitHub Actions
- Vercel

AI Engineering:
- Retrieval-augmented generation and evaluation
- Agent automation with Claude Code
- Local models with Ollama
