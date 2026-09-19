-- Migration 036: Add Stripe payment_intent tracking to bundles
-- Needed to issue refunds against the correct original charge

ALTER TABLE bundles
  ADD COLUMN stripe_payment_intent_id TEXT;

COMMENT ON COLUMN bundles.stripe_payment_intent_id IS
'The Stripe PaymentIntent ID from the checkout session that created this bundle. Used to issue refunds against the correct charge.';
