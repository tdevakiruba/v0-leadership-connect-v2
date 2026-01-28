-- Leadership Reboot Database Schema
-- Run this script to create all required tables

-- =====================================================
-- PHASE 1: Create all tables first (no RLS policies)
-- =====================================================

-- (1) profiles - extends Supabase auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  title text,
  company text,
  role text default 'member' check (role in ('member', 'team_lead', 'admin')),
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- (2) daily_lessons - 90-day curriculum content
create table if not exists public.daily_lessons (
  id uuid primary key default gen_random_uuid(),
  day_number integer unique not null check (day_number >= 1 and day_number <= 90),
  focus_area text not null,
  focus_reframe_technique text,
  leader_example text,
  leader_context text,
  leader_story_id text,
  thought_to_work_on text,
  action_for_today text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- (3) teams - supports enterprise deployment
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- (4) team_members
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text default 'member' check (role in ('member', 'team_lead')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(team_id, user_id)
);

-- (5) user_progress - tracks each day's completion state
create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  day_number integer not null check (day_number >= 1 and day_number <= 90),
  completed boolean default false,
  completed_at timestamp with time zone,
  reflection_text text,
  ai_action text,
  points_awarded integer default 0,
  streak_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, day_number)
);

-- =====================================================
-- PHASE 2: Enable RLS on all tables
-- =====================================================

alter table public.profiles enable row level security;
alter table public.daily_lessons enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.user_progress enable row level security;

-- =====================================================
-- PHASE 3: Create RLS policies (all tables exist now)
-- =====================================================

-- Profiles policies
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);
create policy "profiles_select_public" on public.profiles for select using (true);

-- Daily lessons policies
create policy "daily_lessons_select_all" on public.daily_lessons for select using (true);
create policy "daily_lessons_admin_insert" on public.daily_lessons for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "daily_lessons_admin_update" on public.daily_lessons for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Teams policies
create policy "teams_select_member" on public.teams for select using (
  exists (select 1 from public.team_members where team_id = teams.id and user_id = auth.uid())
);
create policy "teams_insert_admin" on public.teams for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Team members policies
create policy "team_members_select_member" on public.team_members for select using (
  exists (select 1 from public.team_members tm where tm.team_id = team_members.team_id and tm.user_id = auth.uid())
);
create policy "team_members_insert_lead" on public.team_members for insert with check (
  exists (
    select 1 from public.team_members tm 
    where tm.team_id = team_members.team_id 
    and tm.user_id = auth.uid() 
    and tm.role = 'team_lead'
  ) or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- User progress policies
create policy "user_progress_select_own" on public.user_progress for select using (auth.uid() = user_id);
create policy "user_progress_insert_own" on public.user_progress for insert with check (auth.uid() = user_id);
create policy "user_progress_update_own" on public.user_progress for update using (auth.uid() = user_id);
create policy "user_progress_delete_own" on public.user_progress for delete using (auth.uid() = user_id);

-- Team leads can view their team members' progress
create policy "user_progress_team_lead_select" on public.user_progress for select using (
  exists (
    select 1 from public.team_members tm1
    join public.team_members tm2 on tm1.team_id = tm2.team_id
    where tm1.user_id = auth.uid() 
    and tm1.role in ('team_lead', 'admin')
    and tm2.user_id = user_progress.user_id
  )
);

-- (6) scenarios - leadership lab discussion board
create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  tags text[] default '{}',
  related_day_number integer,
  points_awarded integer default 5,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.scenarios enable row level security;

create policy "scenarios_select_all" on public.scenarios for select using (true);
create policy "scenarios_insert_own" on public.scenarios for insert with check (auth.uid() = user_id);
create policy "scenarios_update_own" on public.scenarios for update using (auth.uid() = user_id);
create policy "scenarios_delete_own" on public.scenarios for delete using (auth.uid() = user_id);

-- (7) scenario_comments
create table if not exists public.scenario_comments (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.scenarios(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  comment_text text not null,
  points_awarded integer default 2,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.scenario_comments enable row level security;

create policy "scenario_comments_select_all" on public.scenario_comments for select using (true);
create policy "scenario_comments_insert_own" on public.scenario_comments for insert with check (auth.uid() = user_id);
create policy "scenario_comments_update_own" on public.scenario_comments for update using (auth.uid() = user_id);
create policy "scenario_comments_delete_own" on public.scenario_comments for delete using (auth.uid() = user_id);

-- (8) certificates - issued after 90-day completion
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  issued_at timestamp with time zone default timezone('utc'::text, now()) not null,
  certificate_url text,
  verification_code text unique not null default encode(gen_random_bytes(16), 'hex')
);

alter table public.certificates enable row level security;

create policy "certificates_select_own" on public.certificates for select using (auth.uid() = user_id);
create policy "certificates_select_verification" on public.certificates for select using (true);
create policy "certificates_insert_system" on public.certificates for insert with check (auth.uid() = user_id);

-- Trigger to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Create indexes for better query performance
create index if not exists idx_user_progress_user_id on public.user_progress(user_id);
create index if not exists idx_user_progress_day_number on public.user_progress(day_number);
create index if not exists idx_team_members_team_id on public.team_members(team_id);
create index if not exists idx_team_members_user_id on public.team_members(user_id);
create index if not exists idx_scenarios_user_id on public.scenarios(user_id);
create index if not exists idx_scenario_comments_scenario_id on public.scenario_comments(scenario_id);
