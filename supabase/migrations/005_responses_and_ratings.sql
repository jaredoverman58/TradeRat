-- Migration 005: Responses and Ratings
-- Creates tables for expert responses and user feedback

-- Responses table
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  expert_id UUID NOT NULL REFERENCES experts(id) ON DELETE RESTRICT,
  written_content TEXT NOT NULL,
  audio_url TEXT,
  audio_transcript TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recalled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partial unique index for active responses
-- This is the actual enforcement of "only one active (non-recalled) response per submission".
-- A table-level UNIQUE(submission_id, recalled_at) constraint does NOT work for this purpose,
-- since Postgres treats every NULL as distinct in a UNIQUE constraint, so it would not
-- block multiple active (recalled_at IS NULL) rows. This partial index is the correct approach.
CREATE UNIQUE INDEX idx_responses_active_per_submission
  ON responses(submission_id)
  WHERE recalled_at IS NULL;

-- Index for expert lookups
CREATE INDEX idx_responses_expert_id ON responses(expert_id);
CREATE INDEX idx_responses_sent_at ON responses(sent_at DESC);

-- Ratings table
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
  thumbs_up BOOLEAN NOT NULL,
  written_feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for rating analytics
CREATE INDEX idx_ratings_thumbs_up ON ratings(thumbs_up);
CREATE INDEX idx_ratings_created_at ON ratings(created_at DESC);

-- Enable Row Level Security
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for responses
-- Users can view responses to their own submissions
CREATE POLICY "Users can view responses to their own submissions"
  ON responses FOR SELECT
  USING (
    submission_id IN (
      SELECT id FROM submissions WHERE user_id = auth.uid()
    )
  );

-- Experts can view their own responses
CREATE POLICY "Experts can view their own responses"
  ON responses FOR SELECT
  USING (
    expert_id IN (
      SELECT id FROM experts WHERE user_id = auth.uid()
    )
  );

-- Experts can create responses for their assigned submissions
CREATE POLICY "Experts can create responses for their assigned submissions"
  ON responses FOR INSERT
  WITH CHECK (
    expert_id IN (
      SELECT id FROM experts WHERE user_id = auth.uid()
    ) AND
    submission_id IN (
      SELECT id FROM submissions
      WHERE expert_id IN (
        SELECT id FROM experts WHERE user_id = auth.uid()
      )
    )
  );

-- Experts can update their own responses (before sending or to recall)
CREATE POLICY "Experts can update their own responses"
  ON responses FOR UPDATE
  USING (
    expert_id IN (
      SELECT id FROM experts WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    expert_id IN (
      SELECT id FROM experts WHERE user_id = auth.uid()
    )
  );

-- Admins can view all responses
CREATE POLICY "Admins can view all responses"
  ON responses FOR SELECT
  USING (is_admin());

-- Admins can manage all responses
CREATE POLICY "Admins can manage all responses"
  ON responses FOR ALL
  USING (is_admin());

-- RLS Policies for ratings
-- Users can view their own ratings
CREATE POLICY "Users can view their own ratings"
  ON ratings FOR SELECT
  USING (
    submission_id IN (
      SELECT id FROM submissions WHERE user_id = auth.uid()
    )
  );

-- Users can create ratings for their own submissions
CREATE POLICY "Users can create ratings for their own submissions"
  ON ratings FOR INSERT
  WITH CHECK (
    submission_id IN (
      SELECT id FROM submissions WHERE user_id = auth.uid()
    )
  );

-- Users can update their own ratings
CREATE POLICY "Users can update their own ratings"
  ON ratings FOR UPDATE
  USING (
    submission_id IN (
      SELECT id FROM submissions WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    submission_id IN (
      SELECT id FROM submissions WHERE user_id = auth.uid()
    )
  );

-- Users can delete their own ratings
CREATE POLICY "Users can delete their own ratings"
  ON ratings FOR DELETE
  USING (
    submission_id IN (
      SELECT id FROM submissions WHERE user_id = auth.uid()
    )
  );

-- Experts can view ratings for their responses
CREATE POLICY "Experts can view ratings for their responses"
  ON ratings FOR SELECT
  USING (
    submission_id IN (
      SELECT submission_id FROM responses
      WHERE expert_id IN (
        SELECT id FROM experts WHERE user_id = auth.uid()
      )
    )
  );

-- Admins can view all ratings
CREATE POLICY "Admins can view all ratings"
  ON ratings FOR SELECT
  USING (is_admin());

-- Admins can manage all ratings
CREATE POLICY "Admins can manage all ratings"
  ON ratings FOR ALL
  USING (is_admin());