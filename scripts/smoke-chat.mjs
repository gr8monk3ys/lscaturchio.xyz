#!/usr/bin/env node

const DEFAULT_BASE_URL = process.env.SMOKE_BASE_URL || "https://lscaturchio.xyz";
const DEFAULT_QUERY = process.env.SMOKE_CHAT_QUERY || "Hi Lorenzo, what do you build?";
const DEFAULT_ATTEMPTS = Number(process.env.SMOKE_ATTEMPTS || "20");
const DEFAULT_INTERVAL_MS = Number(process.env.SMOKE_INTERVAL_MS || "15000");
const DEFAULT_TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS || "15000");

function printUsage() {
  console.log(`Usage: node scripts/smoke-chat.mjs [options]

Options:
  --base-url <url>          Base URL to probe (default: ${DEFAULT_BASE_URL})
  --query <text>            Chat query payload
  --attempts <n>            Max retry attempts (default: ${DEFAULT_ATTEMPTS})
  --interval-ms <ms>        Delay between attempts (default: ${DEFAULT_INTERVAL_MS})
  --timeout-ms <ms>         Per-request timeout (default: ${DEFAULT_TIMEOUT_MS})
  --skip-health             Skip /api/health check
  --require-non-fallback    Fail if provider is "fallback"
  --help                    Show this help
`);
}

function parseArgs(argv) {
  const config = {
    baseUrl: DEFAULT_BASE_URL,
    query: DEFAULT_QUERY,
    attempts: DEFAULT_ATTEMPTS,
    intervalMs: DEFAULT_INTERVAL_MS,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    skipHealth: false,
    requireNonFallback: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }

    if (arg === "--skip-health") {
      config.skipHealth = true;
      continue;
    }

    if (arg === "--require-non-fallback") {
      config.requireNonFallback = true;
      continue;
    }

    if (["--base-url", "--query", "--attempts", "--interval-ms", "--timeout-ms"].includes(arg)) {
      const value = argv[i + 1];
      if (!value) {
        throw new Error(`Missing value for ${arg}`);
      }
      i += 1;

      if (arg === "--base-url") config.baseUrl = value;
      if (arg === "--query") config.query = value;
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
  // Validate URL early.
  new URL(config.baseUrl);

  return config;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatError(error) {
  if (!(error instanceof Error)) {
    return String(error);
  }

  const cause = error.cause;
  if (cause instanceof Error) {
    return `${error.message}: ${cause.message}`;
  }
  if (cause) {
    return `${error.message}: ${String(cause)}`;
  }

  return error.message;
}

async function readJsonOrText(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function requestWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function unwrapDataEnvelope(payload) {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }
  return payload;
}

async function checkHealth(baseUrl, timeoutMs) {
  const url = `${baseUrl}/api/health`;
  const response = await requestWithTimeout(url, { method: "GET" }, timeoutMs);

  if (!response.ok) {
    const payload = await readJsonOrText(response);
    throw new Error(`Health check failed with ${response.status}: ${JSON.stringify(payload)}`);
  }

  const payload = await readJsonOrText(response);
  const status = payload && typeof payload === "object" ? payload.status : undefined;
  if (status !== "healthy") {
    throw new Error(`Health endpoint returned non-healthy status: ${JSON.stringify(payload)}`);
  }

  return payload;
}

async function checkChat(baseUrl, query, timeoutMs, requireNonFallback) {
  const endpoint = `${baseUrl}/api/chat`;
  const origin = new URL(baseUrl).origin;

  const response = await requestWithTimeout(
    endpoint,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin,
      },
      body: JSON.stringify({ query }),
    },
    timeoutMs
  );

  const payload = await readJsonOrText(response);

  if (!response.ok) {
    throw new Error(`Chat request failed with ${response.status}: ${JSON.stringify(payload)}`);
  }

  if (payload && typeof payload === "object" && payload.success === false) {
    throw new Error(`Chat API returned success=false: ${JSON.stringify(payload)}`);
  }

  const data = unwrapDataEnvelope(payload);
  const answer = data && typeof data === "object" ? data.answer : null;
  const provider = data && typeof data === "object" ? data.provider : null;
  const model = data && typeof data === "object" ? data.model : null;
  const degraded = data && typeof data === "object" ? Boolean(data.degraded) : null;

  if (typeof answer !== "string" || answer.trim().length < 8) {
    throw new Error(`Chat response missing usable answer: ${JSON.stringify(payload)}`);
  }

  if (requireNonFallback && provider === "fallback") {
    throw new Error(`Chat provider is fallback (answer: ${answer.slice(0, 80)}...)`);
  }

  return { answer, provider, model, degraded };
}

async function run() {
  const config = parseArgs(process.argv);
  const startedAt = Date.now();

  console.log(`[smoke-chat] base=${config.baseUrl} attempts=${config.attempts} timeoutMs=${config.timeoutMs}`);

  let lastError = null;

  for (let attempt = 1; attempt <= config.attempts; attempt += 1) {
    try {
      if (!config.skipHealth) {
        await checkHealth(config.baseUrl, config.timeoutMs);
      }

      const chat = await checkChat(
        config.baseUrl,
        config.query,
        config.timeoutMs,
        config.requireNonFallback
      );

      const elapsedMs = Date.now() - startedAt;
      console.log(
        `[smoke-chat] ok attempt=${attempt} provider=${chat.provider || "unknown"} model=${chat.model || "n/a"} degraded=${String(chat.degraded)} elapsedMs=${elapsedMs}`
      );
      return;
    } catch (error) {
      lastError = error;
      const message = formatError(error);
      console.warn(`[smoke-chat] attempt ${attempt}/${config.attempts} failed: ${message}`);

      if (attempt < config.attempts) {
        await sleep(config.intervalMs);
      }
    }
  }

  const elapsedMs = Date.now() - startedAt;
  const errorMessage = formatError(lastError);
  console.error(`[smoke-chat] failed after ${config.attempts} attempts (${elapsedMs}ms): ${errorMessage}`);
  process.exit(1);
}

run().catch((error) => {
  const message = formatError(error);
  console.error(`[smoke-chat] fatal: ${message}`);
  process.exit(1);
});
