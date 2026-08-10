# Database Setup Guide

## Step 1: Run the SQL Migration

1. Open your Supabase project dashboard: https://supabase.com/dashboard/project/ctuqnwxulmuwmcqhmsms
2. Go to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)

## What This Creates

### Tables
- **users** - User profiles (extends auth.users)
- **packages** - Purchased credit packages
- **trade_requests** - Trade advice submissions
- **trade_advice** - Expert responses
- **expert_availability** - Expert queue tracking

### Enums
- **package_type** - free, single, single_premium, bronze, silver, gold, platinum
- **expert_tier** - any, rat_guaranteed
- **expert** - rat, badger, monkey
- **request_status** - pending, assigned, completed, refunded
- **recommendation** - accept, decline, counter

### Storage
- **trade-screenshots** bucket for user-uploaded roster images

### Security
- Row Level Security (RLS) policies on all tables
- Users can only access their own data
- Storage policies for secure file uploads

### Automation
- **Trigger:** Automatically creates user record when someone signs up
- **Trigger:** Updates expert queue counts when requests are assigned
- **Trigger:** Decrements package credits when trade request is created

## Step 2: Verify Installation

After running the migration, verify everything was created:

```sql
-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check expert availability
SELECT * FROM expert_availability;

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'trade-screenshots';
```

## Step 3: Test User Signup

1. Go to http://localhost:3000/signup
2. Create a test account
3. Check Supabase Authentication tab - you should see the new user
4. Check the `users` table - a record should have been auto-created

## Pricing Tier Mapping

| Tier | Package Type | Credits | Expert Tier | Price |
|------|--------------|---------|-------------|-------|
| Free | `free` | 1 | any | $0 |
| Single Trade | `single` | 1 | any | $4.99 |
| Single Premium | `single_premium` | 1 | rat_guaranteed | $7.99 |
| Bronze | `bronze` | 3 | any | $9.99 |
| Silver | `silver` | 7 | any | $24.99 |
| Gold | `gold` | 3 | rat_guaranteed | $14.99 |
| Platinum | `platinum` | 7 | rat_guaranteed | $29.99 |

## Next Steps

After database setup is complete:
1. Update the database types in `types/database.types.ts` to match new tier names
2. Build the user dashboard
3. Implement Stripe payment flow
4. Create admin dashboard
