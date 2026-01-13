-- Add vote deduplication table for server-side tracking
-- This prevents users from voting multiple times by clearing localStorage

-- Create vote tracking table
CREATE TABLE IF NOT EXISTS vote_records (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'bookmark')),
  voter_hash TEXT NOT NULL,  -- Hash of IP or fingerprint, not raw IP for privacy
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one vote per voter per slug per type
  UNIQUE(slug, type, voter_hash)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_vote_records_lookup ON vote_records(slug, type, voter_hash);

-- Create index for cleanup of old records
CREATE INDEX IF NOT EXISTS idx_vote_records_created ON vote_records(created_at);

-- Function to check if a voter has already voted
CREATE OR REPLACE FUNCTION check_vote_exists(
  p_slug TEXT,
  p_type TEXT,
  p_voter_hash TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM vote_records
    WHERE slug = p_slug
    AND type = p_type
    AND voter_hash = p_voter_hash
  );
END;
$$;

-- Function to record a vote and increment reaction atomically
-- Returns: -1 if already voted, new count if successful
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
  -- Check if already voted
  IF EXISTS (
    SELECT 1 FROM vote_records
    WHERE slug = p_slug AND type = p_type AND voter_hash = p_voter_hash
  ) THEN
    RETURN -1;  -- Already voted
  END IF;

  -- Record the vote
  INSERT INTO vote_records (slug, type, voter_hash)
  VALUES (p_slug, p_type, p_voter_hash);

  -- Increment reaction count
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

  -- Get new count
  SELECT
    CASE WHEN p_type = 'like' THEN likes ELSE bookmarks END
  INTO v_new_count
  FROM reactions
  WHERE slug = p_slug;

  RETURN v_new_count;
END;
$$;

-- Function to remove a vote and decrement reaction atomically
-- Returns: -1 if not previously voted, new count if successful
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
  -- Check if vote exists
  IF NOT EXISTS (
    SELECT 1 FROM vote_records
    WHERE slug = p_slug AND type = p_type AND voter_hash = p_voter_hash
  ) THEN
    RETURN -1;  -- Never voted
  END IF;

  -- Remove the vote record
  DELETE FROM vote_records
  WHERE slug = p_slug AND type = p_type AND voter_hash = p_voter_hash;

  -- Decrement reaction count (don't go below 0)
  UPDATE reactions SET
    likes = CASE WHEN p_type = 'like' THEN GREATEST(0, likes - 1) ELSE likes END,
    bookmarks = CASE WHEN p_type = 'bookmark' THEN GREATEST(0, bookmarks - 1) ELSE bookmarks END,
    updated_at = NOW()
  WHERE slug = p_slug;

  -- Get new count
  SELECT
    CASE WHEN p_type = 'like' THEN likes ELSE bookmarks END
  INTO v_new_count
  FROM reactions
  WHERE slug = p_slug;

  RETURN COALESCE(v_new_count, 0);
END;
$$;

-- Optional: Function to clean up old vote records (run periodically)
-- Keeps votes for 30 days for basic spam prevention while allowing re-engagement
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

-- Grant permissions (adjust based on your Supabase setup)
-- Note: Run these if you need to grant access to anon/authenticated roles
-- GRANT SELECT, INSERT, DELETE ON vote_records TO anon;
-- GRANT EXECUTE ON FUNCTION check_vote_exists TO anon;
-- GRANT EXECUTE ON FUNCTION record_vote TO anon;
-- GRANT EXECUTE ON FUNCTION remove_vote TO anon;
