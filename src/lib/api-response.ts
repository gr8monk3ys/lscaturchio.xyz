/**
 * Standardized API response helpers
 *
 * Provides consistent response format across all API routes:
 * - Success: { data: T, success: true }
 * - Error: { error: string, success: false }
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
 * Common error responses for reuse
 */
export const ApiErrors = {
  badRequest: (message = "Bad request") => apiError(message, 400),
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

/**
 * Type for API response data
 */
export type ApiResponse<T> =
  | { data: T; success: true }
  | { error: string; success: false };
