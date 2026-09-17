import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

// Lighthouse score floors, run against a production build in CI.
//
// Every floor here is a MEASURED value, not an aspiration. Performance sits
// two points below the lowest score seen across repeated local and CI runs;
// the other three categories sit at the value the site actually reaches. A
// floor set at an unmet number keeps the check permanently red and therefore
// ignored; a floor that flakes on runner noise gets bypassed, and a bypassed
// check is no check at all. A real regression lands well below the floor.
// Raise a floor whenever the real score improves.
//
// The runs use Lighthouse's desktop preset. Mobile devtools throttling is too
// noisy on shared runners to gate on; production mobile numbers are measured
// separately (PageSpeed Insights against https://lscaturchio.xyz), and the
// 2026-09-13..16 Lighthouse work that these floors protect was scored there.
const SCORE_FLOORS = {
  performance: 97,
  accessibility: 100,
  bestPractices: 100,
  seo: 100,
};

// Per-route exceptions, each naming its cause. /work-with-me ships the zod
// chunk (shared with /contact's form), and zod 4 probes `Function("")` at
// module load to learn whether eval is available. The CSP has no
// 'unsafe-eval', so Chrome logs a CSP issue, and the inspector-issues audit
// caps best-practices at 96 — measured at 96 on production too. Removing this
// line is the job of keeping zod out of that route's client bundle, not of
// loosening the CSP.
const ROUTE_FLOOR_OVERRIDES = {
  "/work-with-me": { bestPractices: 96 },
};

// Document byte budget for the home route, compressed, as a browser receives
// it. `experimental.inlineCss` (and anything else that grows the HTML shell)
// is invisible to the category scores until it is large enough to move LCP,
// so the size is gated directly. Cap is ~25% above the measured value; the
// measured number is printed on every run so drift is visible before it fails.
const HOME_DOCUMENT_BYTE_CAP = 32_000;

const MAX_ATTEMPTS = 4;
const artifactDir = join(process.cwd(), "artifacts", "lighthouse");
const [baseUrl, ...routes] = process.argv.slice(2);

if (!baseUrl || routes.length === 0) {
  console.error("Usage: node scripts/check-lighthouse-score.mjs <baseUrl> <route...>");
  process.exit(1);
}

const outputDir = mkdtempSync(join(tmpdir(), "lscaturchio-lighthouse-"));

try {
  mkdirSync(artifactDir, { recursive: true });

  for (const route of routes) {
    const url = new URL(route, baseUrl).toString();
    const floors = { ...SCORE_FLOORS, ...ROUTE_FLOOR_OVERRIDES[route] };
    warmRoute(url);
    let bestAttempt = null;
    let attemptsRun = 0;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      attemptsRun = attempt;
      const reportPath = join(outputDir, `${artifactStem(route)}-attempt-${attempt}.json`);
      const scores = runLighthouse(url, reportPath);

      console.log(`[lighthouse] ${route} attempt ${attempt} -> ${JSON.stringify(scores)}`);

      if (!bestAttempt || totalScore(scores) > totalScore(bestAttempt.scores)) {
        bestAttempt = { attempt, scores, reportPath };
      }

      if (Object.entries(scores).every(([k, score]) => score >= (floors[k] ?? 100))) {
        break;
      }
    }

    const failures = Object.entries(bestAttempt.scores).filter(([k, score]) => score < (floors[k] ?? 100));
    copyFileSync(bestAttempt.reportPath, join(artifactDir, `${artifactStem(route)}.json`));

    if (failures.length > 0) {
      console.error(
        `[lighthouse] ${route} fell below its score floors after ${attemptsRun} attempt(s): ${failures
          .map(([category, score]) => `${category}=${score}`)
          .join(", ")}`
      );
      logFailureDiagnostics(bestAttempt.reportPath);
      process.exit(1);
    }
  }

  checkDocumentByteBudget(new URL("/", baseUrl).toString());
} finally {
  rmSync(outputDir, { recursive: true, force: true });
}

function artifactStem(route) {
  return route === "/" ? "root" : route.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
}

