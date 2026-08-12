-- Migration 007: Audit Log
-- Creates audit logging table for tracking important actions

-- Audit log table
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for audit log queries
CREATE INDEX idx_audit_log_submission_id ON audit_log(submission_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

-- Enable Row Level Security
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_log
-- Users can view audit logs for their own submissions
CREATE POLICY "Users can view audit logs for their own submissions"
  ON audit_log FOR SELECT
  USING (
    submission_id IN (
      SELECT id FROM submissions WHERE user_id = auth.uid()
    ) OR
    user_id = auth.uid()
  );

-- Experts can view audit logs for their assigned submissions
CREATE POLICY "Experts can view audit logs for their assigned submissions"
  ON audit_log FOR SELECT
  USING (
    submission_id IN (
      SELECT id FROM submissions
      WHERE expert_id IN (
        SELECT id FROM experts WHERE user_id = auth.uid()
      )
    )
  );

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
  ON audit_log FOR SELECT
  USING (is_admin());

-- System can insert audit logs (via triggers)
CREATE POLICY "System can insert audit logs"
  ON audit_log FOR INSERT
  WITH CHECK (true);

-- Function to log submission status changes
CREATE OR REPLACE FUNCTION log_submission_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO audit_log (submission_id, user_id, action, details)
    VALUES (
      NEW.id,
      auth.uid(),
      'submission_status_changed',
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'expert_id', NEW.expert_id
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for logging submission status changes
CREATE TRIGGER log_submission_status_trigger
  AFTER UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION log_submission_status_change();

-- Function to log expert claims
CREATE OR REPLACE FUNCTION log_expert_claim()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.expert_id IS NULL AND NEW.expert_id IS NOT NULL THEN
    INSERT INTO audit_log (submission_id, user_id, action, details)
    VALUES (
      NEW.id,
      auth.uid(),
      'submission_claimed',
      jsonb_build_object(
        'expert_id', NEW.expert_id,
        'rate_tier', NEW.rate_tier
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for logging expert claims
CREATE TRIGGER log_expert_claim_trigger
  AFTER UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION log_expert_claim();

-- Function to log response creation
CREATE OR REPLACE FUNCTION log_response_sent()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (submission_id, user_id, action, details)
    VALUES (
      NEW.submission_id,
      auth.uid(),
      'response_sent',
      jsonb_build_object(
        'response_id', NEW.id,
        'expert_id', NEW.expert_id,
        'has_audio', NEW.audio_url IS NOT NULL
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for logging response creation
CREATE TRIGGER log_response_sent_trigger
  AFTER INSERT ON responses
  FOR EACH ROW
  EXECUTE FUNCTION log_response_sent();

-- Function to log response recall
CREATE OR REPLACE FUNCTION log_response_recall()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.recalled_at IS NULL AND NEW.recalled_at IS NOT NULL THEN
    INSERT INTO audit_log (submission_id, user_id, action, details)
    VALUES (
      NEW.submission_id,
      auth.uid(),
      'response_recalled',
      jsonb_build_object(
        'response_id', NEW.id,
        'expert_id', NEW.expert_id
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for logging response recalls
CREATE TRIGGER log_response_recall_trigger
  AFTER UPDATE ON responses
  FOR EACH ROW
  EXECUTE FUNCTION log_response_recall();

-- Function to log bundle purchases
CREATE OR REPLACE FUNCTION log_bundle_purchase()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (submission_id, user_id, action, details)
    VALUES (
      NULL,
      NEW.user_id,
      'bundle_purchased',
      jsonb_build_object(
        'bundle_id', NEW.id,
        'bundle_type', NEW.bundle_type,
        'credits_remaining', NEW.credits_remaining
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for logging bundle purchases
CREATE TRIGGER log_bundle_purchase_trigger
  AFTER INSERT ON bundles
  FOR EACH ROW
  EXECUTE FUNCTION log_bundle_purchase();

-- Function to log credit consumption
CREATE OR REPLACE FUNCTION log_credit_consumption()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.credits_remaining > NEW.credits_remaining THEN
    INSERT INTO audit_log (submission_id, user_id, action, details)
    VALUES (
      NULL,
      NEW.user_id,
      'credit_consumed',
      jsonb_build_object(
        'bundle_id', NEW.id,
        'bundle_type', NEW.bundle_type,
        'credits_before', OLD.credits_remaining,
        'credits_after', NEW.credits_remaining
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for logging credit consumption
CREATE TRIGGER log_credit_consumption_trigger
  AFTER UPDATE ON bundles
  FOR EACH ROW
  EXECUTE FUNCTION log_credit_consumption();