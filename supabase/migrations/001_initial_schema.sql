-- Trade Rat Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE package_type AS ENUM (
  'free',
  'single',
  'single_premium',
  'bronze',
  'silver',
  'gold',
  'platinum'
);

CREATE TYPE expert_tier AS ENUM ('any', 'rat_guaranteed');

CREATE TYPE expert AS ENUM ('rat', 'badger', 'monkey');

CREATE TYPE request_status AS ENUM ('pending', 'assigned', 'completed', 'refunded');

CREATE TYPE recommendation AS ENUM ('accept', 'decline', 'counter');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stripe_customer_id TEXT
);

-- Packages table
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_type package_type NOT NULL,
  credits_purchased INTEGER NOT NULL,
  credits_remaining INTEGER NOT NULL,
  expert_tier expert_tier NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  stripe_payment_id TEXT NOT NULL
);

CREATE INDEX idx_packages_user_id ON packages(user_id);
CREATE INDEX idx_packages_expires_at ON packages(expires_at);

-- Trade requests table
CREATE TABLE trade_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  status request_status DEFAULT 'pending',
  assigned_expert expert,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  screenshot_urls TEXT[] NOT NULL,
  league_rules JSONB NOT NULL,
  user_notes TEXT
);

CREATE INDEX idx_trade_requests_user_id ON trade_requests(user_id);
CREATE INDEX idx_trade_requests_status ON trade_requests(status);
CREATE INDEX idx_trade_requests_assigned_expert ON trade_requests(assigned_expert);

-- Trade advice table
CREATE TABLE trade_advice (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_request_id UUID NOT NULL REFERENCES trade_requests(id) ON DELETE CASCADE,
  expert expert NOT NULL,
  proposed_trade TEXT NOT NULL,
  recommendation recommendation NOT NULL,
  analysis TEXT NOT NULL,
  audio_url TEXT,
  counter_offer TEXT,
  roster_impact TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_trade_advice_request_id ON trade_advice(trade_request_id);

-- Expert availability table
CREATE TABLE expert_availability (
  expert expert PRIMARY KEY,
  is_available BOOLEAN DEFAULT true,
  current_queue_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default expert availability
INSERT INTO expert_availability (expert) VALUES ('rat'), ('badger'), ('monkey');

-- Create storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('trade-screenshots', 'trade-screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_advice ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_availability ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Packages table policies
CREATE POLICY "Users can read own packages" ON packages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own packages" ON packages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trade requests table policies
CREATE POLICY "Users can read own requests" ON trade_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create requests" ON trade_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own requests" ON trade_requests
  FOR UPDATE USING (auth.uid() = user_id);

-- Trade advice table policies
CREATE POLICY "Users can read own advice" ON trade_advice
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trade_requests
      WHERE trade_requests.id = trade_advice.trade_request_id
      AND trade_requests.user_id = auth.uid()
    )
  );

-- Expert availability is public (read-only for users)
CREATE POLICY "Anyone can read expert availability" ON expert_availability
  FOR SELECT USING (true);

-- ============================================
-- Storage Policies
-- ============================================

-- Users can upload screenshots to their own folder
CREATE POLICY "Users can upload screenshots" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'trade-screenshots'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can read their own screenshots
CREATE POLICY "Users can read own screenshots" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'trade-screenshots'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own screenshots
CREATE POLICY "Users can delete own screenshots" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'trade-screenshots'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- Functions and Triggers
-- ============================================

-- Function to automatically create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user record on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update expert queue count
CREATE OR REPLACE FUNCTION public.update_expert_queue_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.assigned_expert IS NOT NULL THEN
    UPDATE expert_availability
    SET current_queue_count = current_queue_count + 1,
        updated_at = NOW()
    WHERE expert = NEW.assigned_expert;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Decrease count for old expert
    IF OLD.assigned_expert IS NOT NULL AND (NEW.assigned_expert IS NULL OR NEW.assigned_expert != OLD.assigned_expert) THEN
      UPDATE expert_availability
      SET current_queue_count = GREATEST(current_queue_count - 1, 0),
          updated_at = NOW()
      WHERE expert = OLD.assigned_expert;
    END IF;
    -- Increase count for new expert
    IF NEW.assigned_expert IS NOT NULL AND (OLD.assigned_expert IS NULL OR NEW.assigned_expert != OLD.assigned_expert) THEN
      UPDATE expert_availability
      SET current_queue_count = current_queue_count + 1,
          updated_at = NOW()
      WHERE expert = NEW.assigned_expert;
    END IF;
    -- Decrease count when request is completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.assigned_expert IS NOT NULL THEN
      UPDATE expert_availability
      SET current_queue_count = GREATEST(current_queue_count - 1, 0),
          updated_at = NOW()
      WHERE expert = NEW.assigned_expert;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update expert queue count
DROP TRIGGER IF EXISTS on_trade_request_change ON trade_requests;
CREATE TRIGGER on_trade_request_change
  AFTER INSERT OR UPDATE ON trade_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_expert_queue_count();

-- Function to decrement package credits
CREATE OR REPLACE FUNCTION public.decrement_package_credits()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.package_id IS NOT NULL THEN
    UPDATE packages
    SET credits_remaining = credits_remaining - 1
    WHERE id = NEW.package_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to decrement credits when trade request is created
DROP TRIGGER IF EXISTS on_trade_request_created ON trade_requests;
CREATE TRIGGER on_trade_request_created
  AFTER INSERT ON trade_requests
  FOR EACH ROW EXECUTE FUNCTION public.decrement_package_credits();
