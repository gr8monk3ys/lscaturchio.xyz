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
import { apiSuccess } from "@/lib/api-response";

const handleGet = async () => {
  const timestamp = new Date().toISOString();

  const openaiConfigured = !!process.env.OPENAI_API_KEY;
  const embeddingsProvider = getEmbeddingProvider();
  const embeddingsDimensions = getProviderEmbeddingDimensions();

  const databaseConfigured = isDatabaseConfigured();

  // The three probes are independent — embeddings, database, Ollama — so they
  // run together; the response used to wait for each in turn.
  const checkEmbeddings = async (): Promise<boolean> => {
    try {
      return await isEmbeddingsAvailable();
    } catch (error) {
      logError("RAG status: embeddings availability check failed", error, { component: "rag-status" });
      return false;
    }
  };

  const checkDatabase = async (): Promise<{ ok: boolean; count: number | null }> => {
    if (!databaseConfigured) return { ok: false, count: null };
    try {
      const sql = getDb();
      await sql`SELECT 1`;

      try {
        const rows = await sql`SELECT COUNT(*)::int as count FROM embeddings`;
        return { ok: true, count: rows[0]?.count ?? 0 };
      } catch {
        // Table may not exist yet (first deploy), or pgvector not installed.
        return { ok: true, count: null };
      }
    } catch (error) {
      logError("RAG status: database check failed", error, { component: "rag-status" });
      return { ok: false, count: null };
    }
  };

  // Ollama checks can be slow/irrelevant in prod; only probe when OpenAI isn't configured.
  const checkOllama = async (): Promise<boolean | null> => {
    if (openaiConfigured) return null;
    try {
      return await isOllamaAvailable();
    } catch {
      return null;
    }
  };

  const [embeddingsAvailable, database, ollamaAvailable] = await Promise.all([
    checkEmbeddings(),
    checkDatabase(),
    checkOllama(),
  ]);
  const databaseOk = database.ok;
  const embeddingsCount = database.count;

  return apiSuccess(
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

