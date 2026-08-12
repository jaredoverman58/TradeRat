-- Migration 014: Fix Storage Bucket Policies for Expert Access
-- This migration fixes the storage policies to allow experts and admins to view submission files

-- ============================================
-- Ensure the bucket exists
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('trade-screenshots', 'trade-screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Drop existing restrictive policies
-- ============================================

-- Drop old user policies from migration 001
DROP POLICY IF EXISTS "Users can upload screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own screenshots" ON storage.objects;

-- ============================================
-- Create new comprehensive policies
-- ============================================

-- Policy 1: Users can upload screenshots to their own folder
-- Path format: {user_id}/{submission_id}/{filename}
CREATE POLICY "Users can upload their own submission screenshots"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'trade-screenshots'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Users can view their own submission screenshots
CREATE POLICY "Users can view their own submission screenshots"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'trade-screenshots'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Users can delete their own submission screenshots
CREATE POLICY "Users can delete their own submission screenshots"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'trade-screenshots'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Experts can view screenshots for submissions assigned to them
-- This checks if the expert_id in the submission matches an expert record owned by the current user
CREATE POLICY "Experts can view screenshots for assigned submissions"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'trade-screenshots'
  AND EXISTS (
    SELECT 1
    FROM submissions s
    INNER JOIN experts e ON s.expert_id = e.id
    WHERE s.id::text = (storage.foldername(name))[2]  -- submission_id is second folder in path
      AND e.user_id = auth.uid()
  )
);

-- Policy 5: Experts can view screenshots for submissions in the open queue
-- This allows experts to preview submissions before claiming them
CREATE POLICY "Experts can view screenshots for open queue submissions"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'trade-screenshots'
  AND EXISTS (
    SELECT 1
    FROM submissions s
    WHERE s.id::text = (storage.foldername(name))[2]
      AND s.status = 'submitted'
      AND s.expert_id IS NULL
  )
  AND EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = auth.uid()
      AND role = 'expert'
  )
);

-- Policy 6: Admins can view all screenshots
CREATE POLICY "Admins can view all submission screenshots"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'trade-screenshots'
  AND is_admin()
);

-- Policy 7: Admins can upload screenshots (for testing/support)
CREATE POLICY "Admins can upload submission screenshots"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'trade-screenshots'
  AND is_admin()
);

-- Policy 8: Admins can delete screenshots (for moderation/cleanup)
CREATE POLICY "Admins can delete submission screenshots"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'trade-screenshots'
  AND is_admin()
);

-- Policy 9: Admins can update screenshots (for moderation)
CREATE POLICY "Admins can update submission screenshots"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'trade-screenshots'
  AND is_admin()
);

-- ============================================
-- Notes:
-- ============================================
-- File path structure: {user_id}/{submission_id}/{timestamp}-{index}.{ext}
-- - (storage.foldername(name))[1] = user_id
-- - (storage.foldername(name))[2] = submission_id
--
-- Access control:
-- - Users: Can only access their own files (by user_id in path)
-- - Experts: Can access files for submissions assigned to them OR in open queue
-- - Admins: Can access all files
--
-- Bucket is private (public = false), so files are accessed via:
-- - Signed URLs (recommended for temporary access)
-- - Authenticated requests with proper RLS policies
