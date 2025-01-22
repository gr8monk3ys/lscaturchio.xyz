import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

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
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });

  return response.data[0].embedding;
}

// Function to store embeddings in Supabase
export async function storeEmbedding(
  text: string,
  embedding: number[],
  metadata: any = {}
) {
  const { error } = await supabase.from('embeddings').insert({
    content: text,
    embedding,
    metadata,
  });

  if (error) throw error;
}

// Function to search for similar content
export async function searchSimilarContent(query: string, limit: number = 5) {
  const embedding = await createEmbedding(query);

  const { data, error } = await supabase.rpc('match_embeddings', {
    query_embedding: embedding,
    match_threshold: 0.5,
    match_count: limit,
  });

  if (error) throw error;
  return data;
}
