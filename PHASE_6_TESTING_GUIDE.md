# Phase 6: Stripe & Twilio Testing Guide

This guide walks you through testing the Stripe checkout and Twilio SMS features end-to-end.

## Prerequisites

Before testing, you need to:

1. **Apply the database migration**
2. **Configure Stripe**
3. **Configure Twilio**
4. **Update environment variables**

---

## Step 1: Apply Database Migration

The phone_number field needs to be added to the user_roles table.

### Option A: Using Supabase CLI (Recommended)

```bash
cd TradeRat
npx supabase db push
```

### Option B: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase/migrations/009_add_phone_number.sql`
4. Copy and paste the SQL into the SQL Editor
5. Click **Run**

---

## Step 2: Configure Stripe

### Get Your Stripe Test Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Make sure you're in **Test Mode** (toggle in top right)
3. Navigate to **Developers** → **API keys**
4. Copy:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### Set Up Webhook

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter the webhook URL:
   - **Local testing**: `http://localhost:3000/api/stripe/webhook`
   - **Deployed**: `https://yourdomain.com/api/stripe/webhook`
4. Click **Select events**
5. Select: `checkout.session.completed`
6. Click **Add endpoint**
7. Copy the **Signing secret** (starts with `whsec_`)

### Update .env.local

Replace the placeholder values in `.env.local`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

### Testing Webhooks Locally

For local testing, you need to forward webhooks to localhost using Stripe CLI:

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The CLI will output a webhook signing secret (starts with `whsec_`). Use this for local testing instead of the one from the dashboard.

---

## Step 3: Configure Twilio

### Get Your Twilio Credentials

