#!/usr/bin/env node

/**
 * Continuous uptime probe for production.
 *
 * Why this exists: on 2026-07-25 every API route returned 500 for an extended
 * period and nothing noticed. `postdeploy-chat-smoke` only runs on push to main,
 * so a dependency that rots *between* deploys is invisible to it.
 *
 * Three deliberate design choices, the first two learned from that outage:
 *
 * 1. Every check asserts on the response BODY, not just the status code. The
 *    Upstash instance that caused the outage answers HTTP 200 with an error
 *    body, and /api/health itself can return 200 while reporting "unhealthy".
 *    A status-only probe would have stayed green throughout.
 *
 * 2. /api/chat is intentionally NOT probed. It bills a real OpenAI call per
 *    request; on a 15-minute schedule that is ~2900 paid calls a month for no
 *    added signal. Chat is covered post-deploy by scripts/smoke-chat.mjs, and
 *    /api/rag-status verifies the same dependencies for free.
 *
 * 3. "The edge refused to talk to us" is NOT "the site is down", and the two
 *    exit differently. lscaturchio.xyz is served through Cloudflare (proxied,
 *    in front of Vercel), and Cloudflare's bot/WAF layer intermittently answers
 *    403 to this probe because it runs from an Azure datacentre IP on a GitHub
 *    runner. Six such episodes in two days each cleared on their own within
 *    ~20 minutes while the site served 200s to real traffic throughout. A
 *    probe that pages for those is worse than no probe, so a refusal that
 *    never reached the application is reported as `blocked` and exits 75
 *    (EX_TEMPFAIL) instead of 1. See classifyFailure() for how the two are
 *    told apart, and .github/workflows/uptime.yml for what each exit means.
 */

import { pathToFileURL } from "node:url";

const DEFAULT_BASE_URL = process.env.UPTIME_BASE_URL || "https://lscaturchio.xyz";
const DEFAULT_ATTEMPTS = Number(process.env.UPTIME_ATTEMPTS || "3");
const DEFAULT_INTERVAL_MS = Number(process.env.UPTIME_INTERVAL_MS || "10000");
const DEFAULT_TIMEOUT_MS = Number(process.env.UPTIME_TIMEOUT_MS || "20000");

/**
 * Optional shared secret that lets the probe past an edge WAF. Set both to a
 * header name and value that a Cloudflare "skip" rule matches, and the probe
 * stops being bot-scored at all. Unset by default; the probe works without it.
 */
const BYPASS_HEADER = process.env.UPTIME_BYPASS_HEADER || "";
const BYPASS_TOKEN = process.env.UPTIME_BYPASS_TOKEN || "";

/** Exit code for "we were refused at the edge", distinct from 1 = down. */
export const EXIT_BLOCKED = 75;

/**
 * Statuses an edge/WAF/bot layer uses to refuse a client outright. A 5xx is
 * never in here: 5xx means something answered and something is broken.
 */
const REFUSAL_STATUSES = new Set([401, 403, 429, 451]);

/**
 * Headers Vercel stamps on any response its router actually produced. Their
 * presence proves the request reached our deployment, so a 403 carrying them
 * is our own application refusing — a real defect, not an edge block.
 */
const ORIGIN_MARKER_HEADERS = ["x-matched-path", "x-vercel-id", "x-vercel-cache"];

/** Fingerprints of a Cloudflare interstitial/block page. */
const EDGE_BODY_MARKERS = [
  "cloudflare ray id",
  "attention required",
  "checking your browser",
  "enable javascript and cookies to continue",
  "sorry, you have been blocked",
];

/**
 * Decide whether a failing response means "the site is down" or "the edge
 * refused to let us ask". Only ever downgrades a refusal status; a 5xx, a
 * timeout, a connection error or a 200 with a bad body all stay `down`.
 *
 * @returns {"down"|"blocked"}
 */
export function classifyFailure({ status, headers, bodyText }) {
  if (!REFUSAL_STATUSES.has(status)) return "down";

  const get = (name) => (headers && typeof headers.get === "function" ? headers.get(name) : null);

  // Cloudflare says so itself.
  if (get("cf-mitigated")) return "blocked";

  const text = (bodyText || "").toLowerCase();
  if (EDGE_BODY_MARKERS.some((marker) => text.includes(marker))) return "blocked";

  // Reached our deployment: this refusal is ours to answer for.
  if (ORIGIN_MARKER_HEADERS.some((name) => get(name))) return "down";

  // A refusal status that never reached the origin. Something in front of the
  // app answered for it, which is the definition of an edge block.
  return "blocked";
}

