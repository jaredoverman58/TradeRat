-- Migration 013: Contact Messages
-- Creates table for contact form submissions with rate limiting

-- Create enum for contact message status
CREATE TYPE contact_status AS ENUM ('new', 'in_progress', 'resolved');

-- Contact messages table
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status contact_status NOT NULL DEFAULT 'new',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_contact_messages_email ON contact_messages(email);
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_user_id ON contact_messages(user_id);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contact_messages

-- Anyone can insert contact messages (public contact form)
CREATE POLICY "Anyone can create contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

-- Users can view their own contact messages
CREATE POLICY "Users can view their own contact messages"
  ON contact_messages FOR SELECT
  USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Admins can view all contact messages
CREATE POLICY "Admins can view all contact messages"
  ON contact_messages FOR SELECT
  USING (is_admin());

-- Admins can update contact messages (status changes)
CREATE POLICY "Admins can update contact messages"
  ON contact_messages FOR UPDATE
  USING (is_admin());

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to check rate limiting (3 per 24 hours, 6 per 7 days)
CREATE OR REPLACE FUNCTION check_contact_rate_limit(p_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  count_24h INTEGER;
  count_7d INTEGER;
BEGIN
  -- Count messages in last 24 hours
  SELECT COUNT(*) INTO count_24h
  FROM contact_messages
  WHERE email = p_email
    AND created_at > NOW() - INTERVAL '24 hours';

  -- Count messages in last 7 days
  SELECT COUNT(*) INTO count_7d
  FROM contact_messages
  WHERE email = p_email
    AND created_at > NOW() - INTERVAL '7 days';

  -- Return true if within limits
  RETURN (count_24h < 3 AND count_7d < 6);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON TABLE contact_messages IS 'Contact form submissions with rate limiting';
COMMENT ON FUNCTION check_contact_rate_limit IS 'Checks if email has exceeded rate limit (3/24h, 6/7d)';
