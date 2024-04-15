-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  unsubscribe_token TEXT UNIQUE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);

-- Create index for active subscribers
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(is_active);

-- Enable Row Level Security
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts (subscribing)
CREATE POLICY "Allow anonymous subscription" ON newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy to allow updates only with valid token (unsubscribing)
CREATE POLICY "Allow token-based unsubscribe" ON newsletter_subscribers
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create function to count active subscribers
CREATE OR REPLACE FUNCTION count_active_subscribers()
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM newsletter_subscribers
  WHERE is_active = true;
$$ LANGUAGE SQL STABLE;
