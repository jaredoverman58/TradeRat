-- Add request_type enum and field to support two distinct service types

-- Create request type enum
CREATE TYPE request_type AS ENUM ('trade_evaluation', 'trade_finder');

-- Add new package types for Trade Finder (priced higher)
ALTER TYPE package_type ADD VALUE 'finder_single';
ALTER TYPE package_type ADD VALUE 'finder_single_premium';
ALTER TYPE package_type ADD VALUE 'finder_bronze';
ALTER TYPE package_type ADD VALUE 'finder_silver';
ALTER TYPE package_type ADD VALUE 'finder_gold';
ALTER TYPE package_type ADD VALUE 'finder_platinum';

-- Add request_type field to trade_requests table
ALTER TABLE trade_requests
ADD COLUMN request_type request_type DEFAULT 'trade_evaluation';

-- Make the column NOT NULL after setting default
ALTER TABLE trade_requests
ALTER COLUMN request_type SET NOT NULL;

-- Add specific_trade_offer field for trade evaluation requests
ALTER TABLE trade_requests
ADD COLUMN specific_trade_offer TEXT;

-- Add index for filtering by request type
CREATE INDEX idx_trade_requests_type ON trade_requests(request_type);

-- Comment to document the two request types
COMMENT ON COLUMN trade_requests.request_type IS
'trade_evaluation: User has a specific offer to evaluate (accept/decline/counter).
trade_finder: User wants expert to create trade suggestions from scratch by analyzing entire league.';

COMMENT ON COLUMN trade_requests.specific_trade_offer IS
'For trade_evaluation requests only: describes the specific trade offer received (e.g., "Their CMC for my Jefferson and Mixon")';
