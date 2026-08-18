-- Migration 020: Update Pricing and Service Names
-- Renames "Decline + Counter Offer Bundle" to "Accept/Decline + Bonus"
-- Updates Accept/Decline pricing from $4.99/$5.99 to $3.99/$4.99
-- Updates service descriptions

-- Update the pricing_table section in landing_page_sections
UPDATE landing_page_sections
SET content = '{
  "label": "PRICING",
  "services": [
    {
      "name": "Accept/Decline",
      "standard_price": "$3.99",
      "rat_rate_price": "$4.99"
    },
    {
      "name": "Counter Offer",
      "standard_price": "$5.99",
      "rat_rate_price": "$6.99"
    },
    {
      "name": "Accept/Decline + Bonus",
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
  "note": "Rat Rate submissions are reviewed personally by The Rat.",
  "disclaimer": "The Trade Rat is not affiliated with or endorsed by ESPN, Yahoo, Sleeper, Fantrax, or any fantasy sports platform."
}'::jsonb
WHERE section_key = 'pricing_table';

COMMENT ON COLUMN landing_page_sections.content IS 'Updated pricing: Accept/Decline now $3.99/$4.99 (down from $4.99/$5.99). Bundle renamed to Accept/Decline + Bonus at $8.99/$10.99 (price unchanged).';
