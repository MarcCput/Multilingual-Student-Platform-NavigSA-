-- NavigSA — make suspension mean something (US-21)
-- Run AFTER 0007_rls_for_new_tables.sql.
--
-- A suspended flag that only greys out a badge is not a suspension. Supabase
-- Auth will still issue a session to a suspended account - banning that needs
-- the admin API from a server - so the restriction has to live where the data
-- does: a suspended account can still sign in and read what it already has,
-- but can no longer create anything.

create or replace function public.is_active_user()
returns boolean language sql stable security definer
set search_path = pg_catalog, public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and suspended = false
  );
$$;
revoke execute on function public.is_active_user() from public, anon;
grant execute on function public.is_active_user() to authenticated;

drop policy if exists "create own bookings" on public.bookings;
create policy "create own bookings" on public.bookings
  for insert to authenticated
  with check (auth.uid() = user_id and public.is_active_user());

drop policy if exists "insert own applications" on public.applications;
create policy "insert own applications" on public.applications
  for insert to authenticated
  with check (auth.uid() = user_id and public.is_active_user());

drop policy if exists "insert own documents" on public.documents;
create policy "insert own documents" on public.documents
  for insert to authenticated
  with check (auth.uid() = user_id and public.is_active_user());

drop policy if exists "write own review" on public.reviews;
create policy "write own review" on public.reviews
  for insert to authenticated
  with check (auth.uid() = user_id and public.is_active_user());

drop policy if exists "submit testimonial" on public.testimonials;
create policy "submit testimonial" on public.testimonials
  for insert to authenticated
  with check (auth.uid() = user_id and public.is_active_user());

drop policy if exists "register as provider" on public.providers;
create policy "register as provider" on public.providers
  for insert to authenticated
  with check (auth.uid() = user_id and public.is_active_user());
