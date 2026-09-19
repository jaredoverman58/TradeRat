-- Migration 035: Atomic Guarantee Redemption Function
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
BEGIN
  INSERT INTO refund_requests (submission_id, user_id, reason, remedy, status)
  VALUES (p_submission_id, p_user_id, p_reason, p_remedy, 'completed')
  RETURNING * INTO v_refund_request;

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

REVOKE EXECUTE ON FUNCTION redeem_guarantee(UUID, UUID, TEXT, refund_remedy) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION redeem_guarantee(UUID, UUID, TEXT, refund_remedy) FROM authenticated;
REVOKE EXECUTE ON FUNCTION redeem_guarantee(UUID, UUID, TEXT, refund_remedy) FROM anon;

COMMENT ON FUNCTION redeem_guarantee IS
'Atomically redeems a user''s one-time money-back guarantee by inserting a refund_request and stamping users.guarantee_redeemed_at. Restricted to service role only.';
