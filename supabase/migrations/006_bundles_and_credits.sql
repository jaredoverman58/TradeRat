-- Migration 006: Bundles and Free Evaluations
-- Creates tables for credit bundles and free evaluation tracking

-- Bundles table
CREATE TABLE bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bundle_type bundle_type NOT NULL,
  credits_remaining INTEGER NOT NULL CHECK (credits_remaining >= 0),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraint: expires_at must be after purchased_at
  CONSTRAINT expires_after_purchase CHECK (expires_at > purchased_at)
);

-- Indexes for bundle lookups
CREATE INDEX idx_bundles_user_id ON bundles(user_id);
CREATE INDEX idx_bundles_expires_at ON bundles(expires_at);
CREATE INDEX idx_bundles_active ON bundles(user_id, expires_at)
  WHERE credits_remaining > 0 AND expires_at > NOW();

-- Free evaluations table
CREATE TABLE free_evaluations (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  used BOOLEAN NOT NULL DEFAULT false,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  -- Constraint: expires_at must be after activated_at if set
  CONSTRAINT expires_after_activation CHECK (
    expires_at IS NULL OR expires_at > activated_at
  )
);

-- Index for checking active free evaluations
CREATE INDEX idx_free_evaluations_active ON free_evaluations(user_id)
  WHERE used = false AND (expires_at IS NULL OR expires_at > NOW());

-- Enable Row Level Security
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_evaluations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bundles
-- Users can view their own bundles
CREATE POLICY "Users can view their own bundles"
  ON bundles FOR SELECT
  USING (auth.uid() = user_id);

-- Only admins can create bundles (via Stripe webhook or manual grant)
CREATE POLICY "Admins can create bundles"
  ON bundles FOR INSERT
  WITH CHECK (is_admin());

-- Only admins can update bundles (to adjust credits)
CREATE POLICY "Admins can update bundles"
  ON bundles FOR UPDATE
  USING (is_admin());

-- Admins can view all bundles
CREATE POLICY "Admins can view all bundles"
  ON bundles FOR SELECT
  USING (is_admin());

-- RLS Policies for free_evaluations
-- Users can view their own free evaluation status
CREATE POLICY "Users can view their own free evaluation"
  ON free_evaluations FOR SELECT
  USING (auth.uid() = user_id);

-- Free evaluations are created automatically on signup (via trigger or function)
CREATE POLICY "System can create free evaluations"
  ON free_evaluations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only admins can update free evaluation status
CREATE POLICY "Admins can update free evaluations"
  ON free_evaluations FOR UPDATE
  USING (is_admin());

-- Admins can view all free evaluations
CREATE POLICY "Admins can view all free evaluations"
  ON free_evaluations FOR SELECT
  USING (is_admin());

-- Function to automatically create free evaluation on user signup
CREATE OR REPLACE FUNCTION create_free_evaluation_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO free_evaluations (user_id, used, activated_at)
  VALUES (NEW.id, false, NOW());

  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create free evaluation on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_free_evaluation_for_new_user();

-- ============================================================
-- Function to consume a credit when submission is created
-- Marked SECURITY DEFINER because this function must update
-- `bundles` and `free_evaluations` on behalf of a regular user,
-- and neither table has a "users can update their own rows"
-- RLS policy (only admins can UPDATE those tables directly).
-- Without SECURITY DEFINER, this trigger would be blocked by
-- RLS whenever a normal (non-admin) user submits an evaluation.
-- SET search_path pins the function's search path to avoid a
-- known SECURITY DEFINER search-path hijacking risk.
-- ============================================================
CREATE OR REPLACE FUNCTION consume_credit_on_submission()
RETURNS TRIGGER AS $$
DECLARE
  v_bundle_id UUID;
  v_free_eval_exists BOOLEAN;
BEGIN
  -- Only consume credit when status changes from 'draft' to 'submitted'
  IF (TG_OP = 'UPDATE' AND OLD.status = 'draft' AND NEW.status = 'submitted') OR
     (TG_OP = 'INSERT' AND NEW.status = 'submitted') THEN

    -- Check if user has unused free evaluation
    SELECT EXISTS (
      SELECT 1 FROM free_evaluations
      WHERE user_id = NEW.user_id
        AND used = false
        AND (expires_at IS NULL OR expires_at > NOW())
    ) INTO v_free_eval_exists;

    IF v_free_eval_exists THEN
      -- Mark free evaluation as used
      UPDATE free_evaluations
      SET used = true
      WHERE user_id = NEW.user_id AND used = false;
    ELSE
      -- Find an active bundle with credits
      SELECT id INTO v_bundle_id
      FROM bundles
      WHERE user_id = NEW.user_id
        AND credits_remaining > 0
        AND expires_at > NOW()
        AND (
          (NEW.rate_tier = 'standard' AND bundle_type IN ('standard_3_pack', 'standard_5_pack')) OR
          (NEW.rate_tier = 'rat_rate' AND bundle_type IN ('rat_rate_3_pack', 'rat_rate_5_pack'))
        )
      ORDER BY expires_at ASC
      LIMIT 1;

      IF v_bundle_id IS NULL THEN
        RAISE EXCEPTION 'No available credits for this submission';
      END IF;

      -- Decrement bundle credits
      UPDATE bundles
      SET credits_remaining = credits_remaining - 1
      WHERE id = v_bundle_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to consume credit on submission
CREATE TRIGGER consume_credit_trigger
  BEFORE INSERT OR UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION consume_credit_on_submission();