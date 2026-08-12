-- Migration 004: Submissions and Submission Files
-- Creates tables for trade evaluation submissions and file uploads

-- Submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  league_profile_id UUID REFERENCES league_profiles(id) ON DELETE SET NULL,
  service_type service_type NOT NULL,
  offer_direction offer_direction,
  rate_tier rate_tier NOT NULL,
  status submission_status NOT NULL DEFAULT 'draft',
  expert_id UUID REFERENCES experts(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,
  deadline_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  receive_players TEXT,
  give_players TEXT,
  receive_picks TEXT,
  give_picks TEXT,
  fab_receive NUMERIC(10, 2),
  fab_give NUMERIC(10, 2),
  additional_context TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT offer_direction_required_except_trade_finder
    CHECK (
      (service_type = 'trade_finder' AND offer_direction IS NULL) OR
      (service_type != 'trade_finder' AND offer_direction IS NOT NULL)
    ),
  CONSTRAINT claimed_at_set_when_claimed
    CHECK (
      (status IN ('claimed', 'in_progress', 'passed_off', 'completed') AND claimed_at IS NOT NULL) OR
      (status NOT IN ('claimed', 'in_progress', 'passed_off', 'completed'))
    ),
  CONSTRAINT expert_id_set_when_claimed
    CHECK (
      (status IN ('claimed', 'in_progress', 'passed_off', 'completed') AND expert_id IS NOT NULL) OR
      (status NOT IN ('claimed', 'in_progress', 'passed_off', 'completed'))
    )
);

-- Indexes for common queries
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_expert_id ON submissions(expert_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_league_profile_id ON submissions(league_profile_id);
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);

-- Index for expert queue (unclaimed standard submissions)
CREATE INDEX idx_submissions_queue ON submissions(created_at)
  WHERE status = 'submitted' AND expert_id IS NULL;

-- Submission files table
CREATE TABLE submission_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  label TEXT,
  is_own_roster BOOLEAN NOT NULL DEFAULT false,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for submission file lookups
CREATE INDEX idx_submission_files_submission_id ON submission_files(submission_id);

-- Trigger for updated_at
CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for submissions
-- Users can view their own submissions
CREATE POLICY "Users can view their own submissions"
  ON submissions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own submissions
CREATE POLICY "Users can create their own submissions"
  ON submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own draft submissions
CREATE POLICY "Users can update their own draft submissions"
  ON submissions FOR UPDATE
  USING (auth.uid() = user_id AND status = 'draft')
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own draft submissions
CREATE POLICY "Users can delete their own draft submissions"
  ON submissions FOR DELETE
  USING (auth.uid() = user_id AND status = 'draft');

-- Experts can view submissions in the open queue
CREATE POLICY "Experts can view open queue submissions"
  ON submissions FOR SELECT
  USING (
    status = 'submitted' AND expert_id IS NULL AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'expert'
    )
  );

-- Experts can view submissions assigned to them
CREATE POLICY "Experts can view their assigned submissions"
  ON submissions FOR SELECT
  USING (
    expert_id IN (
      SELECT id FROM experts WHERE user_id = auth.uid()
    )
  );

-- Experts can update submissions assigned to them
CREATE POLICY "Experts can update their assigned submissions"
  ON submissions FOR UPDATE
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

-- Experts can claim open submissions
CREATE POLICY "Experts can claim open submissions"
  ON submissions FOR UPDATE
  USING (
    status = 'submitted' AND expert_id IS NULL AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'expert'
    )
  )
  WITH CHECK (
    expert_id IN (
      SELECT id FROM experts WHERE user_id = auth.uid()
    )
  );

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions"
  ON submissions FOR SELECT
  USING (is_admin());

-- Admins can update all submissions
CREATE POLICY "Admins can update all submissions"
  ON submissions FOR UPDATE
  USING (is_admin());

-- RLS Policies for submission_files
-- Users can view files for their own submissions
CREATE POLICY "Users can view their own submission files"
  ON submission_files FOR SELECT
  USING (
    submission_id IN (
      SELECT id FROM submissions WHERE user_id = auth.uid()
    )
  );

-- Users can upload files to their own draft submissions
CREATE POLICY "Users can upload files to their own draft submissions"
  ON submission_files FOR INSERT
  WITH CHECK (
    submission_id IN (
      SELECT id FROM submissions
      WHERE user_id = auth.uid() AND status = 'draft'
    )
  );

-- Users can delete files from their own draft submissions
CREATE POLICY "Users can delete files from their own draft submissions"
  ON submission_files FOR DELETE
  USING (
    submission_id IN (
      SELECT id FROM submissions
      WHERE user_id = auth.uid() AND status = 'draft'
    )
  );

-- Experts can view files for their assigned submissions
CREATE POLICY "Experts can view files for their assigned submissions"
  ON submission_files FOR SELECT
  USING (
    submission_id IN (
      SELECT id FROM submissions
      WHERE expert_id IN (
        SELECT id FROM experts WHERE user_id = auth.uid()
      )
    )
  );

-- Experts can view files for open queue submissions
CREATE POLICY "Experts can view files for open queue submissions"
  ON submission_files FOR SELECT
  USING (
    submission_id IN (
      SELECT id FROM submissions
      WHERE status = 'submitted' AND expert_id IS NULL
    ) AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'expert'
    )
  );

-- Admins can view all submission files
CREATE POLICY "Admins can view all submission files"
  ON submission_files FOR SELECT
  USING (is_admin());

-- Admins can manage all submission files
CREATE POLICY "Admins can manage all submission files"
  ON submission_files FOR ALL
  USING (is_admin());