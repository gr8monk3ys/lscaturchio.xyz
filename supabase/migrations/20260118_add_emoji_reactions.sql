-- Migration: Add emoji reactions to blog posts
-- Date: 2026-01-18
-- Description: Extend reactions table with fire, celebrate, insightful, and thinking emojis

-- ============================================================================
-- ADD EMOJI COLUMNS
-- ============================================================================
-- Add new reaction type columns (all default to 0)
ALTER TABLE public.reactions
  ADD COLUMN IF NOT EXISTS fire INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS celebrate INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS insightful INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS thinking INTEGER NOT NULL DEFAULT 0;

-- ============================================================================
-- UPDATE TOGGLE REACTION FUNCTION
-- ============================================================================
-- Replace the toggle_reaction function to support new emoji types
CREATE OR REPLACE FUNCTION toggle_reaction(
  post_slug TEXT,
  reaction_type TEXT  -- 'like', 'bookmark', 'fire', 'celebrate', 'insightful', 'thinking'
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Initialize row if it doesn't exist
  INSERT INTO public.reactions (slug, likes, bookmarks, fire, celebrate, insightful, thinking)
  VALUES (post_slug, 0, 0, 0, 0, 0, 0)
  ON CONFLICT (slug) DO NOTHING;

  -- Toggle the reaction based on type
  CASE reaction_type
    WHEN 'like' THEN
      UPDATE public.reactions
      SET likes = likes + 1
      WHERE slug = post_slug
      RETURNING jsonb_build_object(
        'likes', likes, 'bookmarks', bookmarks,
        'fire', fire, 'celebrate', celebrate,
        'insightful', insightful, 'thinking', thinking
      ) INTO result;
    WHEN 'bookmark' THEN
      UPDATE public.reactions
      SET bookmarks = bookmarks + 1
      WHERE slug = post_slug
      RETURNING jsonb_build_object(
        'likes', likes, 'bookmarks', bookmarks,
        'fire', fire, 'celebrate', celebrate,
        'insightful', insightful, 'thinking', thinking
      ) INTO result;
    WHEN 'fire' THEN
      UPDATE public.reactions
      SET fire = fire + 1
      WHERE slug = post_slug
      RETURNING jsonb_build_object(
        'likes', likes, 'bookmarks', bookmarks,
        'fire', fire, 'celebrate', celebrate,
        'insightful', insightful, 'thinking', thinking
      ) INTO result;
    WHEN 'celebrate' THEN
      UPDATE public.reactions
      SET celebrate = celebrate + 1
      WHERE slug = post_slug
      RETURNING jsonb_build_object(
        'likes', likes, 'bookmarks', bookmarks,
        'fire', fire, 'celebrate', celebrate,
        'insightful', insightful, 'thinking', thinking
      ) INTO result;
    WHEN 'insightful' THEN
      UPDATE public.reactions
      SET insightful = insightful + 1
      WHERE slug = post_slug
      RETURNING jsonb_build_object(
        'likes', likes, 'bookmarks', bookmarks,
        'fire', fire, 'celebrate', celebrate,
        'insightful', insightful, 'thinking', thinking
      ) INTO result;
    WHEN 'thinking' THEN
      UPDATE public.reactions
      SET thinking = thinking + 1
      WHERE slug = post_slug
      RETURNING jsonb_build_object(
        'likes', likes, 'bookmarks', bookmarks,
        'fire', fire, 'celebrate', celebrate,
        'insightful', insightful, 'thinking', thinking
      ) INTO result;
    ELSE
      RAISE EXCEPTION 'Invalid reaction type: %', reaction_type;
  END CASE;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- UPDATE DECREMENT REACTION FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION decrement_reaction(
  post_slug TEXT,
  reaction_type TEXT
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Decrement the reaction based on type (floor at 0)
  CASE reaction_type
    WHEN 'like' THEN
      UPDATE public.reactions
      SET likes = GREATEST(likes - 1, 0)
      WHERE slug = post_slug
      RETURNING jsonb_build_object(
        'likes', likes, 'bookmarks', bookmarks,
        'fire', fire, 'celebrate', celebrate,
        'insightful', insightful, 'thinking', thinking
      ) INTO result;
    WHEN 'bookmark' THEN
      UPDATE public.reactions
      SET bookmarks = GREATEST(bookmarks - 1, 0)
      WHERE slug = post_slug
      RETURNING jsonb_build_object(
        'likes', likes, 'bookmarks', bookmarks,
        'fire', fire, 'celebrate', celebrate,
        'insightful', insightful, 'thinking', thinking
      ) INTO result;
    WHEN 'fire' THEN
      UPDATE public.reactions
      SET fire = GREATEST(fire - 1, 0)
      WHERE slug = post_slug
      RETURNING jsonb_build_object(
        'likes', likes, 'bookmarks', bookmarks,
        'fire', fire, 'celebrate', celebrate,
        'insightful', insightful, 'thinking', thinking
      ) INTO result;
    WHEN 'celebrate' THEN
      UPDATE public.reactions
      SET celebrate = GREATEST(celebrate - 1, 0)
      WHERE slug = post_slug
      RETURNING jsonb_build_object(
        'likes', likes, 'bookmarks', bookmarks,
        'fire', fire, 'celebrate', celebrate,
        'insightful', insightful, 'thinking', thinking
      ) INTO result;
    WHEN 'insightful' THEN
      UPDATE public.reactions
      SET insightful = GREATEST(insightful - 1, 0)
      WHERE slug = post_slug
      RETURNING jsonb_build_object(
        'likes', likes, 'bookmarks', bookmarks,
        'fire', fire, 'celebrate', celebrate,
        'insightful', insightful, 'thinking', thinking
      ) INTO result;
    WHEN 'thinking' THEN
      UPDATE public.reactions
      SET thinking = GREATEST(thinking - 1, 0)
      WHERE slug = post_slug
      RETURNING jsonb_build_object(
        'likes', likes, 'bookmarks', bookmarks,
        'fire', fire, 'celebrate', celebrate,
        'insightful', insightful, 'thinking', thinking
      ) INTO result;
    ELSE
      RAISE EXCEPTION 'Invalid reaction type: %', reaction_type;
  END CASE;

  -- Return empty result if no row was found
  IF result IS NULL THEN
    RETURN jsonb_build_object(
      'likes', 0, 'bookmarks', 0,
      'fire', 0, 'celebrate', 0,
      'insightful', 0, 'thinking', 0
    );
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DOCUMENTATION
-- ============================================================================
COMMENT ON COLUMN public.reactions.fire IS 'Fire emoji reaction count';
COMMENT ON COLUMN public.reactions.celebrate IS 'Celebrate/party emoji reaction count';
COMMENT ON COLUMN public.reactions.insightful IS 'Lightbulb/insightful emoji reaction count';
COMMENT ON COLUMN public.reactions.thinking IS 'Thinking face emoji reaction count';
