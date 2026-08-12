-- Migration 015: Create Expert Audio Storage Bucket
-- Creates a storage bucket for expert audio recordings with appropriate policies

-- ============================================
-- Create the bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('expert-audio', 'expert-audio', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Storage Policies for expert-audio bucket
-- ============================================

-- Policy 1: Experts can upload audio to their own folder
-- Path format: {expert_id}/{submission_id}/{timestamp}.{ext}
CREATE POLICY "Experts can upload their own audio recordings"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'expert-audio'
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM experts WHERE user_id = auth.uid()
  )
);

-- Policy 2: Experts can view their own audio recordings
CREATE POLICY "Experts can view their own audio recordings"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'expert-audio'
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM experts WHERE user_id = auth.uid()
  )
);

-- Policy 3: Users can view audio from responses to their submissions
CREATE POLICY "Users can view audio from their submission responses"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'expert-audio'
  AND EXISTS (
    SELECT 1
    FROM responses r
    INNER JOIN submissions s ON r.submission_id = s.id
    WHERE (storage.foldername(name))[2]::uuid = s.id
      AND s.user_id = auth.uid()
  )
);

-- Policy 4: Admins can view all audio
CREATE POLICY "Admins can view all expert audio"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'expert-audio'
  AND is_admin()
);

-- Policy 5: Admins can delete audio (for moderation)
CREATE POLICY "Admins can delete expert audio"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'expert-audio'
  AND is_admin()
);

-- ============================================
-- Notes:
-- ============================================
-- File path structure: {expert_id}/{submission_id}/{timestamp}.{ext}
-- - (storage.foldername(name))[1] = expert_id
-- - (storage.foldername(name))[2] = submission_id
--
-- Access control:
-- - Experts: Can upload and view their own audio
-- - Users: Can view audio from responses to their own submissions
-- - Admins: Can view and delete all audio
--
-- Bucket is private (public = false), so files are accessed via:
-- - Signed URLs (recommended for temporary access)