function runLighthouse(url, reportPath) {
  const result = spawnSync(
    "npx",
    [
      "-y",
      "lighthouse",
      url,
      "--preset=desktop",
      "--quiet",
      "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage",
      "--only-categories=performance,accessibility,best-practices,seo",
      "--output=json",
      `--output-path=${reportPath}`,
    ],
    { encoding: "utf-8" }
  );

  if (result.error) {
    console.error(`Failed to run Lighthouse for ${url}:`, result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }

  const report = JSON.parse(readFileSync(reportPath, "utf-8"));
  return {
    performance: Math.round(report.categories.performance.score * 100),
    accessibility: Math.round(report.categories.accessibility.score * 100),
    bestPractices: Math.round(report.categories["best-practices"].score * 100),
    seo: Math.round(report.categories.seo.score * 100),
  };
}

function warmRoute(url) {
  spawnSync("curl", ["-fsSLo", "/dev/null", url], { stdio: "ignore" });
}

function totalScore(scores) {
  return Object.values(scores).reduce((sum, score) => sum + score, 0);
}

function checkDocumentByteBudget(url) {
  const result = spawnSync(
    "curl",
    ["--compressed", "-sSo", "/dev/null", "-w", "%{size_download}", url],
    { encoding: "utf-8" }
  );
  const bytes = Number.parseInt(result.stdout, 10);

  if (result.status !== 0 || !Number.isFinite(bytes) || bytes <= 0) {
    console.error(`[lighthouse] could not measure the document size of ${url}: ${result.stderr || result.stdout}`);
    process.exit(1);
  }

  console.log(
    `[lighthouse] home document: ${bytes} bytes compressed (cap ${HOME_DOCUMENT_BYTE_CAP}, ${Math.round(
      (bytes / HOME_DOCUMENT_BYTE_CAP) * 100
    )}% of budget)`
  );

  if (bytes > HOME_DOCUMENT_BYTE_CAP) {
    console.error(
      `[lighthouse] home document is ${bytes} bytes compressed, over the ${HOME_DOCUMENT_BYTE_CAP} byte cap. ` +
        "Something grew the HTML shell (inlined CSS, serialized data, a new above-the-fold section). " +
        "Shrink it, or raise the cap deliberately with the measured number in the commit message."
    );
    process.exit(1);
  }
}

function logFailureDiagnostics(reportPath) {
  const report = JSON.parse(readFileSync(reportPath, "utf-8"));
  const metrics = report.audits.metrics?.details?.items?.[0];

  if (metrics) {
    const formatMetric = (value) => `${Math.round(value)}ms`;
    console.error(
      `[lighthouse] metrics: fcp=${formatMetric(metrics.firstContentfulPaint)} lcp=${formatMetric(metrics.largestContentfulPaint)} tbt=${formatMetric(metrics.totalBlockingTime)} si=${formatMetric(metrics.speedIndex)} cls=${metrics.cumulativeLayoutShift}`
    );
  }

  const opportunities = Object.values(report.audits)
    .filter((audit) => audit.details?.type === "opportunity" && typeof audit.numericValue === "number")
    .sort((left, right) => right.numericValue - left.numericValue)
    .slice(0, 5)
    .map((audit) => `${audit.id}:${Math.round(audit.numericValue)}ms`);

  if (opportunities.length > 0) {
    console.error(`[lighthouse] top opportunities: ${opportunities.join(", ")}`);
  }

  // Annotated with the weight each audit carries, because not every failing
  // audit costs a point. `valid-source-maps` fails on every essay route — Next
  // ships no browser source maps in production — and is weighted 0, so it can
  // never move a score and is not worth chasing. The first read of this list
  // spent time on it; the annotation is so the next one does not.
  const weightById = new Map();
  for (const category of Object.values(report.categories)) {
    for (const ref of category.auditRefs) {
      weightById.set(ref.id, (weightById.get(ref.id) ?? 0) + ref.weight);
    }
  }

  const failedAudits = Object.values(report.audits)
    .filter((audit) => audit.score !== null && audit.score < 1 && audit.scoreDisplayMode === "binary")
    .slice(0, 10)
    .map((audit) => {
      const weight = weightById.get(audit.id) ?? 0;
      return weight > 0 ? `${audit.id} (weight ${weight})` : `${audit.id} (weight 0, scores nothing)`;
    });

  if (failedAudits.length > 0) {
    console.error(`[lighthouse] failed binary audits: ${failedAudits.join(", ")}`);
  }

  const layoutShiftItems = report.audits["layout-shift-elements"]?.details?.items
    ?.slice(0, 5)
    .map((item) => {
      const node = item.node ?? {};
      const snippet = node.snippet ?? node.nodeLabel ?? node.path ?? "unknown";
      return `${snippet} (${Math.round((item.score ?? 0) * 1000) / 1000})`;
    });

  if (layoutShiftItems?.length) {
    console.error(`[lighthouse] layout-shift-elements: ${layoutShiftItems.join(" | ")}`);
  }
}
