-- Migration 033: Add bundle_id to submissions table
-- Links each submission to the bundle that paid for it (for guarantee eligibility tracking)

-- Add bundle_id column to submissions table
ALTER TABLE submissions
  ADD COLUMN bundle_id UUID REFERENCES bundles(id) ON DELETE SET NULL;

-- Index for bundle lookups (e.g., finding all submissions paid by a specific bundle)
CREATE INDEX idx_submissions_bundle_id ON submissions(bundle_id);

-- Index for guarantee eligibility checks (submissions with guarantee-stamped bundles)
CREATE INDEX idx_submissions_guarantee_eligible ON submissions(bundle_id)
  WHERE bundle_id IS NOT NULL;

COMMENT ON COLUMN submissions.bundle_id IS
'The bundle that paid for this submission. NULL = paid with free evaluation. Used to determine guarantee eligibility by joining to bundles.guarantee_purchase_number.';
