-- Migration 019: Onboarding Tracking
-- Adds fields to track user onboarding completion and admin-controlled video visibility

-- Add onboarding fields to user_roles table
ALTER TABLE user_roles
ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN onboarding_video_enabled BOOLEAN NOT NULL DEFAULT false;

-- Create index for faster onboarding status lookups
CREATE INDEX idx_user_roles_onboarding ON user_roles(onboarding_completed);

-- Mark all existing users as having completed onboarding
-- (They're already using the app, no need to show them the flow)
UPDATE user_roles SET onboarding_completed = true;

COMMENT ON COLUMN user_roles.onboarding_completed IS 'Whether user has completed the 3-step onboarding flow';
COMMENT ON COLUMN user_roles.onboarding_video_enabled IS 'Admin toggle: show welcome video in Step 1 of onboarding';
