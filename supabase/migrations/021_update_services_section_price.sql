-- Migration 021: Update Accept/Decline price in services section
-- Updates Accept or Decline card price from $4.99 to $3.99

UPDATE landing_page_sections
SET content = '{
  "label": "WHAT WE DO",
  "cards": [
    {
      "title": "Accept or Decline",
      "description": "Got a trade offer? We tell you take it or leave it.",
      "price": "$3.99"
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
WHERE section_key = 'services';
