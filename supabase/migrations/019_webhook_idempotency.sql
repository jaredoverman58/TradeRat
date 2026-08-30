-- Migration 019: Webhook Idempotency Protection
-- Prevents duplicate processing of the same Stripe webhook event

CREATE TABLE processed_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for cleanup queries (optional: delete old events after 30+ days)
CREATE INDEX idx_processed_events_created_at ON processed_webhook_events(created_at);

-- RLS: Only service role can access (webhooks use service role key)
ALTER TABLE processed_webhook_events ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything (no user-facing access needed)
CREATE POLICY "Service role can manage webhook events"
  ON processed_webhook_events
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE processed_webhook_events IS
'Tracks which Stripe webhook events have been processed to prevent duplicate handling. Primary key on event_id ensures atomic claim via insert-or-fail pattern.';
