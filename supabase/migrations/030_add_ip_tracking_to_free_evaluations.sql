-- Migration 030: Add IP tracking to free evaluations for rate limiting
-- Allows blocking abuse without requiring payment method

-- Add IP address column to free_evaluations table
ALTER TABLE free_evaluations
ADD COLUMN ip_address TEXT;

-- Add index for IP-based rate limit checks
CREATE INDEX idx_free_evaluations_ip_used_at ON free_evaluations(ip_address, activated_at)
  WHERE ip_address IS NOT NULL;

-- Add index for email-based rate limit checks (via user_id -> users.email)
CREATE INDEX idx_free_evaluations_activated_at ON free_evaluations(activated_at);

-- Function to check if IP or email has used free eval in last 360 days
CREATE OR REPLACE FUNCTION check_free_eval_rate_limit(
  p_user_id UUID,
  p_ip_address TEXT
)
RETURNS TABLE (
  is_blocked BOOLEAN,
  reason TEXT
) AS $$
DECLARE
  v_user_email TEXT;
  v_ip_used_recently BOOLEAN;
  v_email_used_recently BOOLEAN;
BEGIN
  -- Get user's email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = p_user_id;

  -- Check if this IP has used a free eval in last 360 days
  SELECT EXISTS (
    SELECT 1
    FROM free_evaluations
    WHERE ip_address = p_ip_address
      AND used = true
      AND activated_at > NOW() - INTERVAL '360 days'
  ) INTO v_ip_used_recently;

  -- Check if this email (user_id) has used a free eval in last 360 days
  SELECT EXISTS (
    SELECT 1
    FROM free_evaluations
    WHERE user_id = p_user_id
      AND used = true
      AND activated_at > NOW() - INTERVAL '360 days'
  ) INTO v_email_used_recently;

  -- Return blocked status and reason
  IF v_ip_used_recently THEN
    RETURN QUERY SELECT true, 'ip_address'::TEXT;
  ELSIF v_email_used_recently THEN
    RETURN QUERY SELECT true, 'email'::TEXT;
  ELSE
    RETURN QUERY SELECT false, NULL::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
