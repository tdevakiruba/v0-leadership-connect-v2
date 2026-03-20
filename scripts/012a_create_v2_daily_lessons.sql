-- Create V2_daily_lessons table (v2 schema with enhanced structure)
-- This table extends the daily_lessons table with additional fields and improved organization

CREATE TABLE IF NOT EXISTS public."V2_daily_lessons" (
  id uuid primary key default gen_random_uuid(),
  day_number integer unique not null check (day_number >= 1 and day_number <= 90),
  focus_area text not null,
  focus_reframe_technique text,
  leader_example text,
  leader_context text,
  leader_story_id text,
  thought_to_work_on text,
  action_for_today text,
  quote text,
  questions text[],
  office_hours_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index on day_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_v2_daily_lessons_day_number ON public."V2_daily_lessons"(day_number);
