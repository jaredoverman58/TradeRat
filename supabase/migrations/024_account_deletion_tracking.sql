-- Migration 024: Add account deletion tracking
-- Adds deletion_requested_at column to track 30-day deletion grace period

-- Add deletion_requested_at column to user_roles table
ALTER TABLE user_roles
ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ;

-- Add index for finding accounts pending deletion
CREATE INDEX IF NOT EXISTS idx_user_roles_deletion_requested
  ON user_roles(deletion_requested_at)
  WHERE deletion_requested_at IS NOT NULL;

-- Add comment to document the column's purpose
COMMENT ON COLUMN user_roles.deletion_requested_at IS
  'Timestamp when user requested account deletion. Account will be permanently deleted 30 days after this date unless user logs back in and cancels.';
