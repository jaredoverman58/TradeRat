# Request Types Implementation - Complete ✅

## Overview

Trade Rat now supports **two distinct request types**, each with different pricing and expert workflows:

1. **Trade Evaluation** - User has a specific trade offer to evaluate
2. **Trade Finder** - User wants expert to create trade suggestions from scratch

## What Changed

### 1. Database Schema (`002_add_request_types.sql`)

**New Enum:**
- `request_type` - 'trade_evaluation' or 'trade_finder'

**Modified Tables:**
- `trade_requests` table:
  - Added `request_type` field (required)
  - Added `specific_trade_offer` field (nullable, for evaluation requests only)
  
**New Package Types:**
- `finder_single` - $8.99 (1 credit)
- `finder_single_premium` - $13.99 (1 credit, Rat guaranteed)
- `finder_bronze` - $17.99 (3 credits)
- `finder_silver` - $44.99 (7 credits)
- `finder_gold` - $26.99 (3 credits, Rat guaranteed)
- `finder_platinum` - $52.99 (7 credits, Rat guaranteed)

### 2. TypeScript Types (`types/database.types.ts`)

**Added:**
- `RequestType` type
- New package type values for finder packages
- `request_type` and `specific_trade_offer` fields to trade_requests interfaces

### 3. Submit Form (`app/dashboard/submit/page.tsx`)

**New Features:**
- Radio button selection between "Evaluate an Offer" and "Find Me a Trade"
- Visual cards showing:
  - Service description
  - Estimated expert time (~20-30 min vs ~45-60 min)
  - Pricing indicator
- Conditional fields:
  - "Describe the Trade Offer" textarea (only for Trade Evaluation)
  - Dynamic screenshot upload instructions
  - Dynamic placeholder text for notes

**Form Fields:**
- `requestType` - Selected service type
- `specificTradeOffer` - The specific trade offer (required for evaluations)

### 4. Advice View (`app/dashboard/advice/[id]/page.tsx`)

**Different Display Based on Request Type:**

**Trade Evaluation:**
- Title: "Trade Analysis"
- Shows: Accept/Decline/Counter recommendation in large text
- Displays: The specific trade offer submitted

**Trade Finder:**
- Title: "Trade Suggestions"  
- Shows: Suggested trade in large gold text (no accept/decline)
- Focus: Custom trade ideas created by expert

**Both Show:**
- Request type badge in "Request Details" section
- Analysis
- Counter Offer (if applicable)
- Roster Impact
- Audio Commentary (if provided)

### 5. Dashboard (`app/dashboard/page.tsx`)

**Request Cards Show:**
- Request type badge (Trade Finder • or Trade Evaluation •)
- Status information
- Submission date
- Screenshot count

### 6. Pricing Configuration (`lib/pricing.ts`)

**Exports:**
- `tradeEvaluationPricing` - Original 7 packages ($0 - $29.99)
- `tradeFinderPricing` - New 6 packages ($8.99 - $52.99)
- `allPricing` - Combined array
- `getPricingById()` - Helper function
- `formatPackageType()` - Display name formatter

**Pricing Strategy:**
- Trade Finder packages are ~75-80% more expensive
- Reflects the 2-3x more work required (analyzing entire league vs one trade)

## User Flows

### Trade Evaluation Flow

