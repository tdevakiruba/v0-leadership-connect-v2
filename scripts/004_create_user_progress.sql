-- Create user_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES daily_lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  reflection TEXT,
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "user_progress_select_own" ON user_progress;
DROP POLICY IF EXISTS "user_progress_insert_own" ON user_progress;
DROP POLICY IF EXISTS "user_progress_update_own" ON user_progress;

-- Create RLS policies
CREATE POLICY "user_progress_select_own" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_progress_insert_own" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_progress_update_own" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);
