# Stripe Webhook Local Testing Setup

## Quick Setup (Required for Testing Payments)

Stripe webhooks need to reach your local server. Use the Stripe CLI to forward webhooks from Stripe to localhost.

### 1. Install Stripe CLI

**Windows (with Scoop):**
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Or download directly:**
- Go to https://github.com/stripe/stripe-cli/releases/latest
- Download `stripe_X.X.X_windows_x86_64.zip`
- Extract and add to your PATH

### 2. Login to Stripe

```bash
stripe login
```

This will open a browser window to authenticate with your Stripe account.

### 3. Start Webhook Forwarding

```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

**Important:** Use port 3001 (your dev server's actual port), not 3000.

### 4. Copy the Webhook Secret

When you run `stripe listen`, it will output:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx
```

Copy this secret and update your `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

### 5. Restart Your Dev Server

After updating `.env.local`:

```bash
# Stop the server (Ctrl+C in the terminal running npm run dev)
npm run dev
```

---

## During Testing

Keep the `stripe listen` command running in a separate terminal while testing. You'll see webhook events appear in real-time:

```
2026-08-11 14:32:15   --> checkout.session.completed [evt_xxxxx]
2026-08-11 14:32:15  <--  [200] POST http://localhost:3001/api/stripe/webhook [evt_xxxxx]
```

---

## Alternative: Use Stripe Dashboard Webhook (Production Only)

For deployed apps, configure webhooks in the Stripe Dashboard:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events: `checkout.session.completed`
5. Copy the signing secret and add to production environment variables

**Don't use dashboard webhooks for local testing** — they can't reach localhost.

---

## Troubleshooting

### "stripe: command not found"

The Stripe CLI isn't installed or not in your PATH. Reinstall or add to PATH.

### "Failed to forward event to localhost"

- Check your dev server is running on the correct port (3001)
- Verify the `--forward-to` URL matches your server
- Check for firewall blocking localhost connections

### "Webhook signature verification failed"

- Make sure you copied the webhook secret from `stripe listen` output
- Restart your dev server after updating `.env.local`
- Don't use the webhook secret from Stripe Dashboard for local testing

---

## Ready to Test

Once `stripe listen` is running and showing "Ready!", you can test the full payment flow:

1. Click "Buy 3-Pack" on the dashboard
2. Complete payment with test card `4242 4242 4242 4242`
3. Watch the webhook event appear in your `stripe listen` terminal
4. Verify credits added to your account