1. User clicks "Submit Trade Request"
2. Selects "Evaluate an Offer" (default)
3. Describes specific trade: "Their CMC for my Jefferson and Mixon"
4. Uploads 2 screenshots (their roster + opponent's roster)
5. Fills league info and notes
6. Submits (uses 1 credit from evaluation package)
7. Expert reviews and recommends: Accept/Decline/Counter
8. User views recommendation with analysis

### Trade Finder Flow

1. User clicks "Submit Trade Request"
2. Selects "Find Me a Trade"
3. Uploads 10-12 screenshots (entire league rosters)
4. Fills league info and notes about needs/strategy
5. Submits (uses 1 credit from finder package)
6. Expert analyzes entire league to find realistic partners
7. Expert creates 1-3 specific trade suggestions
8. User views suggestions with analysis and rationale

## Migration Instructions

### For Existing Databases

Run in Supabase SQL Editor:

```sql
-- Run the migration
\i supabase/migrations/002_add_request_types.sql
```

This will:
- Create the `request_type` enum
- Add 6 new package types for Trade Finder
- Add `request_type` field to trade_requests (defaults to 'trade_evaluation' for existing rows)
- Add `specific_trade_offer` field

### For New Installations

Just run both migrations in order:
1. `001_initial_schema.sql`
2. `002_add_request_types.sql`

## Expert Dashboard Updates Needed

When building the Expert Dashboard, experts will need:

### For Trade Evaluation Requests
- See: `specific_trade_offer` field prominently
- See: Both rosters (user + opponent)
- Submit: Accept/Decline/Counter recommendation
- Format: Standard evaluation template

### For Trade Finder Requests
- See: All league rosters (10-12+ screenshots)
- See: User's strategic notes
- Submit: 1-3 suggested trades with target teams
- Format: "You should offer [X] to Team [Y] for [Z]" + why this works

## Admin Dashboard Updates Needed

When building the Admin Dashboard, show:
- Request type badge in queue view
- Filter by request type
- Different time estimates (20-30 min vs 45-60 min)
- Package type (evaluation vs finder) for assignment logic

## Validation Rules

**Trade Evaluation Requests:**
- Must have `specific_trade_offer` filled in
- Should have 2+ screenshots (both rosters)
- Uses evaluation package credits

**Trade Finder Requests:**
- `specific_trade_offer` is null
- Should have 10+ screenshots (entire league)
- Uses finder package credits

## Pricing Comparison

| Service | Credits | Any Expert | The Rat Guaranteed |
|---------|---------|------------|-------------------|
| **Trade Evaluation** | | | |
| Single | 1 | $4.99 | $7.99 |
| Package (3) | 3 | $9.99 | $14.99 |
| Package (7) | 7 | $24.99 | $29.99 |
| **Trade Finder** | | | |
| Single | 1 | $8.99 | $13.99 |
| Package (3) | 3 | $17.99 | $26.99 |
| Package (7) | 7 | $44.99 | $52.99 |

## Testing

### Manual Test (Trade Evaluation)

1. Sign up / log in
2. Add test package:
   ```sql
   INSERT INTO packages (user_id, package_type, credits_purchased, credits_remaining, expert_tier, expires_at, stripe_payment_id)
   VALUES ('your-user-id', 'bronze', 3, 3, 'any', '2026-12-31', 'test_payment_123');
   ```
3. Submit request with "Evaluate an Offer" selected
4. Fill in specific trade offer
5. Upload 2 screenshots
6. Verify request created with `request_type = 'trade_evaluation'`

### Manual Test (Trade Finder)

1. Add test finder package:
   ```sql
   INSERT INTO packages (user_id, package_type, credits_purchased, credits_remaining, expert_tier, expires_at, stripe_payment_id)
   VALUES ('your-user-id', 'finder_bronze', 3, 3, 'any', '2026-12-31', 'test_payment_456');
   ```
2. Submit request with "Find Me a Trade" selected
3. Upload 10+ screenshots
4. Verify request created with `request_type = 'trade_finder'`
5. Verify no `specific_trade_offer` saved

## Next Steps

- [ ] Update CLAUDE.md to reflect two request types
- [ ] Build Stripe integration with both package types
- [ ] Update Admin Dashboard to handle both request types
- [ ] Update Expert Dashboard with different submission forms per type
- [ ] Add email templates for each request type
- [ ] Update marketing copy to explain both services

## Benefits of This Implementation

✅ **Clear value differentiation** - Users understand the price difference  
✅ **Accurate expert allocation** - Admins assign based on work scope  
✅ **Better UX** - Forms adapt to the specific service type  
✅ **Flexible pricing** - Can adjust finder vs evaluation pricing independently  
✅ **Future-proof** - Easy to add new request types (e.g., "Draft Strategy")
