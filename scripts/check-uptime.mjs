#!/usr/bin/env node

/**
 * Continuous uptime probe for production.
 *
 * Why this exists: on 2026-07-25 every API route returned 500 for an extended
 * period and nothing noticed. `postdeploy-chat-smoke` only runs on push to main,
 * so a dependency that rots *between* deploys is invisible to it.
 *
 * Two deliberate design choices, both learned from that outage:
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
 */

const DEFAULT_BASE_URL = process.env.UPTIME_BASE_URL || "https://lscaturchio.xyz";
const DEFAULT_ATTEMPTS = Number(process.env.UPTIME_ATTEMPTS || "3");
const DEFAULT_INTERVAL_MS = Number(process.env.UPTIME_INTERVAL_MS || "10000");
const DEFAULT_TIMEOUT_MS = Number(process.env.UPTIME_TIMEOUT_MS || "20000");

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
Exits non-zero if any check fails every attempt.

Options:
  --base-url <url>     Base URL to probe (default: ${DEFAULT_BASE_URL})
  --attempts <n>       Attempts per failing check (default: ${DEFAULT_ATTEMPTS})
  --interval-ms <ms>   Delay between retries (default: ${DEFAULT_INTERVAL_MS})
  --timeout-ms <ms>    Per-request timeout (default: ${DEFAULT_TIMEOUT_MS})
  --json               Emit a JSON summary on stdout
  --help               Show this help
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

async function readJsonOrText(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch (error) {
      return `<unparseable JSON: ${formatError(error)}>`;
    }
  }
  return response.text();
}

async function requestWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { "User-Agent": "lscaturchio-uptime-check" },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function runCheck(check, config) {
  let lastFailure = "no attempts made";

  for (let attempt = 1; attempt <= config.attempts; attempt += 1) {
    const url = `${config.baseUrl}${check.path}`;

    try {
      const response = await requestWithTimeout(url, config.timeoutMs);
      const body = await readJsonOrText(response);
      const failure = check.verify(response.status, body);

      if (!failure) {
        return { name: check.name, path: check.path, ok: true, attempts: attempt };
      }

      lastFailure = failure;
    } catch (error) {
      lastFailure = formatError(error);
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
  };
}

async function main() {
  const config = parseArgs(process.argv);

  // Checks are independent; run them concurrently so one slow endpoint does not
  // serialise the whole probe.
  const results = await Promise.all(CHECKS.map((check) => runCheck(check, config)));
  const failures = results.filter((result) => !result.ok);

  if (config.json) {
    console.log(
      JSON.stringify(
        { baseUrl: config.baseUrl, healthy: failures.length === 0, results },
        null,
        2
      )
    );
  } else {
    console.log(`Uptime check against ${config.baseUrl}\n`);
    for (const result of results) {
      const status = result.ok ? "PASS" : "FAIL";
      const detail = result.ok
        ? `(attempt ${result.attempts})`
        : `after ${result.attempts} attempts — ${result.failure}`;
      console.log(`  ${status}  ${result.name.padEnd(12)} ${result.path.padEnd(18)} ${detail}`);
    }
    console.log("");
  }

  if (failures.length > 0) {
    console.error(
      `${failures.length} of ${results.length} checks failed: ${failures.map((f) => f.name).join(", ")}`
    );
    process.exit(1);
  }

  console.log(`All ${results.length} checks passed.`);
}

main().catch((error) => {
  console.error(`Uptime check crashed: ${formatError(error)}`);
  process.exit(1);
});
