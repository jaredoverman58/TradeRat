# Granular Credits System

## Overview
Credits are now tracked separately by:
1. **Service type** (Accept/Decline, Counter Offer, Decline+Counter Bundle, Trade Finder)
2. **Rate tier** (Standard vs Rat Rate)
3. **Free vs Paid** (free evaluation shown separately)

## Dashboard Display

### Credits Summary Section

**Free Evaluation** (shown separately):
```
Free Evaluation
1 credit
One-time credit • Accept/Decline evaluation
```

**Paid Credits** (grouped by service, then tier):
```
Paid Credits

Accept/Decline
  Standard     3
  Rat Rate     0

Counter Offer
  Standard     0
  Rat Rate     0

Trade Finder
  Standard     0
  Rat Rate     2
```

### Active Bundles Section

Each bundle card shows:
- Service type (Accept/Decline, Counter Offer, etc.)
- Rate tier (Standard or Rat Rate)
- Bundle type (standard_3_pack, etc.)
- Credits remaining
- Expiration date

Example card:
```
Accept/Decline
Standard • standard 3 pack
3 Credits remaining
Expires: 12/31/2027
```

## How It Works

### Bundle Structure
Each bundle has:
- `service_type`: which service it unlocks ('accept_decline', 'counter_offer', 'bundle', 'trade_finder')
- `bundle_type`: which expert tier ('standard_3_pack', 'rat_rate_5_pack', etc.)
- `credits_remaining`: how many uses left
- `expires_at`: expiration date

### Credit Consumption
When a user submits a request:
1. Check if free evaluation available (if service_type = 'accept_decline')
2. If not, find bundle matching:
   - **Service type** (must match exactly)
   - **Rate tier** (standard vs rat_rate)
   - Has credits remaining
   - Not expired

### Service Type Mapping

| service_type | Display Name | Description |
|--------------|-------------|-------------|
| `accept_decline` | Accept/Decline | Simple yes/no on a trade offer |
| `counter_offer` | Counter Offer | Suggest alternative trade terms |
| `bundle` | Decline+Counter Bundle | Both accept/decline AND counter offer |
| `trade_finder` | Trade Finder | Create custom trade suggestions |

### Rate Tier Mapping

| bundle_type pattern | Display Name | Description |
|---------------------|-------------|-------------|
| `*_standard_*` | Standard | Any available expert |
| `*_rat_rate_*` | Rat Rate | The Rat (premium) guaranteed |

## Key Differences from Previous

**Before:**
- One "Available Credits" number
- Trade evaluations lumped together
- Free credit combined with paid

**After:**
- Free evaluation shown separately
- Each service type + tier combination tracked distinctly
- Clear hierarchy: Service > Tier > Credits

## Why This Matters

1. **Prevents confusion**: Users can't accidentally use Trade Finder credits for Accept/Decline
2. **Clear pricing**: Different services have different values ($4.99 vs $14.99)
3. **Free credit protection**: One-time free credit isn't mixed with paid bundles
4. **Rate tier enforcement**: Standard bundles can't be used to get Rat Rate service

## Testing Display

After purchasing a "3-pack Standard Accept/Decline" bundle, dashboard shows:

```
Your Credits

Free Evaluation
1 credit
One-time credit • Accept/Decline evaluation

Paid Credits

Accept/Decline
  Standard     3

Active Bundles

[Card 1]
Accept/Decline
Standard • standard 3 pack
3 Credits remaining
Expires: 8/11/2027
```

## Migration Required

Run `npx supabase db push` to apply migration 010 which adds the `service_type` column to bundles.
