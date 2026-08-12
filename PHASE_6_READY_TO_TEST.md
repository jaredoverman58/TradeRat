# Phase 6: Ready to Test ✅

## What I Fixed

### 1. Database Migration (user_roles fix)
✅ **Fixed:** `supabase/migrations/009_add_phone_number.sql`
- Changed target table from `users` → `user_roles`
- Updated constraint name: `phone_number_format` → `user_roles_phone_number_format`
- Updated index name: `idx_users_phone_number` → `idx_user_roles_phone_number`
- Updated all comments to reference `user_roles`

### 2. API Code (user_roles fix)
✅ **Fixed:** `app/api/expert/respond/route.ts`
- Changed `.from('users')` → `.from('user_roles')`
- Changed `.eq('id', ...)` → `.eq('user_id', ...)` (correct column name for user_roles)

### 3. Environment Variables
✅ **Fixed:** `.env.local`
- Removed duplicate Twilio credentials
- Added `+` prefix to Twilio phone number (now: `+18164513865`)
- Updated app URL to match actual dev server port (3000 → 3001)

✅ **Checked:** Your .env.local has:
- ✓ Supabase URL (present)
- ✓ Supabase anon key (present)
- ✓ Supabase service role key (present)
- ✓ Twilio Account SID (present - real value)
- ✓ Twilio Auth Token (present - real value)
- ✓ Twilio Phone Number (present - real value with + prefix)
- ⚠️ **MISSING:** Stripe publishable key (still placeholder: `pk_test_placeholder`)
- ⚠️ **MISSING:** Stripe secret key (still placeholder: `sk_test_placeholder`)
- ⚠️ **MISSING:** Stripe webhook secret (still placeholder: `whsec_placeholder`)

### 4. Documentation Updates
✅ **Updated:** All references in `PHASE_6_TESTING_GUIDE.md` and `PHASE_6_SUMMARY.md` to use `user_roles` instead of `users`

### 5. Stripe Webhook Setup Guide
✅ **Created:** `STRIPE_WEBHOOK_SETUP.md` with complete Stripe CLI instructions

---

## What's Ready to Test

### ✅ Twilio SMS (100% Ready)
- Code is correct (reads from `user_roles`)
- Real credentials are in `.env.local`
- Migration is ready to apply
- **Status: READY**

### ⚠️ Stripe Checkout (Needs Your Keys)
- Code is correct and ready
- Webhook handler is ready
- **Needs:** Real Stripe test keys
- **Needs:** Stripe CLI running for local webhook forwarding

---

## Before You Test: Complete These Steps

### Step 1: Get Stripe Test Keys (5 minutes)

1. Go to https://dashboard.stripe.com/ and enable **Test Mode** (toggle top right)
2. Navigate to **Developers** → **API keys**
3. Copy these keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)
4. Update `.env.local`:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
   STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE
   ```

### Step 2: Set Up Stripe Webhook Forwarding (5 minutes)

**Option A: Quick Install (Windows with Scoop)**
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Option B: Manual Download**
- Download from https://github.com/stripe/stripe-cli/releases/latest
- Extract and add to PATH

**Then run:**
```bash
# Login to Stripe
stripe login

# Start webhook forwarding (LEAVE THIS RUNNING)
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

**Copy the webhook secret** it outputs (starts with `whsec_`) and add to `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_THE_SECRET_FROM_STRIPE_LISTEN
```

### Step 3: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## Testing Steps (Follow These Exactly)

### Test 1: Stripe 3-Pack Bundle Purchase

1. **Open the app:** http://localhost:3001/dashboard

2. **Click "Buy 3-Pack — $12.99"**
   - You'll be redirected to Stripe Checkout

3. **Fill out the form with test data:**
   - **Card:** `4242 4242 4242 4242`
   - **Expiry:** `12/34` (any future date)
   - **CVC:** `123` (any 3 digits)
   - **Name:** Any name
   - **Email:** Any email
   - **ZIP:** `12345` (any ZIP)

4. **Click "Pay"**

5. **Verify success:**
   - ✅ You're redirected to `/dashboard?purchase=success`
   - ✅ Green success message appears at the top
   - ✅ Your credits show +3 (new "standard 3 pack" bundle appears)

6. **Check the webhook fired:**
   - Look at your `stripe listen` terminal
   - You should see: `checkout.session.completed [evt_xxxxx]` with `[200]` response

