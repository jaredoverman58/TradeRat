-- Migration 008: Landing Page Sections
-- Creates modular, admin-editable landing page content system

-- Landing page sections table
CREATE TABLE landing_page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for ordering active sections
CREATE INDEX idx_landing_page_sections_active_order
  ON landing_page_sections(sort_order)
  WHERE is_active = true;

-- Trigger for updated_at
CREATE TRIGGER update_landing_page_sections_updated_at
  BEFORE UPDATE ON landing_page_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE landing_page_sections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public can view active sections
CREATE POLICY "Public can view active sections"
  ON landing_page_sections FOR SELECT
  USING (is_active = true);

-- Admins can view all sections
CREATE POLICY "Admins can view all sections"
  ON landing_page_sections FOR SELECT
  USING (is_admin());

-- Admins can manage sections
CREATE POLICY "Admins can manage sections"
  ON landing_page_sections FOR ALL
  USING (is_admin());

-- Seed data with 8 default sections
INSERT INTO landing_page_sections (section_key, is_active, sort_order, content) VALUES
(
  'hero',
  true,
  1,
  '{
    "headline": "The trap is already set.",
    "subtext": "The only place in the world where a one in a billion trading mind analyzes your specific league. No AI. No algorithms. Pure human precision.",
    "primary_button_text": "Claim Your Free Analysis",
    "primary_button_link": "/signup",
    "secondary_button_text": "Meet The Rat",
    "secondary_button_link": "#meet-rat",
    "disclaimer": "First trade evaluation is on us."
  }'::jsonb
),
(
  'why_rat',
  true,
  2,
  '{
    "label": "WHY THE TRADE RAT",
    "points": [
      "Human intelligence, not algorithms. Real expertise from real experts who live and breathe fantasy football.",
      "Full league analysis. We comb every roster in your league to find your best possible move — not generic advice based on player rankings.",
      "One in a billion instinct. The Rat has spent years finding angles other managers never see coming."
    ],
    "quote": "Every trade is a trap. The question is whether you''re setting it or falling into it."
  }'::jsonb
),
(
  'meet_rat',
  true,
  3,
  '{
    "title": "The Rat",
    "credentials": [
      "Fantasy football''s most obsessive trading mind.",
      "Years of dissecting rosters, exploiting leverage, and closing deals others thought were impossible.",
      "Rat Rate slots are limited. Every submission reviewed personally."
    ]
  }'::jsonb
),
(
  'stats',
  true,
  4,
  '{
    "stats": [
      {
        "number": "1000+",
        "label": "Trades Analyzed"
      },
      {
        "number": "95%",
        "label": "Win Rate Improvement"
      },
      {
        "number": "24-48hr",
        "label": "Turnaround Time"
      },
      {
        "number": "100%",
        "label": "Human Analysis"
      }
    ]
  }'::jsonb
),
(
  'services',
  true,
  5,
  '{
    "label": "WHAT WE DO",
    "cards": [
      {
        "title": "Accept or Decline",
        "description": "Got a trade offer? We tell you take it or leave it.",
        "price": "$4.99"
      },
      {
        "title": "Counter Offer",
        "description": "Want to negotiate? We build your counter offer.",
        "price": "$5.99"
      },
      {
        "title": "Trade Finder",
        "description": "Need a trade? We find your best move in your league.",
        "price": "$14.99"
      }
    ],
    "cta_text": "Claim Your Free Analysis",
    "cta_link": "/signup"
  }'::jsonb
),
(
  'testimonials',
  true,
  6,
  '{
    "testimonials": [
      {
        "quote": "The Rat saw a move I never would have considered. Won my league because of it.",
        "name": "Marcus",
        "league_type": "12-team Dynasty",
        "service": "Trade Finder"
      },
      {
        "quote": "I was about to accept a terrible offer. The Rat saved me from myself.",
        "name": "Sarah",
        "league_type": "10-team PPR",
        "service": "Accept/Decline"
      },
      {
        "quote": "The counter offer strategy was brilliant. The other manager accepted immediately.",
        "name": "James",
        "league_type": "14-team Keeper",
        "service": "Counter Offer"
      }
    ]
  }'::jsonb
),
(
  'pricing_table',
  true,
  7,
  '{
    "label": "PRICING",
    "services": [
      {
        "name": "Accept/Decline",
        "standard_price": "$4.99",
        "rat_rate_price": "$5.99"
      },
      {
        "name": "Counter Offer",
        "standard_price": "$5.99",
        "rat_rate_price": "$6.99"
      },
      {
        "name": "Decline + Counter Offer Bundle",
        "standard_price": "$8.99",
        "rat_rate_price": "$10.99",
        "is_popular": true
      },
      {
        "name": "Full League Trade Finder",
        "standard_price": "$14.99",
        "rat_rate_price": "$19.99"
      }
    ],
    "note": "The Rat reviews every submission personally.",
    "disclaimer": "The Trade Rat is not affiliated with or endorsed by ESPN, Yahoo, Sleeper, Fantrax, or any fantasy sports platform."
  }'::jsonb
),
(
  'final_cta',
  true,
  8,
  '{
    "headline": "Your league doesn''t know what''s coming.",
    "subtext": "The first read is free. The wins after that aren''t.",
    "button_text": "Claim Your Free Analysis",
    "button_link": "/signup"
  }'::jsonb
);
