-- Leadership Reboot - Questions and Office Hours Tables
-- Run this script to add Q&A functionality and office hours scheduling

-- (1) leader_questions - stores questions/scenarios submitted for office hours
CREATE TABLE IF NOT EXISTS public.leader_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  scenario_description text NOT NULL,
  context text,
  urgency text DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'addressed', 'archived')),
  related_phase text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.leader_questions ENABLE ROW LEVEL SECURITY;

-- Everyone can view questions (for community learning)
CREATE POLICY "leader_questions_select_all" ON public.leader_questions 
  FOR SELECT USING (true);
-- Users can insert their own questions
CREATE POLICY "leader_questions_insert_own" ON public.leader_questions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update their own questions
CREATE POLICY "leader_questions_update_own" ON public.leader_questions 
  FOR UPDATE USING (auth.uid() = user_id);
-- Admins and team leads can update any question (e.g., mark as addressed)
CREATE POLICY "leader_questions_update_admin" ON public.leader_questions 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'team_lead'))
  );

-- (2) office_hours - stores upcoming office hours sessions
CREATE TABLE IF NOT EXISTS public.office_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Leadership Office Hours',
  description text,
  scheduled_at timestamp with time zone NOT NULL,
  duration_minutes integer DEFAULT 60,
  meeting_url text NOT NULL,
  host_name text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.office_hours ENABLE ROW LEVEL SECURITY;

-- Everyone can view office hours
CREATE POLICY "office_hours_select_all" ON public.office_hours 
  FOR SELECT USING (true);
-- Only admins can manage office hours
CREATE POLICY "office_hours_admin_manage" ON public.office_hours 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leader_questions_user_id ON public.leader_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_leader_questions_status ON public.leader_questions(status);
CREATE INDEX IF NOT EXISTS idx_leader_questions_created_at ON public.leader_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_office_hours_scheduled_at ON public.office_hours(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_office_hours_active ON public.office_hours(is_active);

-- Insert a sample office hours entry (optional - can be removed)
INSERT INTO public.office_hours (title, description, scheduled_at, meeting_url, host_name, is_active)
VALUES (
  'Weekly Leadership Office Hours',
  'Join us to discuss your leadership challenges, ask questions, and learn from fellow leaders.',
  (NOW() + INTERVAL '7 days')::timestamp with time zone,
  'https://meet.google.com/leadership-reboot',
  'Leadership Coach',
  true
) ON CONFLICT DO NOTHING;

-- Add notifications table for future use
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'reminder')),
  is_read boolean DEFAULT false,
  link_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON public.notifications 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON public.notifications 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert_system" ON public.notifications 
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
