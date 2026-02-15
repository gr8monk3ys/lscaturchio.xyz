import { NextResponse } from "next/server";
import { withRateLimit } from "@/lib/with-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import {
  getEmbeddingProvider,
  getProviderEmbeddingDimensions,
  isEmbeddingsAvailable,
} from "@/lib/embeddings";
import { isOllamaAvailable } from "@/lib/ollama";
import { logError } from "@/lib/logger";

const handleGet = async () => {
  const timestamp = new Date().toISOString();

  const openaiConfigured = !!process.env.OPENAI_API_KEY;
  const embeddingsProvider = getEmbeddingProvider();
  const embeddingsDimensions = getProviderEmbeddingDimensions();

  let embeddingsAvailable = false;
  try {
    embeddingsAvailable = await isEmbeddingsAvailable();
  } catch (error) {
    logError("RAG status: embeddings availability check failed", error, { component: "rag-status" });
    embeddingsAvailable = false;
  }

  const databaseConfigured = isDatabaseConfigured();
  let databaseOk = false;
  let embeddingsCount: number | null = null;

  if (databaseConfigured) {
    try {
      const sql = getDb();
      await sql`SELECT 1`;
      databaseOk = true;

      try {
        const rows = await sql`SELECT COUNT(*)::int as count FROM embeddings`;
        embeddingsCount = rows[0]?.count ?? 0;
      } catch {
        // Table may not exist yet (first deploy), or pgvector not installed.
        embeddingsCount = null;
      }
    } catch (error) {
      logError("RAG status: database check failed", error, { component: "rag-status" });
      databaseOk = false;
    }
  }

  // Ollama checks can be slow/irrelevant in prod; only probe when OpenAI isn't configured.
  let ollamaAvailable: boolean | null = null;
  if (!openaiConfigured) {
    try {
      ollamaAvailable = await isOllamaAvailable();
    } catch {
      ollamaAvailable = null;
    }
  }

  return NextResponse.json(
    {
      timestamp,
      database: {
        configured: databaseConfigured,
        ok: databaseOk,
      },
      embeddings: {
        provider: embeddingsProvider,
        available: embeddingsAvailable,
        dimensions: embeddingsDimensions,
        count: embeddingsCount,
      },
      chat: {
        openaiConfigured,
        ollamaAvailable,
      },
    },
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
};

export const GET = withRateLimit(handleGet, RATE_LIMITS.PUBLIC);

