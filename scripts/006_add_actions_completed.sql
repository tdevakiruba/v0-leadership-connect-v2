-- Add actions_completed column to track completed action items
-- This stores an array of action indices that have been completed

ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS actions_completed integer[] DEFAULT '{}';

-- Add ai_actions column to store AI-generated actions as JSON
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS ai_actions jsonb DEFAULT '[]';

-- Comment for clarity
COMMENT ON COLUMN public.user_progress.actions_completed IS 'Array of indices of completed actions';
COMMENT ON COLUMN public.user_progress.ai_actions IS 'JSON array of AI-generated bold actions for the day';
