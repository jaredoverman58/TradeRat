-- Migration 009: Add phone_number field for SMS notifications
-- Adds optional phone number field to user_roles table for Twilio SMS notifications

-- Add phone_number column to user_roles table
-- user_roles is the per-user table (one row per account) that extends auth.users
-- This is the correct table for user-specific data in this project

ALTER TABLE user_roles
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Add a check constraint to validate phone number format (basic validation)
-- Allows formats like: +1234567890, (123) 456-7890, 123-456-7890, etc.
-- This is a simple check - Twilio will do the real validation
ALTER TABLE user_roles
ADD CONSTRAINT user_roles_phone_number_format CHECK (
  phone_number IS NULL OR
  phone_number ~ '^\+?[0-9\s\-\(\)]+$'
);

-- Add index for phone number lookups (useful for admin features)
CREATE INDEX IF NOT EXISTS idx_user_roles_phone_number ON user_roles(phone_number)
  WHERE phone_number IS NOT NULL;

-- Update RLS policies to allow users to update their own phone number
-- Users should be able to view and update their own phone number
-- (The existing "Users can view their own role" policy should cover reading)

COMMENT ON COLUMN user_roles.phone_number IS
'Optional phone number for SMS notifications. Used by Twilio to send "response ready" alerts. Must be verified in Twilio trial accounts.';
