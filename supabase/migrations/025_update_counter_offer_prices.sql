-- Migration 025: Update Counter Offer Prices
-- Updates Counter Offer prices from $5.99/$6.99 to $5.49/$6.49 in both services and pricing_table sections

-- Update the services section
UPDATE landing_page_sections
SET content = jsonb_build_object(
  'label', 'WHAT WE DO',
  'cards', jsonb_build_array(
    jsonb_build_object(
      'title', 'Accept or Decline',
      'description', 'Got a trade offer? We tell you take it or leave it.',
      'price', '$3.99'
    ),
    jsonb_build_object(
      'title', 'Counter Offer',
      'description', 'Want to negotiate? We build your counter offer.',
      'price', '$5.49'
    ),
    jsonb_build_object(
      'title', 'Trade Finder',
      'description', 'Need a trade? We find your best move in your league.',
      'price', '$14.99'
    )
  ),
  'cta_text', 'Claim Your Free Analysis',
  'cta_link', '/signup'
)
WHERE section_key = 'services';

-- Update the pricing_table section
UPDATE landing_page_sections
SET content = jsonb_build_object(
  'label', 'PRICING',
  'services', jsonb_build_array(
    jsonb_build_object(
      'name', 'Accept/Decline',
      'standard_price', '$3.99',
      'rat_rate_price', '$4.99'
    ),
    jsonb_build_object(
      'name', 'Counter Offer',
      'standard_price', '$5.49',
      'rat_rate_price', '$6.49'
    ),
    jsonb_build_object(
      'name', 'Accept/Decline + Bonus',
      'standard_price', '$8.99',
      'rat_rate_price', '$10.99',
      'is_popular', true
    ),
    jsonb_build_object(
      'name', 'Full League Trade Finder',
      'standard_price', '$14.99',
      'rat_rate_price', '$19.99'
    )
  ),
  'note', 'Rat Rate submissions are reviewed personally by The Rat.',
  'disclaimer', 'The Trade Rat is not affiliated with or endorsed by ESPN, Yahoo, Sleeper, Fantrax, or any fantasy sports platform.'
)
WHERE section_key = 'pricing_table';

COMMENT ON COLUMN landing_page_sections.content IS 'Updated Counter Offer pricing: Standard $5.99 → $5.49, Rat Rate $6.99 → $6.49';
