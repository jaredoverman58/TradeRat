-- Migration 012: Add Ratings System
-- Allows users to rate expert responses with thumbs up/down and optional feedback

CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  expert_id UUID NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thumbs_up BOOLEAN NOT NULL,
  feedback_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraint: One rating per submission
  CONSTRAINT one_rating_per_submission UNIQUE (submission_id)
);

-- Index for looking up ratings by submission
CREATE INDEX idx_ratings_submission_id ON ratings(submission_id);

-- Index for expert performance queries
CREATE INDEX idx_ratings_expert_id ON ratings(expert_id);

-- Index for user rating history
CREATE INDEX idx_ratings_user_id ON ratings(user_id);

-- Enable Row Level Security
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ratings

-- Users can view their own ratings
CREATE POLICY "Users can view their own ratings"
  ON ratings FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create ratings for their own completed submissions
CREATE POLICY "Users can create ratings for their own submissions"
  ON ratings FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM submissions
      WHERE submissions.id = submission_id
        AND submissions.user_id = auth.uid()
        AND submissions.status = 'completed'
    )
  );

-- Users cannot update ratings (ratings are immutable once created)
-- Users cannot delete ratings (ratings are permanent)

-- Admins can view all ratings
CREATE POLICY "Admins can view all ratings"
  ON ratings FOR SELECT
  USING (is_admin());

-- Experts can view ratings for their own submissions
CREATE POLICY "Experts can view their own ratings"
  ON ratings FOR SELECT
  USING (
    expert_id IN (
      SELECT id FROM experts WHERE user_id = auth.uid()
    )
  );

-- Add comment
COMMENT ON TABLE ratings IS 'User ratings for completed expert responses. Each submission can only be rated once.';
COMMENT ON COLUMN ratings.thumbs_up IS 'True = thumbs up, False = thumbs down';
COMMENT ON COLUMN ratings.feedback_text IS 'Optional user feedback text';
