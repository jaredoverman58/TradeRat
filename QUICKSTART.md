# QuickStart Guide - Trade Rat

## First Time Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

### 3. Run Database Migrations

Go to your Supabase project SQL Editor and run both migrations in order:

**Migration 1:** `supabase/migrations/001_initial_schema.sql`
- Creates all tables, enums, RLS policies
- Sets up storage bucket
- Creates triggers for auto-credit deduction

**Migration 2:** `supabase/migrations/002_add_request_types.sql`
- Adds request_type field (trade_evaluation, trade_finder)
- Adds 6 new finder package types
- Adds specific_trade_offer field

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Testing the Two Request Types

### Option 1: Trade Evaluation (Evaluate an Offer)

**1. Create Test User**
- Go to http://localhost:3000/signup
- Sign up with email/password

**2. Add Test Package (Evaluation)**

In Supabase SQL Editor:
```sql
-- Replace 'your-user-id' with actual user ID from auth.users table
INSERT INTO packages (user_id, package_type, credits_purchased, credits_remaining, expert_tier, expires_at, stripe_payment_id)
VALUES (
  'your-user-id',
  'bronze',
  3,
  3,
  'any',
  '2026-12-31',
  'test_payment_eval_123'
);
```

**3. Submit Evaluation Request**
- Go to http://localhost:3000/dashboard
- Click "Submit Trade Request"
- Select **"Evaluate an Offer"** (first option)
- Fill in: "Their Christian McCaffrey for my Justin Jefferson and Joe Mixon"
- Upload 2 screenshots (your roster + opponent's roster)
- Fill league settings (ESPN, PPR, etc.)
- Add notes about your concerns
- Submit

**4. Verify in Database**
```sql
SELECT id, request_type, specific_trade_offer, user_notes 
FROM trade_requests 
ORDER BY submitted_at DESC 
LIMIT 1;
```

Should show:
- `request_type = 'trade_evaluation'`
- `specific_trade_offer` has your trade description

### Option 2: Trade Finder (Find Me a Trade)

**1. Add Test Finder Package**

```sql
INSERT INTO packages (user_id, package_type, credits_purchased, credits_remaining, expert_tier, expires_at, stripe_payment_id)
VALUES (
  'your-user-id',
  'finder_bronze',
  3,
  3,
  'any',
  '2026-12-31',
  'test_payment_finder_456'
);
```

**2. Submit Finder Request**
- Go to http://localhost:3000/dashboard
- Click "Submit Trade Request"
- Select **"Find Me a Trade"** (second option)
- Notice: No "specific trade offer" field appears
- Upload 10+ screenshots (entire league rosters)
- Fill league settings
- Add notes: "Looking to upgrade RB, willing to trade WR depth"
- Submit

**3. Verify in Database**
```sql
SELECT id, request_type, specific_trade_offer, user_notes 
FROM trade_requests 
ORDER BY submitted_at DESC 
LIMIT 1;
```

Should show:
- `request_type = 'trade_finder'`
- `specific_trade_offer IS NULL`

## Simulating Expert Advice

To test the advice view pages, manually insert test advice:

### For Trade Evaluation Request
```sql
-- Get a trade_evaluation request ID first
SELECT id FROM trade_requests WHERE request_type = 'trade_evaluation' LIMIT 1;

-- Insert test advice (replace 'request-id-here' with actual ID)
INSERT INTO trade_advice (trade_request_id, expert, proposed_trade, recommendation, analysis, roster_impact)
VALUES (
  'request-id-here',
  'rat',
  'Their Christian McCaffrey for your Justin Jefferson and Joe Mixon',
  'decline',
  'This trade significantly weakens your WR depth while only moderately improving your RB situation. Jefferson is a WR1 in all formats, and losing him creates a hole that''s hard to fill. While CMC is elite when healthy, his injury history is concerning. Counter-offer: Try offering just Mixon + a WR2 instead.',
  'Before: Strong at WR (Jefferson, WR2, WR3), Weak at RB (Mixon, RB2).
After: Very Weak at WR (WR2, WR3), Strong at RB (CMC, RB2).
Net: You create a bigger hole than you fill. Not worth it unless you have another WR1 on your bench.'
);

-- Mark request as completed
UPDATE trade_requests 
SET status = 'completed', completed_at = NOW() 
WHERE id = 'request-id-here';
```

### For Trade Finder Request
```sql
-- Get a trade_finder request ID first
SELECT id FROM trade_requests WHERE request_type = 'trade_finder' LIMIT 1;

-- Insert test advice (replace 'request-id-here' with actual ID)
INSERT INTO trade_advice (trade_request_id, expert, proposed_trade, recommendation, analysis, roster_impact)
VALUES (
  'request-id-here',
  'badger',
  'Offer your Davante Adams + Travis Etienne to Team 5 (Mark) for Derrick Henry + DeVonta Smith',
  'accept',
  'Team 5 is WR-needy and RB-heavy (Henry, Barkley, Pollard). Mark has been trying to move Henry for weeks according to league chat. This trade gives him an immediate WR1 upgrade while you consolidate into a true RB1. 

Alternative: You could also target Team 3 (Sarah) - she has Bijan Robinson and needs WR help. Offer the same package for Bijan + Zay Flowers.',
  'Before: WRs: Adams, Lamb, Olave / RBs: Etienne, Pollard, Mostert
After: WRs: Lamb, Smith, Olave / RBs: Henry, Pollard, Mostert

You upgrade from Etienne (RB12-15 range) to Henry (RB3-5 range) while downgrading from Adams (WR6) to Smith (WR18). Net positive because RB scarcity makes Henry more valuable. Your WR depth holds with Lamb and Olave as your 1-2.'
);

-- Mark request as completed
UPDATE trade_requests 
SET status = 'completed', completed_at = NOW() 
WHERE id = 'request-id-here';
```

## View the Advice

Go to http://localhost:3000/dashboard and click on the completed request.

**Trade Evaluation shows:**
- Large "DECLINE" recommendation
- The specific trade offer
- Analysis section
- Counter offer section (if provided)
- Roster impact

**Trade Finder shows:**
- "Trade Suggestions" heading (not "Trade Analysis")
- Suggested trade in large gold text
- Analysis with alternative options
- Roster impact showing before/after

## Package Types Reference

### Evaluation Packages
- `free` - $0 (1 credit)
- `single` - $4.99 (1 credit)
- `single_premium` - $7.99 (1 credit, Rat guaranteed)
- `bronze` - $9.99 (3 credits)
- `gold` - $14.99 (3 credits, Rat guaranteed)
- `silver` - $24.99 (7 credits)
- `platinum` - $29.99 (7 credits, Rat guaranteed)

### Finder Packages
- `finder_single` - $8.99 (1 credit)
- `finder_single_premium` - $13.99 (1 credit, Rat guaranteed)
- `finder_bronze` - $17.99 (3 credits)
- `finder_gold` - $26.99 (3 credits, Rat guaranteed)
- `finder_silver` - $44.99 (7 credits)
- `finder_platinum` - $52.99 (7 credits, Rat guaranteed)

## Common Issues

### "No credits available" error
Make sure you inserted a package with `credits_remaining > 0` for the correct user ID.

### Screenshots not uploading
Check that the `trade-screenshots` storage bucket exists in Supabase and has the correct policies.

### Can't see request_type field
Make sure you ran migration `002_add_request_types.sql` in Supabase.

### TypeScript errors
Run `npm install` to ensure all dependencies are installed.

## Project Structure

```
TradeRat/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx           # Main dashboard
│   │   ├── submit/page.tsx    # Submit request form (TWO REQUEST TYPES)
│   │   └── advice/[id]/page.tsx  # View advice (CONDITIONAL DISPLAY)
│   ├── login/page.tsx
│   └── signup/page.tsx
├── lib/
│   ├── pricing.ts             # Pricing config for both types
│   └── supabase/
├── types/
│   └── database.types.ts      # TypeScript types
└── supabase/
    └── migrations/
        ├── 001_initial_schema.sql
        └── 002_add_request_types.sql  # NEW: Two request types
```

## Next Development Steps

1. **Stripe Integration** - Add payment flows for all 13 package types
2. **Admin Dashboard** - Assign requests, manage experts
3. **Expert Dashboard** - Submit advice with different forms per type
4. **Email Notifications** - Send updates when advice is ready
5. **Marketing Pages** - Landing page explaining both services

## Documentation

- `CLAUDE.md` - Full product specification
- `REQUEST_TYPES_IMPLEMENTATION.md` - Technical implementation details
- `IMPLEMENTATION_SUMMARY.md` - What was built
- `QUICKSTART.md` - This file
