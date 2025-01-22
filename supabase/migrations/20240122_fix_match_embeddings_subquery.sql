-- Drop existing function if it exists
drop function if exists match_embeddings;

-- Create the function with a subquery to avoid ambiguous columns
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
language sql
as $$
  with matches as (
    select
      e.id,
      e.content,
      e.metadata,
      1 - (e.embedding <=> query_embedding) as similarity
    from embeddings e
    where 1 - (e.embedding <=> query_embedding) > match_threshold
  )
  select
    matches.id,
    matches.content,
    matches.similarity,
    matches.metadata
  from matches
  order by matches.similarity desc
  limit match_count;
$$;
