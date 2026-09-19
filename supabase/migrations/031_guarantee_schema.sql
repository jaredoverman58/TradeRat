-- Migration 031: Money-Back Guarantee Schema (Phase 7a)
-- Adds guarantee tracking infrastructure (counter, eligibility stamps, refund log)

-- Create enum for refund remedy type
CREATE TYPE refund_remedy AS ENUM ('refund', 'credit');

-- Guarantee counter table (single-row table tracking eligible purchase count)
CREATE TABLE guarantee_counter (
  id INTEGER PRIMARY KEY DEFAULT 1,
  count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Enforce single row (only id = 1 allowed)
  CONSTRAINT single_row_only CHECK (id = 1)
);

-- Initialize the single counter row
INSERT INTO guarantee_counter (id, count) VALUES (1, 0);

-- Index for updated_at (optional, for audit/monitoring)
CREATE INDEX idx_guarantee_counter_updated_at ON guarantee_counter(updated_at);

-- Add guarantee_purchase_number to bundles table
-- Null = not guarantee-eligible, 1-100 = this was the Nth qualifying purchase
ALTER TABLE bundles
  ADD COLUMN guarantee_purchase_number INTEGER CHECK (
    guarantee_purchase_number IS NULL OR
    (guarantee_purchase_number >= 1 AND guarantee_purchase_number <= 100)
  );

-- Index for guarantee-eligible bundles
CREATE INDEX idx_bundles_guarantee_eligible ON bundles(guarantee_purchase_number)
  WHERE guarantee_purchase_number IS NOT NULL;

-- Add guarantee_redeemed_at to users table
-- Null = customer hasn't used their one-time guarantee redemption yet
ALTER TABLE users
  ADD COLUMN guarantee_redeemed_at TIMESTAMPTZ;

-- Index for tracking who has redeemed (optional, for admin queries)
CREATE INDEX idx_users_guarantee_redeemed ON users(guarantee_redeemed_at)
  WHERE guarantee_redeemed_at IS NOT NULL;

-- Refund requests table (log of guarantee redemptions)
CREATE TABLE refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  remedy refund_remedy NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for refund_requests
CREATE INDEX idx_refund_requests_user_id ON refund_requests(user_id);
CREATE INDEX idx_refund_requests_created_at ON refund_requests(created_at DESC);
CREATE INDEX idx_refund_requests_status ON refund_requests(status);

-- Enable Row Level Security
ALTER TABLE guarantee_counter ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for guarantee_counter
-- Anyone authenticated can read the counter (to check if guarantee is still available)
CREATE POLICY "Authenticated users can read guarantee counter"
  ON guarantee_counter FOR SELECT
  USING (auth.role() = 'authenticated');

-- Note: No UPDATE/INSERT/DELETE policies for guarantee_counter.
-- Service role (webhooks, API routes) bypasses RLS and can update the counter.
-- Regular users and admins have read-only access via the SELECT policy above.

-- RLS Policies for refund_requests
-- Users can view their own refund requests
CREATE POLICY "Users can view their own refund requests"
  ON refund_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own refund requests
CREATE POLICY "Users can create their own refund requests"
  ON refund_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all refund requests
CREATE POLICY "Admins can view all refund requests"
  ON refund_requests FOR SELECT
  USING (is_admin());

-- Admins can update refund requests (to change status if needed)
CREATE POLICY "Admins can update refund requests"
  ON refund_requests FOR UPDATE
  USING (is_admin());

-- Admins can delete refund requests (cleanup/corrections)
CREATE POLICY "Admins can delete refund requests"
  ON refund_requests FOR DELETE
  USING (is_admin());

-- Comments for documentation
COMMENT ON TABLE guarantee_counter IS
'Single-row table tracking how many qualifying purchases have been stamped as guarantee-eligible. Caps at 100 (enforced in application logic, not schema).';

COMMENT ON COLUMN bundles.guarantee_purchase_number IS
'NULL = not guarantee-eligible. Integer 1-100 = this bundle was the Nth qualifying purchase eligible for money-back guarantee.';

COMMENT ON COLUMN users.guarantee_redeemed_at IS
'Timestamp when user redeemed their one-time money-back guarantee. NULL = not yet redeemed.';

COMMENT ON TABLE refund_requests IS
'Log of guarantee redemptions and refund requests. No approval gate — status defaults to "completed" since requests are auto-processed. UNIQUE constraint on submission_id prevents duplicate refund requests.';
