-- Migration 003: League Profiles and Experts Tables
-- Creates core tables for league tracking and expert management

-- Create enums for league profiles
CREATE TYPE platform_type AS ENUM ('ESPN', 'Sleeper', 'Yahoo', 'Fantrax', 'NFL.com', 'Other');
CREATE TYPE scoring_format AS ENUM ('PPR', 'Half-PPR', 'Standard', 'TE Premium', 'Other');
CREATE TYPE league_type AS ENUM ('Redraft', 'Keeper', 'Dynasty', 'Other');

-- Create enums for submissions
CREATE TYPE service_type AS ENUM ('accept_decline', 'counter_offer', 'bundle', 'trade_finder');
CREATE TYPE offer_direction AS ENUM ('received', 'proposed');
CREATE TYPE rate_tier AS ENUM ('standard', 'rat_rate');
CREATE TYPE submission_status AS ENUM (
  'draft',
  'submitted',
  'claimed',
  'in_progress',
  'passed_off',
  'completed',
  'cancelled'
);

-- Create enum for expert tiers
CREATE TYPE expert_tier AS ENUM ('premium', 'standard');

-- Create enum for bundle types
CREATE TYPE bundle_type AS ENUM (
  'standard_3_pack',
  'standard_5_pack',
  'rat_rate_3_pack',
  'rat_rate_5_pack'
);

-- User roles table (extends auth.users)
CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'expert', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- League profiles table
CREATE TABLE league_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  league_name TEXT NOT NULL,
  platform platform_type NOT NULL,
  scoring_format scoring_format NOT NULL,
  num_teams INTEGER NOT NULL CHECK (num_teams >= 2 AND num_teams <= 32),
  league_type league_type NOT NULL,
  user_roster TEXT,
  trade_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX idx_league_profiles_user_id ON league_profiles(user_id);

-- Experts table
CREATE TABLE experts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL UNIQUE CHECK (name IN ('The Rat', 'The Monkey', 'The Badger')),
  tier expert_tier NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for availability lookups
CREATE INDEX idx_experts_available ON experts(is_available) WHERE is_available = true;

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_league_profiles_updated_at
  BEFORE UPDATE ON league_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experts_updated_at
  BEFORE UPDATE ON experts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Helper function: is_admin()
-- Runs with SECURITY DEFINER so it bypasses RLS on user_roles
-- when checking admin status. This avoids infinite recursion
-- that occurs when an RLS policy on user_roles queries
-- user_roles directly (which re-triggers the same policy).
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Enable Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE experts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
-- Users can view their own role
CREATE POLICY "Users can view their own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
  ON user_roles FOR SELECT
  USING (is_admin());

-- Only admins can insert/update roles
CREATE POLICY "Admins can manage roles"
  ON user_roles FOR ALL
  USING (is_admin());

-- RLS Policies for league_profiles
-- Users can view their own league profiles
CREATE POLICY "Users can view their own league profiles"
  ON league_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own league profiles
CREATE POLICY "Users can create their own league profiles"
  ON league_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own league profiles
CREATE POLICY "Users can update their own league profiles"
  ON league_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own league profiles
CREATE POLICY "Users can delete their own league profiles"
  ON league_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all league profiles
CREATE POLICY "Admins can view all league profiles"
  ON league_profiles FOR SELECT
  USING (is_admin());

-- RLS Policies for experts
-- Everyone can view expert info (public directory)
CREATE POLICY "Anyone can view experts"
  ON experts FOR SELECT
  USING (true);

-- Only admins can manage experts
CREATE POLICY "Admins can manage experts"
  ON experts FOR ALL
  USING (is_admin());

-- Experts can update their own availability
CREATE POLICY "Experts can update their own availability"
  ON experts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
