-- Fix infinite recursion in team_members RLS policies
-- The original policy caused infinite recursion by referencing team_members within team_members policy

-- Drop the problematic policies
DROP POLICY IF EXISTS "team_members_select_member" ON public.team_members;
DROP POLICY IF EXISTS "team_members_insert_lead" ON public.team_members;

-- Create fixed SELECT policy - users can see their own team memberships
-- and all memberships in teams they belong to (using a non-recursive approach)
CREATE POLICY "team_members_select_own" ON public.team_members 
FOR SELECT USING (
  user_id = auth.uid()
);

-- Create policy for viewing team members of teams you belong to
-- This uses a security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.get_user_team_ids(user_uuid uuid)
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT team_id FROM team_members WHERE user_id = user_uuid;
$$;

-- Allow viewing all members of teams you're in
CREATE POLICY "team_members_select_team" ON public.team_members 
FOR SELECT USING (
  team_id IN (SELECT public.get_user_team_ids(auth.uid()))
);

-- Fixed INSERT policy - team leads can add members, admins can add anyone
CREATE POLICY "team_members_insert_lead" ON public.team_members 
FOR INSERT WITH CHECK (
  -- User is inserting themselves (joining a team)
  user_id = auth.uid()
  OR
  -- User is an admin
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  OR
  -- User is a team lead of the target team (using security definer function)
  EXISTS (
    SELECT 1 FROM public.team_members tm 
    WHERE tm.team_id = team_members.team_id 
    AND tm.user_id = auth.uid() 
    AND tm.role = 'team_lead'
  )
);

-- Also fix the user_progress team lead policy which has the same issue
DROP POLICY IF EXISTS "user_progress_team_lead_select" ON public.user_progress;

-- Create a helper function to check if a user is a team lead for another user
CREATE OR REPLACE FUNCTION public.is_team_lead_for_user(lead_uuid uuid, member_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members tm1
    JOIN team_members tm2 ON tm1.team_id = tm2.team_id
    WHERE tm1.user_id = lead_uuid 
    AND tm1.role IN ('team_lead')
    AND tm2.user_id = member_uuid
  );
$$;

-- Recreate the team lead select policy using the helper function
CREATE POLICY "user_progress_team_lead_select" ON public.user_progress 
FOR SELECT USING (
  auth.uid() = user_id 
  OR public.is_team_lead_for_user(auth.uid(), user_id)
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
