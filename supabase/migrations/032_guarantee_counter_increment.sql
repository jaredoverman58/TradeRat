-- Migration 032: Guarantee Counter Atomic Increment Function
-- Adds a race-condition-safe function to increment the guarantee counter

-- Function to atomically increment guarantee counter (caps at 100)
-- Returns the new count (1-100) if incremented, or NULL if already at cap
CREATE OR REPLACE FUNCTION increment_guarantee_counter()
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  -- Atomically increment if under cap, return new value
  UPDATE guarantee_counter
  SET count = count + 1, updated_at = NOW()
  WHERE id = 1 AND count < 100
  RETURNING count INTO new_count;

  -- new_count will be NULL if no row was updated (already at 100)
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revoke public access to prevent users from calling this via supabase.rpc()
REVOKE EXECUTE ON FUNCTION increment_guarantee_counter() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION increment_guarantee_counter() FROM authenticated;
REVOKE EXECUTE ON FUNCTION increment_guarantee_counter() FROM anon;

-- Service role bypasses all permissions and can still execute this function
-- Only backend webhooks and API routes (using service role key) can increment the counter

COMMENT ON FUNCTION increment_guarantee_counter() IS
'Atomically increments the guarantee counter from 0 to 100. Returns the new count (1-100) if successful, or NULL if counter is already at 100. Thread-safe for concurrent purchases. Restricted to service role only.';