/**
 * Each check returns null when healthy, or a string describing the failure.
 * Keep these cheap, unauthenticated, and free of side effects.
 */
const CHECKS = [
  {
    name: "health",
    path: "/api/health",
    verify: (status, body) => {
      if (status !== 200) return `expected 200, got ${status}`;
      if (body?.status !== "healthy") return `status is "${body?.status}"`;
      if (body?.checks?.database !== "ok") return `database check is "${body?.checks?.database}"`;
      if (body?.checks?.environment !== "ok") return `environment check is "${body?.checks?.environment}"`;
      return null;
    },
  },
  {
    name: "rag-status",
    path: "/api/rag-status",
    verify: (status, body) => {
      if (status !== 200) return `expected 200, got ${status}`;
      if (!body?.database?.ok) return "database not ok";
      if (!body?.embeddings?.available) return "embeddings provider unavailable";
      if (!(body?.embeddings?.count > 0)) return `embedding count is ${body?.embeddings?.count}`;
      return null;
    },
  },
  {
    name: "blog-stats",
    path: "/api/blog-stats",
    verify: (status, body) => {
      if (status !== 200) return `expected 200, got ${status}`;
      const total = body?.data?.totalPosts;
      if (!(total > 0)) return `totalPosts is ${total}`;
      return null;
    },
  },
  {
    name: "homepage",
    path: "/",
    verify: (status, body) => {
      if (status !== 200) return `expected 200, got ${status}`;
      if (typeof body !== "string" || !body.includes("Lorenzo")) return "homepage HTML missing expected content";
      return null;
    },
  },
];

function printUsage() {
  console.log(`Usage: node scripts/check-uptime.mjs [options]

Probes production endpoints and asserts on response bodies, not just status codes.

Exit codes:
  0   all checks passed
  1   at least one check is DOWN (5xx, timeout, connection error, or a bad body)
  ${EXIT_BLOCKED}  every failure was an edge refusal (WAF/bot block) that never reached the app

Options:
  --base-url <url>     Base URL to probe (default: ${DEFAULT_BASE_URL})
  --attempts <n>       Attempts per failing check (default: ${DEFAULT_ATTEMPTS})
  --interval-ms <ms>   Delay between retries (default: ${DEFAULT_INTERVAL_MS})
  --timeout-ms <ms>    Per-request timeout (default: ${DEFAULT_TIMEOUT_MS})
  --json               Emit a JSON summary on stdout
  --help               Show this help

Environment:
  UPTIME_BYPASS_HEADER / UPTIME_BYPASS_TOKEN
      Optional header sent with every request, for an edge rule that skips
      bot protection for this probe. Both must be set to take effect.
`);
}

function parseArgs(argv) {
  const config = {
    baseUrl: DEFAULT_BASE_URL,
    attempts: DEFAULT_ATTEMPTS,
    intervalMs: DEFAULT_INTERVAL_MS,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    json: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }

    if (arg === "--json") {
      config.json = true;
      continue;
    }

    if (["--base-url", "--attempts", "--interval-ms", "--timeout-ms"].includes(arg)) {
      const value = argv[i + 1];
      if (!value) {
        throw new Error(`Missing value for ${arg}`);
      }
      i += 1;

      if (arg === "--base-url") config.baseUrl = value;
      if (arg === "--attempts") config.attempts = Number(value);
      if (arg === "--interval-ms") config.intervalMs = Number(value);
      if (arg === "--timeout-ms") config.timeoutMs = Number(value);
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!Number.isFinite(config.attempts) || config.attempts < 1) {
    throw new Error("--attempts must be a positive number");
  }
  if (!Number.isFinite(config.intervalMs) || config.intervalMs < 0) {
    throw new Error("--interval-ms must be a non-negative number");
  }
  if (!Number.isFinite(config.timeoutMs) || config.timeoutMs < 1) {
    throw new Error("--timeout-ms must be a positive number");
  }

  config.baseUrl = config.baseUrl.replace(/\/$/, "");
  new URL(config.baseUrl);

  return config;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatError(error) {
  if (!(error instanceof Error)) return String(error);
  const cause = error.cause;
  if (cause instanceof Error) return `${error.message}: ${cause.message}`;
  if (cause) return `${error.message}: ${String(cause)}`;
  return error.message;
}

/**
 * Read the body once as text, then parse it as JSON when the response claims
 * to be JSON. The raw text is kept regardless: when a check fails, the first
 * few hundred characters of what actually came back are the whole diagnosis,
 * and the old probe threw them away — which is why six "expected 200, got 403"
 * issues never revealed who was sending the 403.
 */
async function readBody(response) {
  const contentType = response.headers.get("content-type") || "";
  let text = "";
  try {
    text = await response.text();
  } catch (error) {
    return { text: "", parsed: `<unreadable body: ${formatError(error)}>` };
  }

  if (contentType.includes("application/json")) {
    try {
      return { text, parsed: JSON.parse(text) };
    } catch (error) {
      return { text, parsed: `<unparseable JSON: ${formatError(error)}>` };
    }
  }

  return { text, parsed: text };
}

/** The handful of headers worth keeping in an outage report. */
function diagnosticHeaders(headers) {
  const wanted = [
    "server",
    "cf-ray",
    "cf-mitigated",
    "content-type",
    "x-matched-path",
    "x-vercel-id",
    "x-vercel-cache",
    "retry-after",
  ];
  const out = {};
  for (const name of wanted) {
    const value = headers.get(name);
    if (value) out[name] = value;
  }
  return out;
}

async function requestWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const headers = { "User-Agent": "lscaturchio-uptime-check" };
  if (BYPASS_HEADER && BYPASS_TOKEN) headers[BYPASS_HEADER] = BYPASS_TOKEN;
  try {
    return await fetch(url, { method: "GET", signal: controller.signal, headers });
  } finally {
    clearTimeout(timer);
  }
}

