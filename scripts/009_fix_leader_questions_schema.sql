-- Fix leader_questions schema to match component expectations
-- This script updates the table structure and RLS policies

-- First, drop existing policies to recreate them
DROP POLICY IF EXISTS "leader_questions_select_all" ON public.leader_questions;
DROP POLICY IF EXISTS "leader_questions_insert_own" ON public.leader_questions;
DROP POLICY IF EXISTS "leader_questions_update_own" ON public.leader_questions;
DROP POLICY IF EXISTS "leader_questions_update_admin" ON public.leader_questions;

-- Add missing columns if they don't exist
ALTER TABLE public.leader_questions 
ADD COLUMN IF NOT EXISTS scenario text,
ADD COLUMN IF NOT EXISTS category text DEFAULT 'strategic';

-- Update scenario from scenario_description if it exists and scenario is null
UPDATE public.leader_questions 
SET scenario = scenario_description 
WHERE scenario IS NULL AND scenario_description IS NOT NULL;

-- Recreate RLS policies with proper permissions
-- Everyone can view questions
CREATE POLICY "leader_questions_select_all" ON public.leader_questions 
  FOR SELECT USING (true);

-- Users can insert their own questions (matching user_id to authenticated user)
CREATE POLICY "leader_questions_insert_own" ON public.leader_questions 
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own questions
CREATE POLICY "leader_questions_update_own" ON public.leader_questions 
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own questions
CREATE POLICY "leader_questions_delete_own" ON public.leader_questions 
  FOR DELETE USING (user_id = auth.uid());

-- Fix office_hours table - add status column if missing
ALTER TABLE public.office_hours 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled'));

-- Update is_active to status if needed
UPDATE public.office_hours 
SET status = CASE WHEN is_active = true THEN 'upcoming' ELSE 'completed' END
WHERE status IS NULL;

-- Create index for the new columns
CREATE INDEX IF NOT EXISTS idx_leader_questions_category ON public.leader_questions(category);
