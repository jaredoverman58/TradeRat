-- Migration 017: Create Testimonials Table
-- Separate testimonials from landing_page_sections for easier admin management

CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote TEXT NOT NULL,
  name TEXT NOT NULL,
  league_type TEXT,
  service_used TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for ordering active testimonials
CREATE INDEX idx_testimonials_active_order
  ON testimonials(sort_order)
  WHERE is_active = true;

-- Trigger for updated_at
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public can view active testimonials
CREATE POLICY "Public can view active testimonials"
  ON testimonials FOR SELECT
  USING (is_active = true);

-- Admins can view all testimonials
CREATE POLICY "Admins can view all testimonials"
  ON testimonials FOR SELECT
  USING (is_admin());

-- Admins can manage testimonials
CREATE POLICY "Admins can manage testimonials"
  ON testimonials FOR ALL
  USING (is_admin());

-- Note: We're keeping the old testimonials data in landing_page_sections
-- for reference, but the landing page will now fetch from this table instead.
