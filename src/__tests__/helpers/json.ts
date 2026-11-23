// Response.json() is `unknown` under ts-reset. API tests assert on bodies they
// have just provoked, so they read through this single narrowing point instead
// of casting at every call site. Pass a type argument when a test needs more
// than property access (arrays, length, map).
export interface JsonBody {
  [key: string]: JsonBody;
}

export function parseJson(text: string): JsonBody {
  return JSON.parse(text) as JsonBody;
}

export async function readJson<T = JsonBody>(response: Response): Promise<T> {
  return (await response.json()) as T;
}
