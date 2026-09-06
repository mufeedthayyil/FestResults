create extension if not exists "pgcrypto";

do $$ begin
  create type public.event_type as enum ('INDIVIDUAL', 'TEAM');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.result_status as enum ('draft', 'published');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.admin_role as enum ('admin', 'editor');
exception when duplicate_object then null; end $$;

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  short_name text not null unique,
  logo_url text,
  description text,
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  register_number text not null unique,
  full_name text not null,
  team_id uuid not null references public.teams(id) on delete restrict,
  class_name text,
  department text,
  photo_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  event_code text not null unique,
  category text not null,
  event_type public.event_type not null,
  max_participants integer,
  points_for_first integer not null default 10 check (points_for_first >= 0),
  points_for_second integer not null default 8 check (points_for_second >= 0),
  points_for_third integer not null default 6 check (points_for_third >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete restrict,
  participant_id uuid references public.participants(id) on delete restrict,
  team_id uuid references public.teams(id) on delete restrict,
  position integer not null check (position between 1 and 99),
  grade text,
  points integer not null check (points >= 0),
  remarks text,
  status public.result_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint result_subject_check check ((participant_id is not null) <> (team_id is not null))
);

create table if not exists public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role public.admin_role not null default 'editor',
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists participants_register_number_idx on public.participants(register_number);
create index if not exists participants_team_id_idx on public.participants(team_id);
create index if not exists events_event_type_idx on public.events(event_type);
create index if not exists results_event_id_idx on public.results(event_id);
create index if not exists results_team_id_idx on public.results(team_id);
create index if not exists results_status_idx on public.results(status);
create index if not exists results_position_idx on public.results(position);

create or replace view public.overall_leaderboard as
select
  t.id as team_id,
  t.name as team_name,
  coalesce(sum(r.points) filter (where r.status = 'published'), 0)::integer as total_points,
  count(*) filter (where r.status = 'published' and r.position = 1)::integer as first_places,
  count(*) filter (where r.status = 'published' and r.position = 2)::integer as second_places,
  count(*) filter (where r.status = 'published' and r.position = 3)::integer as third_places,
  dense_rank() over (order by
    coalesce(sum(r.points) filter (where r.status = 'published'), 0) desc,
    count(*) filter (where r.status = 'published' and r.position = 1) desc,
    count(*) filter (where r.status = 'published' and r.position = 2) desc,
    count(*) filter (where r.status = 'published' and r.position = 3) desc
  )::integer as overall_rank
from public.teams t
left join public.results r on r.team_id = t.id
where t.active = true
group by t.id, t.name;

alter table public.teams enable row level security;
alter table public.participants enable row level security;
alter table public.events enable row level security;
alter table public.results enable row level security;
alter table public.admin_profiles enable row level security;

drop policy if exists "Public can view active teams" on public.teams;
create policy "Public can view active teams" on public.teams for select using (active = true);
drop policy if exists "Public can view active participants" on public.participants;
create policy "Public can view active participants" on public.participants for select using (active = true);
drop policy if exists "Public can view active events" on public.events;
create policy "Public can view active events" on public.events for select using (active = true);
drop policy if exists "Public can view published results" on public.results;
create policy "Public can view published results" on public.results for select using (status = 'published');
drop policy if exists "Admins manage teams" on public.teams;
create policy "Admins manage teams" on public.teams for all using (exists (select 1 from public.admin_profiles p where p.user_id = auth.uid()));
drop policy if exists "Admins manage participants" on public.participants;
create policy "Admins manage participants" on public.participants for all using (exists (select 1 from public.admin_profiles p where p.user_id = auth.uid()));
drop policy if exists "Admins manage events" on public.events;
create policy "Admins manage events" on public.events for all using (exists (select 1 from public.admin_profiles p where p.user_id = auth.uid()));
drop policy if exists "Admins manage results" on public.results;
create policy "Admins manage results" on public.results for all using (exists (select 1 from public.admin_profiles p where p.user_id = auth.uid()));
drop policy if exists "Admins can view own profile" on public.admin_profiles;
create policy "Admins can view own profile" on public.admin_profiles for select using (user_id = auth.uid());
