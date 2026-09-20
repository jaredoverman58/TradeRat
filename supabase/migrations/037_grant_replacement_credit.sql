-- Migration 037: Extend redeem_guarantee to grant replacement credit for remedy='credit'
-- When a user chooses 'credit' remedy, automatically grants 1 replacement credit
-- (same service_type and tier, expires in 1 year, no payment_intent or guarantee stamp)

CREATE OR REPLACE FUNCTION redeem_guarantee(
  p_submission_id UUID,
  p_user_id UUID,
  p_reason TEXT,
  p_remedy refund_remedy
)
RETURNS TABLE (
  out_id UUID,
  out_submission_id UUID,
  out_user_id UUID,
  out_reason TEXT,
  out_remedy refund_remedy,
  out_status TEXT,
  out_created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_refund_request refund_requests;
  v_service_type service_type;
  v_rate_tier rate_tier;
  v_bundle_type bundle_type;
BEGIN
  -- Insert refund request record
  INSERT INTO refund_requests (submission_id, user_id, reason, remedy, status)
  VALUES (p_submission_id, p_user_id, p_reason, p_remedy, 'completed')
  RETURNING * INTO v_refund_request;

  -- Grant replacement credit if remedy is 'credit'
  IF p_remedy = 'credit' THEN
    SELECT service_type, rate_tier INTO v_service_type, v_rate_tier
    FROM submissions
    WHERE id = p_submission_id;

    v_bundle_type := CASE
      WHEN v_rate_tier = 'standard' THEN 'standard_3_pack'
      WHEN v_rate_tier = 'rat_rate' THEN 'rat_rate_3_pack'
    END;

    INSERT INTO bundles (user_id, bundle_type, service_type, credits_remaining, purchased_at, expires_at, stripe_payment_intent_id, guarantee_purchase_number)
    VALUES (p_user_id, v_bundle_type, v_service_type, 1, NOW(), NOW() + INTERVAL '1 year', NULL, NULL);
  END IF;

  -- Mark user's guarantee as redeemed (one-time only)
  UPDATE users
  SET guarantee_redeemed_at = NOW()
  WHERE id = p_user_id;

  RETURN QUERY
  SELECT
    v_refund_request.id,
    v_refund_request.submission_id,
    v_refund_request.user_id,
    v_refund_request.reason,
    v_refund_request.remedy,
    v_refund_request.status,
    v_refund_request.created_at;
END;
$$;

-- Revoke public access to prevent users from calling this via supabase.rpc()
REVOKE EXECUTE ON FUNCTION redeem_guarantee(UUID, UUID, TEXT, refund_remedy) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION redeem_guarantee(UUID, UUID, TEXT, refund_remedy) FROM authenticated;
REVOKE EXECUTE ON FUNCTION redeem_guarantee(UUID, UUID, TEXT, refund_remedy) FROM anon;

-- Service role bypasses all permissions and can still execute this function
-- Only backend API routes (using service role key) can redeem guarantees

COMMENT ON FUNCTION redeem_guarantee IS
'Atomically redeems a user''s one-time money-back guarantee by inserting a refund_request and stamping users.guarantee_redeemed_at. When remedy is ''credit'', grants a free replacement credit (1 credit, same service_type and tier as original, expires in 1 year). Restricted to service role only.';
