-- Migration to support Ollama embeddings (768 dimensions for nomic-embed-text)
-- This replaces the OpenAI-specific 1536-dimension embeddings

-- Drop the existing function and table
DROP FUNCTION IF EXISTS match_embeddings(vector(1536), float, int);
DROP TABLE IF EXISTS embeddings CASCADE;

-- Create embeddings table with 768 dimensions (Ollama nomic-embed-text)
CREATE TABLE embeddings (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(768) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create index for similarity searches
CREATE INDEX IF NOT EXISTS embeddings_embedding_idx
ON embeddings
USING hnsw (embedding vector_cosine_ops);

-- Create match function for 768-dimension vectors
CREATE OR REPLACE FUNCTION match_embeddings(
  query_embedding VECTOR(768),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  similarity FLOAT,
  metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    embeddings.id,
    embeddings.content,
    1 - (embeddings.embedding <=> query_embedding) AS similarity,
    embeddings.metadata
  FROM embeddings
  WHERE 1 - (embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON TABLE embeddings IS 'Stores vector embeddings for RAG search. Uses 768 dimensions (Ollama nomic-embed-text model).';
