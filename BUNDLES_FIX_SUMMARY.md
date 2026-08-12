# Bundles Fix: Service-Specific Credits

## Problem
The dashboard was showing one generic "Available Credits" number that summed all bundle credits together. This doesn't work because:
- Trade Evaluation bundles ($4.99-$29.99) can't be used for Trade Finder requests
- Trade Finder bundles ($8.99-$52.99) can't be used for Trade Evaluations
- Different services have different prices and aren't interchangeable

## Solution
Added `service_type` field to bundles table to track what each bundle can be used for.

### Database Changes

**Migration 010** (`supabase/migrations/010_add_service_type_to_bundles.sql`):
- Added `service_type` column to `bundles` table
- Updated credit consumption logic to match BOTH service_type AND rate_tier
- Updated indexes for efficient service-specific lookups

**Service Types:**
- `accept_decline`, `counter_offer`, `bundle` → Trade Evaluation bundles
- `trade_finder` → Trade Finder bundles (premium service)

### Code Changes

**Stripe Webhook** (`app/api/stripe/webhook/route.ts`):
- Now sets `service_type: 'accept_decline'` when creating bundles
- The "3-pack Standard" bundle is for Trade Evaluations

**Dashboard** (`app/dashboard/page.tsx`):
- **Before:** One "Available Credits" total
- **After:** Two separate credit counts:
  - **Trade Evaluations:** Shows eval credits + free credit
  - **Trade Finder:** Shows finder credits separately
- Bundles grouped by service type in "Active Bundles" section
- Each bundle card shows its service type (Trade Evaluation vs Trade Finder)

### How It Works Now

**When a user buys a bundle:**
1. Stripe webhook creates bundle with specific `service_type`
2. Bundle is tagged as either Trade Evaluation or Trade Finder

**When a user submits a request:**
1. System checks if they have a bundle matching:
   - **Service type** (evaluation vs finder)
   - **Expert tier** (standard vs rat_rate)
2. Only matching bundles can be used
3. Error if no matching bundle exists

**Dashboard display:**
```
Your Credits
├─ Trade Evaluations: 3  (includes 1 free)
└─ Trade Finder: 0

Active Bundles
├─ Trade Evaluation - standard 3 pack
│  └─ 3 credits remaining
└─ Trade Finder - rat rate 3 pack
   └─ 3 credits remaining
```

## Next Steps

1. **Apply the migration:**
   ```bash
   npx supabase db push
   ```

2. **Restart dev server** (it's running, just needs to pick up the changes)

3. **Test the updated dashboard:**
   - Go to http://localhost:3002/dashboard
   - You should see two separate credit counts
   - Your existing 3-pack bundle should show under "Trade Evaluations"

4. **For future bundles:**
   - Update Stripe checkout to set correct service_type based on what's being purchased
   - Trade Evaluation bundles → `service_type: 'accept_decline'`
   - Trade Finder bundles → `service_type: 'trade_finder'`

## Migration Notes

- Existing bundles will default to `service_type: 'accept_decline'` (Trade Evaluation)
- This is correct for the "3-pack Standard" bundle we just created
- When you add Trade Finder bundles, set `service_type: 'trade_finder'`

## Credit Consumption Logic

The updated function checks:
```sql
WHERE user_id = NEW.user_id
  AND credits_remaining > 0
  AND expires_at > NOW()
  AND service_type = NEW.service_type  -- NEW: Must match service
  AND (
    (NEW.rate_tier = 'standard' AND bundle_type IN ('standard_3_pack', 'standard_5_pack')) OR
    (NEW.rate_tier = 'rat_rate' AND bundle_type IN ('rat_rate_3_pack', 'rat_rate_5_pack'))
  )
```

This ensures:
- ✅ Trade Evaluation submissions only use Trade Evaluation bundles
- ✅ Trade Finder submissions only use Trade Finder bundles
- ✅ Standard tier only uses standard bundles
- ✅ Rat tier only uses rat_rate bundles