7. **Verify in database:**
   - Go to Supabase Dashboard → Table Editor → `bundles`
   - Look for a new row with:
     - `bundle_type`: `standard_3_pack`
     - `credits_remaining`: `3`
     - `expires_at`: ~1 year from now

**Expected result:** Bundle created, credits visible, webhook logged.

---

### Test 2: Twilio SMS Notification

**Prerequisites:**
- You need a test submission and expert account set up
- Your phone number must be in the `user_roles` table

#### A. Add Your Phone Number to Database

1. Go to **Supabase Dashboard** → **Table Editor** → `user_roles`
2. Find your user's row (match your `user_id` to your account)
3. Click to edit, set `phone_number` to: `+1YOUR_NUMBER_HERE` (E.164 format)
   - Example: `+12025551234`
   - Must start with `+` and country code
4. Save

#### B. Create a Test Submission

1. Go to http://localhost:3001/submit
2. Create a trade evaluation request (you need credits from Test 1)
3. Note the submission ID (check `submissions` table in Supabase)

#### C. Simulate Expert Response

You need to call the expert API. Easiest way is browser console:

1. Open browser console (F12)
2. Get your expert ID from Supabase → `experts` table
3. Get your submission ID from Supabase → `submissions` table
4. Run this (replace IDs):

```javascript
fetch('http://localhost:3001/api/expert/respond', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    submission_id: 'YOUR_SUBMISSION_ID',
    expert_id: 'YOUR_EXPERT_ID',
    written_content: 'This is a test response. Accept the trade!'
  })
}).then(r => r.json()).then(console.log)
```

#### D. Verify SMS Sent

1. **Check your phone:** You should receive a text message:
   > Your Trade Rat analysis is ready. Log in to view it: http://localhost:3001/dashboard

2. **Check server logs:** In your `npm run dev` terminal, you should see:
   ```
   SMS notification sent successfully: SMxxxxxxxxxxxxx
   ```

3. **Check Twilio logs:**
   - Go to Twilio Console → Monitor → Logs → SMS Logs
   - Look for your message and delivery status

**Expected result:** SMS received on your phone, success logged in console.

---

## Troubleshooting

### Stripe: "No checkout URL returned"
- Check `.env.local` has real Stripe keys (not placeholders)
- Restart dev server after updating env vars

### Stripe: "Webhook signature verification failed"
- Make sure you're using the webhook secret from `stripe listen` output
- Don't use the secret from Stripe Dashboard for local testing
- Restart dev server after updating `STRIPE_WEBHOOK_SECRET`

### Stripe: Bundle not created after payment
- Check `stripe listen` terminal for webhook events
- Look for `[200]` response (success) or error messages
- Check server console for webhook errors

### SMS: No text received
- Verify phone number format: must start with `+` (E.164)
- Trial accounts: phone number must be verified in Twilio Console
- Check server console for SMS errors
- Check Twilio Console → SMS Logs for delivery status

### SMS: "User has no phone number on file"
- This means `phone_number` is null in `user_roles` table
- Go to Supabase → `user_roles` → add your phone number

---

## Success Criteria

You're done when:

- ✅ Clicking "Buy 3-Pack" opens Stripe checkout
- ✅ Completing payment adds 3 credits to your account
- ✅ Success message appears after payment
- ✅ Bundle appears in `bundles` table with 1-year expiration
- ✅ Webhook event appears in `stripe listen` terminal with `[200]`
- ✅ Expert response triggers SMS to your phone
- ✅ SMS contains correct message and link
- ✅ Console logs "SMS notification sent successfully"

---

## Quick Reference

**Dev Server:** http://localhost:3001/dashboard

**Stripe Test Card:** `4242 4242 4242 4242` (any expiry/CVC/ZIP)

**Stripe Webhook Command:**
```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

**Tables to Check:**
- `bundles` - verify bundle created
- `user_roles` - add phone_number here
- `submissions` - get submission_id
- `experts` - get expert_id

**Environment Variables Needed:**
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...` ← **YOU NEED TO ADD THIS**
- `STRIPE_SECRET_KEY=sk_test_...` ← **YOU NEED TO ADD THIS**
- `STRIPE_WEBHOOK_SECRET=whsec_...` ← **YOU NEED TO ADD THIS (from stripe listen)**
