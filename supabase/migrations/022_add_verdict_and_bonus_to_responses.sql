-- Migration 022: Add verdict and bonus_content to responses table
-- For Accept/Decline + Bonus service, experts must provide:
-- 1) verdict: accept or decline
-- 2) bonus_content: counter offer if decline, negotiation tips if accept

-- Add verdict column
ALTER TABLE responses
ADD COLUMN verdict TEXT CHECK (verdict IN ('accept', 'decline'));

-- Add bonus_content column
ALTER TABLE responses
ADD COLUMN bonus_content TEXT;

-- Add comments
COMMENT ON COLUMN responses.verdict IS 'For bundle service: accept or decline recommendation. NULL for non-bundle services.';
COMMENT ON COLUMN responses.bonus_content IS 'For bundle service: counter offer if verdict=decline, negotiation tips if verdict=accept. NULL for non-bundle services.';

-- Note: These fields are nullable because they only apply to bundle service_type submissions.
-- For accept_decline, counter_offer, and trade_finder services, these remain NULL.
