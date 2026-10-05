/**
 * The one JSON shape every API route answers in, read from the browser.
 *
 * Success is `{ data, success: true }` and failure is
 * `{ error, success: false, field?, retryAfter? }` (see
 * `src/lib/api-response.ts`). Two ways in:
 *
 *   - `fetchJson`, for reads. Callers spell the payload once —
 *     `fetchJson<ApiEnvelope<Payload>>(url)` — and read `.data`. It throws
 *     `HttpError` on a non-2xx, so a value that comes back is always the
 *     success arm.
 *   - `submitWrite`, for a form posting to a write route
 *     (`src/lib/api/write-route.ts`). It never throws: it returns a
 *     `WriteResult` naming which layer stopped the request, and the form puts
 *     that in its own words.
 */
export type ApiEnvelope<T> = { data: T; success: true };

export class HttpError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.payload = payload;
  }
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType =
    typeof (response as { headers?: { get?: (name: string) => string | null } }).headers?.get ===
    "function"
      ? response.headers.get("content-type") ?? ""
      : "";
  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  // Test doubles may omit `text()` and only implement `json()`.
  if (typeof (response as { text?: unknown }).text !== "function") {
    if (typeof (response as { json?: unknown }).json === "function") {
      return response.json().catch(() => null);
    }
    return null;
  }

  const text = await response.text().catch(() => "");
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const payload = await parseResponseBody(response);

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "error" in payload
        ? String((payload as { error: unknown }).error)
        : `Request failed with status ${response.status}`;
    throw new HttpError(message, response.status, payload);
  }

  return payload as T;
}

/**
 * What a write route answered, decoded once.
 *
 * Each failure kind is one layer of the write chain (rate limit -> auth ->
 * CSRF -> Zod -> handler), so a form chooses its words by kind rather than by
 * re-reading status codes and body fields. `message` is the server's own
 * sentence when it sent one, and null when the body carried none — a proxy's
 * HTML error page, say.
 */
export type WriteResult<T> =
  /** 2xx. `data` is the envelope's payload, absent if the body had none. */
  | { kind: "ok"; data: T | undefined }
  /** 400 that names the input it is about: Zod, or the handler. */
  | { kind: "invalid-field"; field: string; message: string }
  /** 429. `retryAfter` is in seconds, from the body or the Retry-After header. */
  | { kind: "rate-limited"; retryAfter: number | null; message: string | null }
  /**
   * Any other 4xx: the server understood and declined — CSRF, BotID, auth, a
   * body that is not JSON, an unknown token.
   */
  | { kind: "refused"; status: number; message: string | null }
  /** 5xx, or anything else that is neither a success nor a 4xx. */
  | { kind: "server-error"; status: number; message: string | null }
  /** No response: the request failed to leave, or did not answer in time. */
  | { kind: "network"; cause: "unreachable" | "timeout" };

/**
 * How long a send may take before the form gives up and says so.
 *
 * BotID (instrumentation-client.ts) wraps `fetch` and waits for its challenge
 * script before the request leaves. If an extension blocks that script, or it
 * loads and never answers, the wrapped fetch can wait forever — and an
 * `AbortSignal` on the request cannot help, because the request has not been
 * made yet. Without this the contact form's button sat on "Sending..."
 * indefinitely.
 */
const WRITE_TIMEOUT_MS = 20_000;

class WriteTimeout extends Error {}

function withTimeout<T>(request: Promise<T>, timeoutMs: number | null): Promise<T> {
  if (timeoutMs === null) return request;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new WriteTimeout()), timeoutMs);
  });
  return Promise.race([request, timeout]).finally(() => clearTimeout(timer));
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function readRetryAfter(body: Record<string, unknown> | null, response: Response): number | null {
  const fromBody = body?.retryAfter;
  if (typeof fromBody === "number" && Number.isFinite(fromBody) && fromBody > 0) {
    return Math.ceil(fromBody);
  }
  const header =
    typeof response.headers?.get === "function" ? response.headers.get("retry-after") : null;
  const seconds = header ? Number.parseInt(header, 10) : Number.NaN;
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}

async function decodeWriteResponse<T>(response: Response): Promise<WriteResult<T>> {
  // Tolerates a body that is not JSON at all: a gateway's HTML 502 is still a
  // server error, not a dropped connection.
  const body = asRecord(await parseResponseBody(response));

  if (response.ok) {
    return { kind: "ok", data: body?.data as T | undefined };
  }

  const status = response.status;
  const message = nonEmptyString(body?.error);

  if (status === 429) {
    return { kind: "rate-limited", retryAfter: readRetryAfter(body, response), message };
  }

  const field = nonEmptyString(body?.field);
  if (status === 400 && field && message) {
    return { kind: "invalid-field", field, message };
  }

  if (status >= 400 && status < 500) {
    return { kind: "refused", status, message };
  }

  return { kind: "server-error", status, message };
}

export type SubmitWriteOptions = {
  /**
   * Milliseconds before the send counts as lost. Defaults to 20s (see
   * `WRITE_TIMEOUT_MS`); `null` waits for as long as the server takes, for a
   * route whose legitimate answer can outlast that.
   */
  timeoutMs?: number | null;
};

/**
 * POST `body` as JSON to a write route and say what happened.
 *
 * Never throws. A request that never got an answer is `network`; every answer,
 * whatever its body, is one of the other kinds.
 */
export async function submitWrite<T>(
  url: string,
  body: unknown,
  { timeoutMs = WRITE_TIMEOUT_MS }: SubmitWriteOptions = {}
): Promise<WriteResult<T>> {
  let response: Response;
  try {
    response = await withTimeout(
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
      timeoutMs
    );
  } catch (error) {
    return { kind: "network", cause: error instanceof WriteTimeout ? "timeout" : "unreachable" };
  }
  return decodeWriteResponse<T>(response);
}
