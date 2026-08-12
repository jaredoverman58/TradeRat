-- Temporary debug version of consume_credit_on_submission with detailed logging
CREATE OR REPLACE FUNCTION consume_credit_on_submission()
RETURNS TRIGGER AS $$
DECLARE
  v_bundle_id UUID;
  v_free_eval_exists BOOLEAN;
BEGIN
  RAISE NOTICE 'TRIGGER START: TG_OP=%, OLD.status=%, NEW.status=%', TG_OP, OLD.status, NEW.status;

  -- Only consume credit when status changes from 'draft' to 'submitted'
  IF (TG_OP = 'UPDATE' AND OLD.status = 'draft' AND NEW.status = 'submitted') OR
     (TG_OP = 'INSERT' AND NEW.status = 'submitted') THEN

    RAISE NOTICE 'Checking free evaluations for user %', NEW.user_id;

    -- Check if user has unused free evaluation
    SELECT EXISTS (
      SELECT 1 FROM free_evaluations
      WHERE user_id = NEW.user_id
        AND used = false
        AND (expires_at IS NULL OR expires_at > NOW())
    ) INTO v_free_eval_exists;

    RAISE NOTICE 'Free eval exists: %', v_free_eval_exists;

    IF v_free_eval_exists THEN
      RAISE NOTICE 'Using free evaluation';
      -- Mark free evaluation as used
      UPDATE free_evaluations
      SET used = true
      WHERE user_id = NEW.user_id AND used = false;
    ELSE
      RAISE NOTICE 'Looking for bundle - service_type: %, rate_tier: %', NEW.service_type, NEW.rate_tier;

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

      RAISE NOTICE 'Found bundle ID: %', v_bundle_id;

      IF v_bundle_id IS NULL THEN
        RAISE EXCEPTION 'No available credits for this submission (service: %, tier: %)', NEW.service_type, NEW.rate_tier;
      END IF;

      RAISE NOTICE 'Decrementing credits for bundle %', v_bundle_id;

      -- Decrement bundle credits
      UPDATE bundles
      SET credits_remaining = credits_remaining - 1
      WHERE id = v_bundle_id;

      RAISE NOTICE 'Credits decremented successfully';
    END IF;
  END IF;

  RAISE NOTICE 'TRIGGER END - returning NEW';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
