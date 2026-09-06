-- Admin CRUD policies for the browser Supabase client.
-- RLS stays enabled. Public users can only read the rows needed by the public site.

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = (select auth.uid())
      and role in ('admin', 'editor')
  );
$$;

revoke all on function public.is_admin_user() from public;
grant execute on function public.is_admin_user() to authenticated;

drop policy if exists "Admins manage teams" on public.teams;
drop policy if exists "Admins manage participants" on public.participants;
drop policy if exists "Admins manage events" on public.events;
drop policy if exists "Admins manage results" on public.results;

create policy "Admins can select all teams"
  on public.teams for select to authenticated
  using (public.is_admin_user());
create policy "Admins can insert teams"
  on public.teams for insert to authenticated
  with check (public.is_admin_user());
create policy "Admins can update teams"
  on public.teams for update to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());
create policy "Admins can delete teams"
  on public.teams for delete to authenticated
  using (public.is_admin_user());

create policy "Admins can select all participants"
  on public.participants for select to authenticated
  using (public.is_admin_user());
create policy "Admins can insert participants"
  on public.participants for insert to authenticated
  with check (public.is_admin_user());
create policy "Admins can update participants"
  on public.participants for update to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());
create policy "Admins can delete participants"
  on public.participants for delete to authenticated
  using (public.is_admin_user());

create policy "Admins can select all events"
  on public.events for select to authenticated
  using (public.is_admin_user());
create policy "Admins can insert events"
  on public.events for insert to authenticated
  with check (public.is_admin_user());
create policy "Admins can update events"
  on public.events for update to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());
create policy "Admins can delete events"
  on public.events for delete to authenticated
  using (public.is_admin_user());

create policy "Admins can select all results"
  on public.results for select to authenticated
  using (public.is_admin_user());
create policy "Admins can insert results"
  on public.results for insert to authenticated
  with check (public.is_admin_user());
create policy "Admins can update results"
  on public.results for update to authenticated
  using (public.is_admin_user())
  with check (public.is_admin_user());
create policy "Admins can delete results"
  on public.results for delete to authenticated
  using (public.is_admin_user());

comment on function public.is_admin_user() is 'Returns true only for an authenticated user with an admin_profiles role of admin or editor.';
