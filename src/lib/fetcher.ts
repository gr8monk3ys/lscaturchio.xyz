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

export function unwrapApiData<T>(payload: T | { data: T }): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}
