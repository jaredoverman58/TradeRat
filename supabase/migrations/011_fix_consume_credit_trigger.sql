-- Migration 011: Fix consume_credit_on_submission to remove the strict check
-- Allow submissions to be created even without credits (for debugging)

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
      -- Find an active bundle with credits that matches BOTH service_type AND rate_tier
      SELECT id INTO v_bundle_id
      FROM bundles
      WHERE user_id = NEW.user_id
        AND credits_remaining > 0
        AND expires_at > NOW()
        AND service_type = NEW.service_type  -- Must match service type
        AND (
          (NEW.rate_tier = 'standard' AND bundle_type IN ('standard_3_pack', 'standard_5_pack')) OR
          (NEW.rate_tier = 'rat_rate' AND bundle_type IN ('rat_rate_3_pack', 'rat_rate_5_pack'))
        )
      ORDER BY expires_at ASC
      LIMIT 1;

      IF v_bundle_id IS NOT NULL THEN
        -- Decrement bundle credits
        UPDATE bundles
        SET credits_remaining = credits_remaining - 1
        WHERE id = v_bundle_id;
      ELSE
        -- Just log a warning instead of throwing an exception
        RAISE WARNING 'No available credits for this submission (user: %, service: %, tier: %)',
          NEW.user_id, NEW.service_type, NEW.rate_tier;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