1. Go to [Twilio Console](https://console.twilio.com/)
2. From your dashboard, copy:
   - **Account SID**
   - **Auth Token**
3. Navigate to **Phone Numbers** → **Manage** → **Active numbers**
4. Copy your **Twilio phone number**

### Verify Your Phone Number (Trial Accounts Only)

If you're using a Twilio trial account:

1. Go to **Phone Numbers** → **Manage** → **Verified Caller IDs**
2. Click **Add a new Caller ID**
3. Enter your personal phone number
4. Complete the verification process

**Important**: Trial accounts can only send SMS to verified numbers.

### Update .env.local

Add your Twilio credentials to `.env.local`:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

---

## Step 4: Restart the Development Server

After updating `.env.local`:

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

---

## Testing Part A: Stripe Checkout

### Test the Purchase Flow

1. **Navigate to the dashboard**:
   - Go to `http://localhost:3000/dashboard`
   - You should see a "Buy 3-Pack — $12.99" button

2. **Click the button**:
   - You'll be redirected to Stripe's hosted checkout page
   - Use a [Stripe test card](https://stripe.com/docs/testing):
     - **Success**: `4242 4242 4242 4242`
     - **Decline**: `4000 0000 0000 0002`
   - Use any future expiry date (e.g., `12/34`)
   - Use any 3-digit CVC (e.g., `123`)
   - Use any ZIP code (e.g., `12345`)

3. **Complete the payment**:
   - Click **Pay**
   - You should be redirected back to `/dashboard?purchase=success`
   - A success message should appear at the top
   - Your credits should be updated (you should see a new "standard 3 pack" bundle with 3 credits)

4. **Verify in Stripe Dashboard**:
   - Go to **Payments** in Stripe Dashboard
   - You should see the test payment
   - Click on it to view details

5. **Verify in Database**:
   - Go to Supabase Dashboard → **Table Editor** → `bundles`
   - You should see a new row with:
     - `bundle_type`: `standard_3_pack`
     - `credits_remaining`: `3`
     - `expires_at`: 1 year from now

### Test the Cancellation Flow

1. Click "Buy 3-Pack — $12.99" again
2. On the Stripe checkout page, click the **Back arrow** or close the tab
3. You should be redirected to `/dashboard?purchase=cancelled`
4. A cancellation message should appear
5. No bundle should be created in the database

---

## Testing Part B: Twilio SMS

### Add Your Phone Number

First, add your phone number to your user profile:

1. **Option A: Via Database** (quickest for testing):
   - Go to Supabase Dashboard → **Table Editor** → `user_roles`
   - Find your user row
   - Edit the `phone_number` field
   - Enter your phone number in E.164 format: `+1234567890`
   - Click **Save**

2. **Option B: Via Settings Page** (if you build one later):
   - Navigate to user settings
   - Add your phone number

### Test the SMS Flow

You'll need to simulate an expert responding to a submission. Here's how:

1. **Create a test submission**:
   - Go to `/submit` and create a trade evaluation request
   - Make sure you have credits available

2. **Get the submission ID**:
   - Go to Supabase Dashboard → **Table Editor** → `submissions`
   - Find your submission and copy its `id`

3. **Simulate an expert response**:
   - You'll need to call the `/api/expert/respond` endpoint
   - Use a tool like **Postman**, **curl**, or the browser console

   Example using fetch in browser console:
   ```javascript
   fetch('/api/expert/respond', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       submission_id: 'YOUR_SUBMISSION_ID_HERE',
       expert_id: 'YOUR_EXPERT_ID_HERE',
       written_content: 'This is a test response from the expert.'
     })
   })
   ```

   **Note**: You'll need a valid `expert_id` that belongs to your user account. Check the `experts` table in Supabase.

4. **Check your phone**:
   - You should receive an SMS saying: "Your Trade Rat analysis is ready. Log in to view it: http://localhost:3000/dashboard"

5. **Check the console logs**:
   - In your terminal where `npm run dev` is running
   - You should see either:
     - `SMS notification sent successfully: [message_sid]`
     - Or an error if something went wrong

### Troubleshooting SMS

If you don't receive the SMS:

1. **Check console logs** for errors
2. **Verify Twilio credentials** are correct in `.env.local`
3. **For trial accounts**: Make sure your phone number is verified in Twilio
4. **Check phone number format**: Must be E.164 format (e.g., `+1234567890`)
5. **Check Twilio console**:
   - Go to **Monitor** → **Logs** → **SMS Logs**
   - Look for your message and any error details

---

## Test Card Numbers Reference

Use these [Stripe test cards](https://stripe.com/docs/testing):

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Card declined |
| 4000 0000 0000 9995 | Insufficient funds |
| 4000 0002 8000 0000 | Authentication required |

---

## Verification Checklist

### Stripe Checkout ✓

- [ ] "Buy 3-Pack — $12.99" button appears on dashboard
- [ ] Button redirects to Stripe checkout
- [ ] Can complete payment with test card
- [ ] Success redirect works (`/dashboard?purchase=success`)
- [ ] Success message appears
- [ ] Credits are added to account (3 credits)
- [ ] Bundle appears in database with correct expiration (1 year)
- [ ] Cancel redirect works (`/dashboard?purchase=cancelled`)
- [ ] Cancellation message appears
- [ ] No bundle created on cancellation

### Twilio SMS ✓

- [ ] Can add phone number to user profile
- [ ] SMS sends when expert completes response
- [ ] SMS contains correct message and link
- [ ] SMS is skipped if user has no phone number (no errors)
- [ ] Success/failure is logged to console
- [ ] SMS appears in Twilio logs

---

## Common Issues

### Webhook Not Receiving Events

**Problem**: Payment succeeds but bundle isn't created

**Solutions**:
1. Make sure Stripe webhook is configured correctly
2. Check webhook signing secret is correct in `.env.local`
3. For local testing, use `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. Check server console for webhook errors

### SMS Not Sending

**Problem**: Response completes but no SMS received

**Solutions**:
1. Check Twilio credentials in `.env.local`
2. Verify phone number format is E.164 (`+1234567890`)
3. For trial accounts, verify your phone number in Twilio console
4. Check server console for SMS errors
5. Check Twilio SMS logs for delivery status

### Database Migration Fails

**Problem**: Error when applying migration

**Solutions**:
1. Make sure you're connected to the correct Supabase project
2. Check if `phone_number` column already exists
3. Try applying the SQL manually in Supabase SQL Editor

---

## Next Steps

Once testing is complete and working:

1. **Replace test keys with live keys** when ready for production
2. **Set up proper webhook endpoint** in Stripe for production URL
3. **Upgrade Twilio account** to remove trial restrictions
4. **Add user settings page** to let users manage their phone number
5. **Build remaining bundle types** (5-pack, premium tiers, etc.)
6. **Add email notifications** as a fallback to SMS

---

## Support

If you encounter issues:
- Check server console logs
- Check browser console for client-side errors
- Verify all environment variables are set correctly
- Ensure database migration was applied successfully
