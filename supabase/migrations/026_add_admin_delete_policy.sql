-- Migration 026: Add Admin Delete Policy for Submissions
-- Fixes RLS blocking admin deletions

-- Admins can delete all submissions
CREATE POLICY "Admins can delete all submissions"
  ON submissions FOR DELETE
  USING (is_admin());
