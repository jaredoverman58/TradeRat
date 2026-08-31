-- Migration 028: Allow users to update their own onboarding_completed field
-- Fixes infinite redirect loop bug where users couldn't complete onboarding
-- because RLS policy blocked them from updating their own user_roles row

-- Add a new policy that allows users to update their own row,
-- but only if the 'role' column remains unchanged
CREATE POLICY "Users can update their own onboarding status"
  ON user_roles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND role = (SELECT role FROM user_roles WHERE user_id = auth.uid())
  );

-- Comment explaining the policy
COMMENT ON POLICY "Users can update their own onboarding status" ON user_roles IS
'Allows users to update their own row (e.g., onboarding_completed) but prevents them from changing their role field. The WITH CHECK clause verifies that the new role value matches the current role value via subquery.';
