-- Add missing columns to subscriptions table that the webhook and success page need
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'self-paced';

-- Create index for session-based deduplication
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_session_id ON subscriptions(stripe_session_id);

-- Drop the old unique constraint if it exists and add a new one that includes stripe_session_id
-- This prevents duplicate subscriptions from both webhook and success page fallback
DO $$
BEGIN
  -- Add unique constraint on stripe_session_id to prevent duplicates
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_stripe_session_id_key'
  ) THEN
    ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_stripe_session_id_key UNIQUE (stripe_session_id);
  END IF;
END $$;
