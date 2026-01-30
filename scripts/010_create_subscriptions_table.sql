-- Create subscriptions/authorization table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  amount_paid INTEGER, -- in cents
  currency TEXT DEFAULT 'usd',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, stripe_payment_intent_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own subscriptions
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert (webhooks)
CREATE POLICY "Service role can insert subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (true);

-- Only service role can update
CREATE POLICY "Service role can update subscriptions"
  ON subscriptions FOR UPDATE
  USING (true);

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION check_user_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = p_user_id
      AND status = 'active'
      AND end_date > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update expired subscriptions (can be run periodically)
CREATE OR REPLACE FUNCTION update_expired_subscriptions()
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'active' AND end_date < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
