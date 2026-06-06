-- =============================================
-- Writelyf HealthOS - Supabase Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Family Members
create table if not exists family_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  full_name text not null,
  relation text,
  date_of_birth date,
  gender text,
  blood_group text,
  allergies text[] default '{}',
  chronic_conditions text[] default '{}',
  current_medications text[] default '{}',
  emergency_contact_name text,
  emergency_contact_phone text,
  notes text,
  created_at timestamptz default now()
);

-- 2. Health Records
create table if not exists health_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  family_member_id uuid references family_members(id) on delete cascade,
  title text not null,
  record_type text not null,
  record_date date,
  provider_name text,
  doctor_name text,
  notes text,
  file_url text,
  file_name text,
  file_type text,
  ai_status text default 'pending' check (ai_status in ('pending', 'processed', 'failed')),
  created_at timestamptz default now()
);

-- 3. AI Record Summaries
create table if not exists ai_record_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  record_id uuid references health_records(id) on delete cascade unique,
  summary text,
  key_findings jsonb default '[]',
  abnormal_values jsonb default '[]',
  doctor_questions jsonb default '[]',
  safety_note text,
  raw_ai_output jsonb,
  created_at timestamptz default now()
);

-- 4. Timeline Events
create table if not exists timeline_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  family_member_id uuid references family_members(id) on delete cascade,
  record_id uuid references health_records(id) on delete set null,
  event_type text,
  title text,
  description text,
  event_date date,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- 5. Doctor Summaries
create table if not exists doctor_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  family_member_id uuid references family_members(id) on delete cascade,
  chief_complaint text,
  duration text,
  symptoms text[] default '{}',
  selected_record_ids uuid[] default '{}',
  current_medicines text,
  allergies text,
  questions text,
  generated_summary text,
  created_at timestamptz default now()
);

-- 6. Emergency Cards
create table if not exists emergency_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  family_member_id uuid references family_members(id) on delete cascade,
  share_id text unique not null,
  visible_fields jsonb default '{}',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 7. Consents
create table if not exists consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  consent_type text,
  accepted boolean default false,
  accepted_at timestamptz default now()
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

alter table family_members enable row level security;
alter table health_records enable row level security;
alter table ai_record_summaries enable row level security;
alter table timeline_events enable row level security;
alter table doctor_summaries enable row level security;
alter table emergency_cards enable row level security;
alter table consents enable row level security;

-- family_members policies
create policy "Users can manage their own family members"
  on family_members for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- health_records policies
create policy "Users can manage their own records"
  on health_records for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ai_record_summaries policies
create policy "Users can manage their own AI summaries"
  on ai_record_summaries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- timeline_events policies
create policy "Users can manage their own timeline"
  on timeline_events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- doctor_summaries policies
create policy "Users can manage their own doctor summaries"
  on doctor_summaries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- emergency_cards policies
create policy "Users can manage their own emergency cards"
  on emergency_cards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Public can view active emergency cards by share_id"
  on emergency_cards for select
  using (is_active = true);

-- consents policies
create policy "Users can manage their own consents"
  on consents for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================
-- Storage Bucket Setup
-- Run in Supabase Dashboard → Storage
-- =============================================

-- 1. Create bucket named: health-records
-- 2. Set it to PRIVATE (not public)
-- 3. Add storage policies:

-- Policy: Users can upload to their own folder
-- insert: (storage.foldername(name))[1] = auth.uid()::text

-- Policy: Users can read their own files
-- select: (storage.foldername(name))[1] = auth.uid()::text

-- Policy: Users can delete their own files
-- delete: (storage.foldername(name))[1] = auth.uid()::text

-- =============================================
-- Indexes for performance
-- =============================================

create index if not exists idx_health_records_user_id on health_records(user_id);
create index if not exists idx_health_records_family_member_id on health_records(family_member_id);
create index if not exists idx_timeline_events_user_id on timeline_events(user_id);
create index if not exists idx_timeline_events_event_date on timeline_events(event_date desc);
create index if not exists idx_emergency_cards_share_id on emergency_cards(share_id);
