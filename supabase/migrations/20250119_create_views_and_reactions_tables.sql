-- Migration: Create views and reactions tables for blog engagement tracking
-- Date: 2025-01-19
-- Description: Migrate from in-memory storage to persistent Supabase tables

-- ============================================================================
-- VIEWS TABLE
-- ============================================================================
-- Tracks view counts for each blog post by slug
CREATE TABLE IF NOT EXISTS public.views (
  slug TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_views_slug ON public.views(slug);

-- Add trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_views_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER views_updated_at_trigger
  BEFORE UPDATE ON public.views
  FOR EACH ROW
  EXECUTE FUNCTION update_views_updated_at();

-- ============================================================================
-- REACTIONS TABLE
-- ============================================================================
-- Tracks likes and bookmarks for each blog post by slug
CREATE TABLE IF NOT EXISTS public.reactions (
  slug TEXT PRIMARY KEY,
  likes INTEGER NOT NULL DEFAULT 0,
  bookmarks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reactions_slug ON public.reactions(slug);

-- Add trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_reactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reactions_updated_at_trigger
  BEFORE UPDATE ON public.reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_reactions_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Enable RLS for both tables
ALTER TABLE public.views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Allow public read access (anyone can view counts)
CREATE POLICY "Public read access for views"
  ON public.views FOR SELECT
  USING (true);

CREATE POLICY "Public read access for reactions"
  ON public.reactions FOR SELECT
  USING (true);

-- Allow service role to insert/update (API routes use service key)
CREATE POLICY "Service role can insert views"
  ON public.views FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update views"
  ON public.views FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "Service role can insert reactions"
  ON public.reactions FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update reactions"
  ON public.reactions FOR UPDATE
  TO service_role
  USING (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================
-- Function to increment view count (upsert pattern)
CREATE OR REPLACE FUNCTION increment_view_count(post_slug TEXT)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  INSERT INTO public.views (slug, count)
  VALUES (post_slug, 1)
  ON CONFLICT (slug)
  DO UPDATE SET count = views.count + 1
  RETURNING count INTO new_count;

  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to toggle reaction (like or bookmark)
CREATE OR REPLACE FUNCTION toggle_reaction(
  post_slug TEXT,
  reaction_type TEXT  -- 'like' or 'bookmark'
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Initialize row if it doesn't exist
  INSERT INTO public.reactions (slug, likes, bookmarks)
  VALUES (post_slug, 0, 0)
  ON CONFLICT (slug) DO NOTHING;

  -- Toggle the reaction
  IF reaction_type = 'like' THEN
    UPDATE public.reactions
    SET likes = likes + 1
    WHERE slug = post_slug
    RETURNING jsonb_build_object('likes', likes, 'bookmarks', bookmarks) INTO result;
  ELSIF reaction_type = 'bookmark' THEN
    UPDATE public.reactions
    SET bookmarks = bookmarks + 1
    WHERE slug = post_slug
    RETURNING jsonb_build_object('likes', likes, 'bookmarks', bookmarks) INTO result;
  ELSE
    RAISE EXCEPTION 'Invalid reaction type: %', reaction_type;
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
-- Grant service role full access
GRANT ALL ON public.views TO service_role;
GRANT ALL ON public.reactions TO service_role;

-- Grant anon role read access
GRANT SELECT ON public.views TO anon;
GRANT SELECT ON public.reactions TO anon;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE public.views IS 'Tracks view counts for blog posts';
COMMENT ON TABLE public.reactions IS 'Tracks likes and bookmarks for blog posts';
COMMENT ON FUNCTION increment_view_count(TEXT) IS 'Atomically increment view count for a blog post';
COMMENT ON FUNCTION toggle_reaction(TEXT, TEXT) IS 'Toggle like or bookmark for a blog post';
