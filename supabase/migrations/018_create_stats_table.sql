-- Migration 018: Create Stats Table
-- Separate stats from landing_page_sections for easier admin management

CREATE TABLE stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_number TEXT NOT NULL,
  stat_label TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for ordering active stats
CREATE INDEX idx_stats_active_order
  ON stats(sort_order)
  WHERE is_active = true;

-- Trigger for updated_at
CREATE TRIGGER update_stats_updated_at
  BEFORE UPDATE ON stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public can view active stats (max 4)
CREATE POLICY "Public can view active stats"
  ON stats FOR SELECT
  USING (is_active = true);

-- Admins can view all stats
CREATE POLICY "Admins can view all stats"
  ON stats FOR SELECT
  USING (is_admin());

-- Admins can manage stats
CREATE POLICY "Admins can manage stats"
  ON stats FOR ALL
  USING (is_admin());

-- Migrate existing stats data from landing_page_sections
-- Extract from the stats section's content.stats array
INSERT INTO stats (stat_number, stat_label, is_active, sort_order)
SELECT
  (stat->>'number')::TEXT as stat_number,
  (stat->>'label')::TEXT as stat_label,
  true as is_active,
  ROW_NUMBER() OVER () as sort_order
FROM
  landing_page_sections,
  jsonb_array_elements(content->'stats') as stat
WHERE
  section_key = 'stats';

-- Note: We're keeping the old stats data in landing_page_sections
-- for reference, but the landing page will now fetch from this table instead.
