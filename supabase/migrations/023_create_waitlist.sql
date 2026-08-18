-- Migration 023: Waitlist System
-- Creates waitlist table and capacity check functions

-- Waitlist table
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('rat_rate', 'standard')),
  service_type service_type NOT NULL,
  draft_data JSONB, -- Stores user's partial submission data
  notified_at TIMESTAMPTZ, -- When user was notified of available spot
  spot_expires_at TIMESTAMPTZ, -- 2 hours after notification
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  converted_at TIMESTAMPTZ, -- When they submitted after getting spot
  cancelled_at TIMESTAMPTZ, -- If they cancelled before converting
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_waitlist_user_id ON waitlist(user_id);
CREATE INDEX idx_waitlist_tier ON waitlist(tier);
CREATE INDEX idx_waitlist_active ON waitlist(tier, notified_at, converted_at, cancelled_at)
  WHERE notified_at IS NULL AND converted_at IS NULL AND cancelled_at IS NULL;

-- Enable RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own waitlist entries
CREATE POLICY "Users can view their own waitlist entries"
  ON waitlist FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own waitlist entries
CREATE POLICY "Users can create their own waitlist entries"
  ON waitlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own waitlist entries
CREATE POLICY "Users can update their own waitlist entries"
  ON waitlist FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all waitlist entries
CREATE POLICY "Admins can view all waitlist entries"
  ON waitlist FOR SELECT
  USING (is_admin());

-- Admins can manage all waitlist entries
CREATE POLICY "Admins can manage all waitlist entries"
  ON waitlist FOR ALL
  USING (is_admin());
