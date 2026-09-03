/**
 * The single write-route seam.
 *
 * Every mutating API route is built from this module. The four layers a write
 * endpoint needs — rate limit, authentication, CSRF, schema validation — and
 * the response envelope are applied here, in a fixed order the caller cannot
 * reorder or omit:
 *
 *   rate limit -> auth -> CSRF -> body/Zod -> handler -> envelope
 *
 * Every layer is a REQUIRED field on the config, so a route cannot forget one
 * by writing less code; it can only declare a deviation, and each deviation
 * carries a mandatory `reason` string so the exceptions are greppable:
 *
 *   grep -rn 'reason:' src/app/api
 *
 * The handler returns plain data. It has no way to spell a response envelope,
 * so the `{ data, success }` shape cannot drift route by route. Handlers signal
 * expected failures by throwing `writeError.*`; anything else that escapes is
 * logged once and answered with the route's configured 500 message.
 */

import { NextRequest, NextResponse } from "next/server";
import type { ZodSchema, z } from "zod";
import { withRateLimit } from "@/lib/with-rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { requireAdmin } from "@/lib/admin/session";
import { validateApiKey } from "@/lib/api-auth";
import { parseBody } from "@/lib/validations";
import { apiSuccess, apiError, ApiErrors } from "@/lib/api-response";
import { logError } from "@/lib/logger";

export type RateLimitPolicy = { limit: number; window: number };

/**
 * Who may call the route. `public` is a real choice, not an absence, and has to
 * say why — an unauthenticated mutation should be a decision on the page.
 */
export type AuthPolicy =
  | { kind: "public"; reason: string }
  | { kind: "adminSession" }
  | { kind: "apiKey"; envKey: string };

/**
 * Origin checking. Skipping is only correct for endpoints no browser calls
 * (a machine caller sends no Origin header, so `validateCsrf` would 403 it).
 */
export type CsrfPolicy = { kind: "required" } | { kind: "skip"; reason: string };

/**
 * How the request body becomes typed data. `none` is for routes with no body
 * at all; it is the one way to reach a handler without a Zod schema.
 */
export type BodyPolicy<S extends ZodSchema = ZodSchema> =
  | { kind: "json"; schema: S }
  | { kind: "formData"; jsonField: string; schema: S }
  | { kind: "none"; reason: string };

/**
 * `standard` wraps the handler's return value in `{ data, success: true }`.
 * `raw` is for the handful of responses that are not JSON documents at all
 * (a redirect, a file) and hands the handler the NextResponse itself.
 */
export type EnvelopePolicy =
  | { kind: "standard" }
  | { kind: "raw"; reason: string };

/** What an unexpected throw inside the handler logs and returns. */
export type WriteRouteErrors = {
  /** logError() message. */
  log: string;
  component: string;
  action: string;
  /** Client-facing message for the resulting 500. */
  message: string;
};

export type WriteRouteConfig<S extends ZodSchema = ZodSchema> = {
  limit: RateLimitPolicy;
  auth: AuthPolicy;
  csrf: CsrfPolicy;
  body: BodyPolicy<S>;
  envelope: EnvelopePolicy;
  errors: WriteRouteErrors;
};

export type WriteContext<S extends ZodSchema = ZodSchema> = {
  req: NextRequest;
  /** The Zod output. `undefined` when `body.kind === "none"`. */
  data: z.infer<S>;
  /** The parsed form, for `body.kind === "formData"`; otherwise null. */
  form: FormData | null;
};

/**
 * An expected failure with a status code. Throwing this from a handler skips
 * the error log (it is not a bug) and renders through the standard envelope.
 */
export class WriteRouteError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "WriteRouteError";
    this.status = status;
  }
}

export const writeError = {
  badRequest: (message: string) => new WriteRouteError(400, message),
  notFound: (message: string) => new WriteRouteError(404, message),
  conflict: (message: string) => new WriteRouteError(409, message),
  internal: (message: string) => new WriteRouteError(500, message),
};

type RouteHandler = (req: NextRequest) => Promise<NextResponse>;

function checkAuth(req: NextRequest, config: WriteRouteConfig): NextResponse | null {
  const auth = config.auth;
  switch (auth.kind) {
    case "public":
      return null;
    case "adminSession":
      return requireAdmin(req);
    case "apiKey":
      return validateApiKey(req, {
        envKey: auth.envKey,
        component: config.errors.component,
        action: config.errors.action,
      });
  }
}

export function withWriteRoute<S extends ZodSchema, TOut>(
  config: WriteRouteConfig<S> & { envelope: { kind: "standard" } },
  handler: (ctx: WriteContext<S>) => Promise<TOut>
): RouteHandler;
export function withWriteRoute<S extends ZodSchema>(
  config: WriteRouteConfig<S> & { envelope: { kind: "raw"; reason: string } },
  handler: (ctx: WriteContext<S>) => Promise<NextResponse>
): RouteHandler;
export function withWriteRoute<S extends ZodSchema>(
  config: WriteRouteConfig<S>,
  handler: (ctx: WriteContext<S>) => Promise<unknown>
): RouteHandler {
  const chain = async (req: NextRequest): Promise<NextResponse> => {
    // 1. auth — before CSRF, matching the order the admin routes already used.
    const authError = checkAuth(req, config as WriteRouteConfig);
    if (authError) return authError;

    // 2. CSRF
    if (config.csrf.kind === "required") {
      const csrfError = validateCsrf(req);
      if (csrfError) return csrfError;
    }

    try {
      // 3. body -> Zod
      let data: unknown;
      let form: FormData | null = null;
      const body = config.body;

      if (body.kind === "json") {
        const parsed = parseBody(body.schema, await req.json());
        if (!parsed.success) return ApiErrors.badRequest(parsed.error);
        data = parsed.data;
      } else if (body.kind === "formData") {
        form = await req.formData();
        const raw = form.get(body.jsonField);
        if (typeof raw !== "string") return ApiErrors.missingField(body.jsonField);
        const parsed = parseBody(body.schema, JSON.parse(raw));
        if (!parsed.success) return ApiErrors.badRequest(parsed.error);
        data = parsed.data;
      }

      // 4. handler
      const result = await handler({ req, data, form } as WriteContext<S>);

      // 5. envelope
      if (config.envelope.kind === "raw") {
        return result as NextResponse;
      }
      return apiSuccess(result);
    } catch (error) {
      if (error instanceof WriteRouteError) {
        return apiError(error.message, error.status);
      }
      logError(config.errors.log, error, {
        component: config.errors.component,
        action: config.errors.action,
      });
      return apiError(config.errors.message, 500);
    }
  };

  // 0. rate limit, outermost: the cheapest layer runs first.
  return withRateLimit(chain, config.limit);
}
