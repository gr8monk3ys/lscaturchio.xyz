-- Combined Neon PostgreSQL migration
-- Runs all table creation, functions, and indexes for the lscaturchio.xyz project
-- Note: RLS policies and Supabase-specific role grants are omitted (not applicable to Neon)

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- 2. EMBEDDINGS TABLE (from 20260124_support_variable_embeddings.sql)
-- ============================================================================
CREATE TABLE IF NOT EXISTS embeddings (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(768) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS embeddings_embedding_idx
ON embeddings
USING hnsw (embedding vector_cosine_ops);

-- ============================================================================
-- 3. NEWSLETTER SUBSCRIBERS (from 001_create_newsletter.sql)
-- ============================================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  unsubscribe_token TEXT UNIQUE,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(is_active);

-- ============================================================================
-- 4. VIEWS TABLE (from 20250119_create_views_and_reactions_tables.sql)
-- ============================================================================
CREATE TABLE IF NOT EXISTS views (
  slug TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_views_slug ON views(slug);

CREATE OR REPLACE FUNCTION update_views_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS views_updated_at_trigger ON views;
CREATE TRIGGER views_updated_at_trigger
  BEFORE UPDATE ON views
  FOR EACH ROW
  EXECUTE FUNCTION update_views_updated_at();

-- ============================================================================
-- 5. REACTIONS TABLE (from 20250119 + 20260118_add_emoji_reactions.sql)
-- ============================================================================
CREATE TABLE IF NOT EXISTS reactions (
  slug TEXT PRIMARY KEY,
  likes INTEGER NOT NULL DEFAULT 0,
  bookmarks INTEGER NOT NULL DEFAULT 0,
  fire INTEGER NOT NULL DEFAULT 0,
  celebrate INTEGER NOT NULL DEFAULT 0,
  insightful INTEGER NOT NULL DEFAULT 0,
  thinking INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reactions_slug ON reactions(slug);

CREATE OR REPLACE FUNCTION update_reactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reactions_updated_at_trigger ON reactions;
CREATE TRIGGER reactions_updated_at_trigger
  BEFORE UPDATE ON reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_reactions_updated_at();

-- ============================================================================
-- 6. VOTE RECORDS TABLE (from 20250112_add_vote_deduplication.sql)
-- ============================================================================
CREATE TABLE IF NOT EXISTS vote_records (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'bookmark')),
  voter_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(slug, type, voter_hash)
);

CREATE INDEX IF NOT EXISTS idx_vote_records_lookup ON vote_records(slug, type, voter_hash);
CREATE INDEX IF NOT EXISTS idx_vote_records_created ON vote_records(created_at);

-- ============================================================================
-- 7. GUESTBOOK TABLE (from 20260124_create_guestbook.sql)
-- ============================================================================
CREATE TABLE IF NOT EXISTS guestbook (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  message TEXT NOT NULL CHECK (char_length(message) <= 500),
  github_username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guestbook_created_at ON guestbook(created_at DESC);

-- ============================================================================
-- 8. FUNCTIONS
-- ============================================================================

-- Increment view count (atomic upsert)
CREATE OR REPLACE FUNCTION increment_view_count(post_slug TEXT)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  INSERT INTO views (slug, count)
  VALUES (post_slug, 1)
  ON CONFLICT (slug)
  DO UPDATE SET count = views.count + 1
  RETURNING count INTO new_count;
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- Toggle reaction (increment)
CREATE OR REPLACE FUNCTION toggle_reaction(
  post_slug TEXT,
  reaction_type TEXT
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  INSERT INTO reactions (slug, likes, bookmarks, fire, celebrate, insightful, thinking)
  VALUES (post_slug, 0, 0, 0, 0, 0, 0)
  ON CONFLICT (slug) DO NOTHING;

  CASE reaction_type
    WHEN 'like' THEN
      UPDATE reactions SET likes = likes + 1 WHERE slug = post_slug
      RETURNING jsonb_build_object('likes', likes, 'bookmarks', bookmarks, 'fire', fire, 'celebrate', celebrate, 'insightful', insightful, 'thinking', thinking) INTO result;
    WHEN 'bookmark' THEN
      UPDATE reactions SET bookmarks = bookmarks + 1 WHERE slug = post_slug
      RETURNING jsonb_build_object('likes', likes, 'bookmarks', bookmarks, 'fire', fire, 'celebrate', celebrate, 'insightful', insightful, 'thinking', thinking) INTO result;
    WHEN 'fire' THEN
      UPDATE reactions SET fire = fire + 1 WHERE slug = post_slug
      RETURNING jsonb_build_object('likes', likes, 'bookmarks', bookmarks, 'fire', fire, 'celebrate', celebrate, 'insightful', insightful, 'thinking', thinking) INTO result;
    WHEN 'celebrate' THEN
      UPDATE reactions SET celebrate = celebrate + 1 WHERE slug = post_slug
      RETURNING jsonb_build_object('likes', likes, 'bookmarks', bookmarks, 'fire', fire, 'celebrate', celebrate, 'insightful', insightful, 'thinking', thinking) INTO result;
    WHEN 'insightful' THEN
      UPDATE reactions SET insightful = insightful + 1 WHERE slug = post_slug
      RETURNING jsonb_build_object('likes', likes, 'bookmarks', bookmarks, 'fire', fire, 'celebrate', celebrate, 'insightful', insightful, 'thinking', thinking) INTO result;
    WHEN 'thinking' THEN
      UPDATE reactions SET thinking = thinking + 1 WHERE slug = post_slug
      RETURNING jsonb_build_object('likes', likes, 'bookmarks', bookmarks, 'fire', fire, 'celebrate', celebrate, 'insightful', insightful, 'thinking', thinking) INTO result;
    ELSE
      RAISE EXCEPTION 'Invalid reaction type: %', reaction_type;
  END CASE;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Decrement reaction
CREATE OR REPLACE FUNCTION decrement_reaction(
  post_slug TEXT,
  reaction_type TEXT
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  CASE reaction_type
    WHEN 'like' THEN
      UPDATE reactions SET likes = GREATEST(likes - 1, 0) WHERE slug = post_slug
      RETURNING jsonb_build_object('likes', likes, 'bookmarks', bookmarks, 'fire', fire, 'celebrate', celebrate, 'insightful', insightful, 'thinking', thinking) INTO result;
    WHEN 'bookmark' THEN
      UPDATE reactions SET bookmarks = GREATEST(bookmarks - 1, 0) WHERE slug = post_slug
      RETURNING jsonb_build_object('likes', likes, 'bookmarks', bookmarks, 'fire', fire, 'celebrate', celebrate, 'insightful', insightful, 'thinking', thinking) INTO result;
    WHEN 'fire' THEN
      UPDATE reactions SET fire = GREATEST(fire - 1, 0) WHERE slug = post_slug
      RETURNING jsonb_build_object('likes', likes, 'bookmarks', bookmarks, 'fire', fire, 'celebrate', celebrate, 'insightful', insightful, 'thinking', thinking) INTO result;
    WHEN 'celebrate' THEN
      UPDATE reactions SET celebrate = GREATEST(celebrate - 1, 0) WHERE slug = post_slug
      RETURNING jsonb_build_object('likes', likes, 'bookmarks', bookmarks, 'fire', fire, 'celebrate', celebrate, 'insightful', insightful, 'thinking', thinking) INTO result;
    WHEN 'insightful' THEN
      UPDATE reactions SET insightful = GREATEST(insightful - 1, 0) WHERE slug = post_slug
      RETURNING jsonb_build_object('likes', likes, 'bookmarks', bookmarks, 'fire', fire, 'celebrate', celebrate, 'insightful', insightful, 'thinking', thinking) INTO result;
    WHEN 'thinking' THEN
      UPDATE reactions SET thinking = GREATEST(thinking - 1, 0) WHERE slug = post_slug
      RETURNING jsonb_build_object('likes', likes, 'bookmarks', bookmarks, 'fire', fire, 'celebrate', celebrate, 'insightful', insightful, 'thinking', thinking) INTO result;
    ELSE
      RAISE EXCEPTION 'Invalid reaction type: %', reaction_type;
  END CASE;

  IF result IS NULL THEN
    RETURN jsonb_build_object('likes', 0, 'bookmarks', 0, 'fire', 0, 'celebrate', 0, 'insightful', 0, 'thinking', 0);
  END IF;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Record vote with deduplication
CREATE OR REPLACE FUNCTION record_vote(
  p_slug TEXT,
  p_type TEXT,
  p_voter_hash TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_new_count INTEGER;
BEGIN
  IF EXISTS (
    SELECT 1 FROM vote_records
    WHERE slug = p_slug AND type = p_type AND voter_hash = p_voter_hash
  ) THEN
    RETURN -1;
  END IF;

  INSERT INTO vote_records (slug, type, voter_hash)
  VALUES (p_slug, p_type, p_voter_hash);

  INSERT INTO reactions (slug, likes, bookmarks)
  VALUES (
    p_slug,
    CASE WHEN p_type = 'like' THEN 1 ELSE 0 END,
    CASE WHEN p_type = 'bookmark' THEN 1 ELSE 0 END
  )
  ON CONFLICT (slug) DO UPDATE SET
    likes = CASE WHEN p_type = 'like' THEN reactions.likes + 1 ELSE reactions.likes END,
    bookmarks = CASE WHEN p_type = 'bookmark' THEN reactions.bookmarks + 1 ELSE reactions.bookmarks END,
    updated_at = NOW();

  SELECT
    CASE WHEN p_type = 'like' THEN likes ELSE bookmarks END
  INTO v_new_count
  FROM reactions
  WHERE slug = p_slug;

  RETURN v_new_count;
END;
$$;

-- Remove vote with deduplication
CREATE OR REPLACE FUNCTION remove_vote(
  p_slug TEXT,
  p_type TEXT,
  p_voter_hash TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_new_count INTEGER;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM vote_records
    WHERE slug = p_slug AND type = p_type AND voter_hash = p_voter_hash
  ) THEN
    RETURN -1;
  END IF;

  DELETE FROM vote_records
  WHERE slug = p_slug AND type = p_type AND voter_hash = p_voter_hash;

  UPDATE reactions SET
    likes = CASE WHEN p_type = 'like' THEN GREATEST(0, likes - 1) ELSE likes END,
    bookmarks = CASE WHEN p_type = 'bookmark' THEN GREATEST(0, bookmarks - 1) ELSE bookmarks END,
    updated_at = NOW()
  WHERE slug = p_slug;

  SELECT
    CASE WHEN p_type = 'like' THEN likes ELSE bookmarks END
  INTO v_new_count
  FROM reactions
  WHERE slug = p_slug;

  RETURN COALESCE(v_new_count, 0);
END;
$$;

-- Match embeddings (vector similarity search)
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

-- Count active newsletter subscribers
CREATE OR REPLACE FUNCTION count_active_subscribers()
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM newsletter_subscribers
  WHERE is_active = true;
$$ LANGUAGE SQL STABLE;

-- Cleanup old vote records
CREATE OR REPLACE FUNCTION cleanup_old_votes()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM vote_records
  WHERE created_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;
