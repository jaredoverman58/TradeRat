-- Migration 016: Fix Storage Policies to Use submission_files Table
--
-- PROBLEM: Previous policies parsed submission_id from path structure, but actual
-- upload code uses random draftId, not submission_id. This broke expert/open queue access.
--
-- SOLUTION: Join against submission_files table to map file_url (actual path with draftId)
-- to submission_id, instead of parsing path structure.
--
-- This allows existing files with draftId paths to work without moving files.

-- ============================================
-- Drop old broken policies that parsed paths
-- ============================================

DROP POLICY IF EXISTS "Experts can view screenshots for assigned submissions" ON storage.objects;
DROP POLICY IF EXISTS "Experts can view screenshots for open queue submissions" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own submission screenshots" ON storage.objects;

-- ============================================
-- Create new policies using submission_files
-- ============================================

-- Policy 2 (Updated): Users can view their own submission screenshots
-- Allows access via submission_files OR folder prefix (for draft files not yet submitted)
CREATE POLICY "Users can view their own submission screenshots"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'trade-screenshots'
  AND (
    -- Option 1: Via submission_files (for submitted files)
    EXISTS (
      SELECT 1
      FROM submission_files sf
      INNER JOIN submissions s ON sf.submission_id = s.id
      WHERE sf.file_url = storage.objects.name
        AND s.user_id = auth.uid()
    )
    OR
    -- Option 2: Via folder prefix (for draft files uploaded but not yet submitted)
    (auth.uid()::text = (storage.foldername(storage.objects.name))[1])
  )
);

-- Policy 4 (Updated): Experts can view screenshots for submissions assigned to them
-- Maps storage path to submission via submission_files.file_url
CREATE POLICY "Experts can view screenshots for assigned submissions"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'trade-screenshots'
  AND EXISTS (
    SELECT 1
    FROM submission_files sf
    INNER JOIN submissions s ON sf.submission_id = s.id
    INNER JOIN experts e ON s.expert_id = e.id
    WHERE sf.file_url = storage.objects.name  -- Match full path (userId/draftId/file.jpg)
      AND e.user_id = auth.uid()              -- Expert owns this submission
  )
);

-- Policy 5 (Updated): Experts can view screenshots for submissions in open queue
-- Maps storage path to submission via submission_files.file_url
CREATE POLICY "Experts can view screenshots for open queue submissions"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'trade-screenshots'
  AND EXISTS (
    SELECT 1
    FROM submission_files sf
    INNER JOIN submissions s ON sf.submission_id = s.id
    WHERE sf.file_url = storage.objects.name  -- Match full path
      AND s.status = 'submitted'
      AND s.expert_id IS NULL                  -- Unclaimed
  )
  AND EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = auth.uid()
      AND role = 'expert'
  )
);

-- ============================================
-- Notes:
-- ============================================
-- File path structure (actual): {user_id}/{draft_id}/{timestamp}-{index}.{ext}
-- - draft_id is a random UUID generated on page load (crypto.randomUUID())
-- - NOT the same as submission_id
--
-- submission_files table maps:
-- - file_url (plain path like "userId/draftId/file.jpg")
-- - submission_id (links to submissions table)
--
-- Access control:
-- - Users: Can view files via submission ownership OR folder prefix (for drafts)
-- - Experts: Can view files via submission_files mapping for assigned/open submissions
-- - Admins: Can view all files (Policy 6 from migration 014, unchanged)
--
-- This migration does NOT require moving any files.
-- All existing files with draftId paths will work immediately.
