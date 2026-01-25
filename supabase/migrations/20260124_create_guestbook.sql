-- Guestbook entries table
CREATE TABLE IF NOT EXISTS guestbook (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  message TEXT NOT NULL CHECK (char_length(message) <= 500),
  github_username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for ordering
CREATE INDEX idx_guestbook_created_at ON guestbook(created_at DESC);

-- RLS policies
ALTER TABLE guestbook ENABLE ROW LEVEL SECURITY;

-- Anyone can read guestbook entries
CREATE POLICY "Guestbook entries are viewable by everyone"
  ON guestbook FOR SELECT
  USING (true);

-- Only authenticated requests can insert (will be enforced by API)
CREATE POLICY "Guestbook entries can be created"
  ON guestbook FOR INSERT
  WITH CHECK (true);
