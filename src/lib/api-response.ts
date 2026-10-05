/**
 * Standardized API response helpers
 *
 * Provides consistent response format across all API routes:
 * - Success: { data: T, success: true }
 * - Error: { error: string, success: false, field?: string, retryAfter?: number }
 *
 * `field` names the input a 400 is about; `retryAfter` is the 429's wait in
 * seconds. The browser decodes this one shape in `submitWrite`
 * (`src/lib/fetcher.ts`), so a layer that answers in any other shape is a
 * failure the forms cannot read.
 */

import { NextResponse } from "next/server";

interface ApiSuccessOptions {
  status?: number
  headers?: Record<string, string>
}

/**
 * Standard API success response.
 *
 * Accepts either a numeric status code (legacy) or an options object
 * with status and/or custom headers.
 */
export function apiSuccess<T>(
  data: T,
  statusOrOptions: number | ApiSuccessOptions = 200,
): NextResponse {
  const opts: ApiSuccessOptions =
    typeof statusOrOptions === 'number'
      ? { status: statusOrOptions }
      : statusOrOptions
  const status = opts.status ?? 200
  const headers = opts.headers ?? {}

  return NextResponse.json(
    { data, success: true },
    { status, headers },
  )
}

/**
 * Standard API error response
 */
export function apiError(
  message: string,
  status = 400,
  details?: Record<string, unknown>
): NextResponse {
  return NextResponse.json(
    { error: message, success: false, ...details },
    { status }
  );
}

/**
 * A layer's decision to stop a request, before it is rendered.
 *
 * The pre-handler layers of the write chain — CSRF (`validateCsrf`), API-key
 * auth (`validateApiKey`) and the admin session (`requireAdmin`) — return one
 * of these instead of a response, and the caller renders it with
 * `refusalResponse`. They used to build their own `NextResponse.json({ error })`,
 * which is how a CSRF 403 came to be the one failure on a write route without
 * `success: false`: the chain's envelope cannot drift if the layers never
 * spell one.
 */
export type Refusal = { status: number; error: string };

export function refusalResponse(refusal: Refusal): NextResponse {
  return apiError(refusal.error, refusal.status);
}

/**
 * Common error responses for reuse
 */
export const ApiErrors = {
  // `field` names the input the message belongs to, when there is one, so a
  // form can render it beside that input rather than as a page-level banner.
  badRequest: (message = "Bad request", field?: string) =>
    apiError(message, 400, field ? { field } : undefined),
  unauthorized: (message = "Unauthorized") => apiError(message, 401),
  forbidden: (message = "Forbidden") => apiError(message, 403),
  notFound: (message = "Not found") => apiError(message, 404),
  methodNotAllowed: (message = "Method not allowed") => apiError(message, 405),
  conflict: (message = "Conflict") => apiError(message, 409),
  tooManyRequests: (message = "Too many requests", retryAfter?: number) =>
    apiError(message, 429, retryAfter ? { retryAfter } : undefined),
  internalError: (message = "Internal server error") => apiError(message, 500),

  // Validation errors
  validationError: (error: string) => apiError(error, 400),
  missingField: (field: string) => apiError(`${field} is required`, 400),
};
