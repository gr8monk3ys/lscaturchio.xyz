import OpenAI from 'openai';
import { getSupabase } from './supabase';

// Configurable similarity threshold for embedding search (0-1, higher = stricter)
const EMBEDDING_MATCH_THRESHOLD = parseFloat(
  process.env.EMBEDDING_MATCH_THRESHOLD || '0.5'
);

// Lazy initialization to avoid build-time errors with missing env vars
let openai: OpenAI | null = null;

function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      timeout: 30000, // 30 second timeout
      maxRetries: 1,
    });
  }
  return openai;
}

// Function to split text into chunks
export function splitIntoChunks(text: string, maxChunkLength: number = 1500): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxChunkLength) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence;
    } else {
      currentChunk += ' ' + sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// Function to create embeddings
export async function createEmbedding(text: string) {
  const client = getOpenAI();
  const response = await client.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });

  return response.data[0].embedding;
}

// Function to store embeddings in Supabase
export async function storeEmbedding(
  text: string,
  embedding: number[],
  metadata: Record<string, unknown> = {}
) {
  const client = getSupabase();
  const { error } = await client.from('embeddings').insert({
    content: text,
    embedding,
    metadata,
  });

  if (error) throw error;
}

// Function to search for similar content
export async function searchSimilarContent(query: string, limit: number = 5) {
  const embedding = await createEmbedding(query);
  const client = getSupabase();

  const { data, error } = await client.rpc('match_embeddings', {
    query_embedding: embedding,
    match_threshold: EMBEDDING_MATCH_THRESHOLD,
    match_count: limit,
  });

  if (error) throw error;
  return data;
}

// Alias for searchSimilarContent (used by new API routes)
export const searchEmbeddings = searchSimilarContent;
