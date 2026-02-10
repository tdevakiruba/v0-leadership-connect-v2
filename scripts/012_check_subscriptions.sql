-- Check all subscriptions to see current state
SELECT 
  id,
  user_id,
  status,
  start_date,
  end_date,
  stripe_session_id,
  plan_type,
  amount_paid,
  created_at
FROM subscriptions
ORDER BY created_at DESC;
