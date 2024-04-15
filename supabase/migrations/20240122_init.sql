-- Enable the vector extension
create extension if not exists vector;

-- Create a table for storing embeddings
create table if not exists embeddings (
  id bigserial primary key,
  content text not null,
  embedding vector(1536) not null,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create an index for faster similarity searches
create index if not exists embeddings_embedding_idx on embeddings 
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Create a function to search for similar embeddings
create or replace function match_embeddings(
  query_embedding vector(1536),
  match_threshold float default 0.5,
  match_count int default 5
)
returns table (
  id bigint,
  content text,
  similarity float,
  metadata jsonb
)
language plpgsql
as $$
begin
  return query
  select
    id,
    content,
    1 - (embeddings.embedding <=> query_embedding) as similarity,
    metadata
  from embeddings
  where 1 - (embeddings.embedding <=> query_embedding) > match_threshold
  order by embeddings.embedding <=> query_embedding
  limit match_count;
end;
$$;
