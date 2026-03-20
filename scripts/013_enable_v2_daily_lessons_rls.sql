-- Enable RLS for V2_daily_lessons table
-- This ensures authenticated users can read lessons while only admins can modify content

-- =====================================================
-- STEP 1: Enable Row Level Security on V2_daily_lessons
-- =====================================================

ALTER TABLE public."V2_daily_lessons" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: Drop existing policies if any (for idempotency)
-- =====================================================

DROP POLICY IF EXISTS "v2_daily_lessons_select_authenticated" ON public."V2_daily_lessons";
DROP POLICY IF EXISTS "v2_daily_lessons_select_all" ON public."V2_daily_lessons";
DROP POLICY IF EXISTS "v2_daily_lessons_admin_insert" ON public."V2_daily_lessons";
DROP POLICY IF EXISTS "v2_daily_lessons_admin_update" ON public."V2_daily_lessons";
DROP POLICY IF EXISTS "v2_daily_lessons_admin_delete" ON public."V2_daily_lessons";

-- =====================================================
-- STEP 3: Create RLS Policies
-- =====================================================

-- SELECT: All authenticated users can read all lessons
-- This is the primary read access for the app
CREATE POLICY "v2_daily_lessons_select_authenticated" 
ON public."V2_daily_lessons" 
FOR SELECT 
TO authenticated
USING (true);

-- INSERT: Only admins can create new lessons
CREATE POLICY "v2_daily_lessons_admin_insert" 
ON public."V2_daily_lessons" 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- UPDATE: Only admins can update lessons
CREATE POLICY "v2_daily_lessons_admin_update" 
ON public."V2_daily_lessons" 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- DELETE: Only admins can delete lessons
CREATE POLICY "v2_daily_lessons_admin_delete" 
ON public."V2_daily_lessons" 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- =====================================================
-- STEP 4: Grant table permissions (ensure Supabase roles have access)
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant select to authenticated users (RLS will filter)
GRANT SELECT ON public."V2_daily_lessons" TO authenticated;

-- Grant full access for admins (RLS will still apply)
GRANT INSERT, UPDATE, DELETE ON public."V2_daily_lessons" TO authenticated;

-- Service role bypasses RLS (used for backend operations)
GRANT ALL ON public."V2_daily_lessons" TO service_role;
