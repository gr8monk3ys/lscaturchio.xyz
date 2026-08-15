import { fetchJson, HttpError } from "@/lib/fetcher";
import type { PublishState } from "./publish-result";

interface PublishEnvelope {
  data: { commitUrl: string; path?: string };
}

/**
 * The one client-side path from "submit" to a PublishState: POST/PUT, unwrap
 * the { data, success } envelope (fetchJson already surfaces the envelope's
 * error message on failure), map to done/error.
 */
export async function publishRequest(
  url: string,
  init: RequestInit,
  fallbackViewPath?: string
): Promise<PublishState> {
  try {
    const payload = await fetchJson<PublishEnvelope>(url, init);
    return {
      state: "done",
      commitUrl: payload.data.commitUrl,
      viewPath: payload.data.path ?? fallbackViewPath,
    };
  } catch (error) {
    return {
      state: "error",
      message:
        error instanceof HttpError || error instanceof Error
          ? error.message
          : "Publish failed",
    };
  }
}