async function runCheck(check, config) {
  let lastFailure = "no attempts made";
  let lastClassification = "down";
  let lastDiagnostics = null;

  for (let attempt = 1; attempt <= config.attempts; attempt += 1) {
    const url = `${config.baseUrl}${check.path}`;

    try {
      const response = await requestWithTimeout(url, config.timeoutMs);
      const { text, parsed } = await readBody(response);
      const failure = check.verify(response.status, parsed);

      if (!failure) {
        return { name: check.name, path: check.path, ok: true, attempts: attempt };
      }

      lastFailure = failure;
      lastClassification = classifyFailure({
        status: response.status,
        headers: response.headers,
        bodyText: text,
      });
      lastDiagnostics = {
        status: response.status,
        headers: diagnosticHeaders(response.headers),
        bodyExcerpt: text.slice(0, 300),
      };
    } catch (error) {
      // Nothing answered at all. Always an outage, never a block.
      lastFailure = formatError(error);
      lastClassification = "down";
      lastDiagnostics = null;
    }

    // Retry transient blips before declaring an outage.
    if (attempt < config.attempts) {
      await sleep(config.intervalMs);
    }
  }

  return {
    name: check.name,
    path: check.path,
    ok: false,
    attempts: config.attempts,
    failure: lastFailure,
    classification: lastClassification,
    diagnostics: lastDiagnostics,
  };
}

async function main() {
  const config = parseArgs(process.argv);

  // Checks are independent; run them concurrently so one slow endpoint does not
  // serialise the whole probe.
  const results = await Promise.all(CHECKS.map((check) => runCheck(check, config)));
  const failures = results.filter((result) => !result.ok);
  const down = failures.filter((result) => result.classification === "down");

  // Blocked only counts when EVERY failure is a block. One genuine 5xx
  // alongside a block still pages: a partial outage is an outage.
  const blocked = failures.length > 0 && down.length === 0;

  if (config.json) {
    console.log(
      JSON.stringify(
        {
          baseUrl: config.baseUrl,
          healthy: failures.length === 0,
          blocked,
          results,
        },
        null,
        2
      )
    );
  } else {
    console.log(`Uptime check against ${config.baseUrl}\n`);
    for (const result of results) {
      const status = result.ok ? "PASS" : result.classification === "blocked" ? "BLOCK" : "FAIL";
      const detail = result.ok
        ? `(attempt ${result.attempts})`
        : `after ${result.attempts} attempts — ${result.failure}`;
      console.log(`  ${status.padEnd(5)} ${result.name.padEnd(12)} ${result.path.padEnd(18)} ${detail}`);
    }
    console.log("");
  }

  if (blocked) {
    console.error(
      `${failures.length} of ${results.length} checks were refused at the edge (WAF/bot block), ` +
        `not served by the app: ${failures.map((f) => f.name).join(", ")}. ` +
        `Treating as BLOCKED, not an outage.`
    );
    process.exit(EXIT_BLOCKED);
  }

  if (failures.length > 0) {
    console.error(
      `${failures.length} of ${results.length} checks failed: ${failures.map((f) => f.name).join(", ")}`
    );
    process.exit(1);
  }

  console.log(`All ${results.length} checks passed.`);
}

// Only probe when run as a script; importing this file (tests) must be inert.
const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  main().catch((error) => {
    console.error(`Uptime check crashed: ${formatError(error)}`);
    process.exit(1);
  });
}
