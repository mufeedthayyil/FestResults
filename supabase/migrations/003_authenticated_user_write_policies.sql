-- Any signed-in user can manage festival records. Anonymous visitors remain read-only.

drop policy if exists "Admins can select all teams" on public.teams;
drop policy if exists "Admins can insert teams" on public.teams;
drop policy if exists "Admins can update teams" on public.teams;
drop policy if exists "Admins can delete teams" on public.teams;
create policy "Authenticated users can select all teams"
  on public.teams for select to authenticated using (true);
create policy "Authenticated users can insert teams"
  on public.teams for insert to authenticated with check (true);
create policy "Authenticated users can update teams"
  on public.teams for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete teams"
  on public.teams for delete to authenticated using (true);

drop policy if exists "Admins can select all participants" on public.participants;
drop policy if exists "Admins can insert participants" on public.participants;
drop policy if exists "Admins can update participants" on public.participants;
drop policy if exists "Admins can delete participants" on public.participants;
create policy "Authenticated users can select all participants"
  on public.participants for select to authenticated using (true);
create policy "Authenticated users can insert participants"
  on public.participants for insert to authenticated with check (true);
create policy "Authenticated users can update participants"
  on public.participants for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete participants"
  on public.participants for delete to authenticated using (true);

drop policy if exists "Admins can select all events" on public.events;
drop policy if exists "Admins can insert events" on public.events;
drop policy if exists "Admins can update events" on public.events;
drop policy if exists "Admins can delete events" on public.events;
create policy "Authenticated users can select all events"
  on public.events for select to authenticated using (true);
create policy "Authenticated users can insert events"
  on public.events for insert to authenticated with check (true);
create policy "Authenticated users can update events"
  on public.events for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete events"
  on public.events for delete to authenticated using (true);

drop policy if exists "Admins can select all results" on public.results;
drop policy if exists "Admins can insert results" on public.results;
drop policy if exists "Admins can update results" on public.results;
drop policy if exists "Admins can delete results" on public.results;
create policy "Authenticated users can select all results"
  on public.results for select to authenticated using (true);
create policy "Authenticated users can insert results"
  on public.results for insert to authenticated with check (true);
create policy "Authenticated users can update results"
  on public.results for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete results"
  on public.results for delete to authenticated using (true);