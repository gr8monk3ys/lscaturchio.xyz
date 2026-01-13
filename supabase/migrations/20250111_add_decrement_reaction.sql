-- Migration: Add decrement_reaction function for atomic unlike/unbookmark
-- Date: 2025-01-11
-- Description: Adds atomic decrement function to prevent race conditions

-- Function to decrement reaction (unlike or unbookmark)
CREATE OR REPLACE FUNCTION decrement_reaction(
  post_slug TEXT,
  reaction_type TEXT  -- 'like' or 'bookmark'
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Only decrement if row exists and count > 0
  IF reaction_type = 'like' THEN
    UPDATE public.reactions
    SET likes = GREATEST(0, likes - 1)
    WHERE slug = post_slug
    RETURNING jsonb_build_object('likes', likes, 'bookmarks', bookmarks) INTO result;
  ELSIF reaction_type = 'bookmark' THEN
    UPDATE public.reactions
    SET bookmarks = GREATEST(0, bookmarks - 1)
    WHERE slug = post_slug
    RETURNING jsonb_build_object('likes', likes, 'bookmarks', bookmarks) INTO result;
  ELSE
    RAISE EXCEPTION 'Invalid reaction type: %', reaction_type;
  END IF;

  -- Return default if no row was found
  IF result IS NULL THEN
    result := jsonb_build_object('likes', 0, 'bookmarks', 0);
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION decrement_reaction(TEXT, TEXT) IS 'Atomically decrement like or bookmark for a blog post';
