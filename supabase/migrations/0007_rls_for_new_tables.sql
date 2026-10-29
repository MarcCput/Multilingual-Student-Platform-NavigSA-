-- NavigSA — access rules for the tables added in 0006.
-- Run AFTER 0006_bookings_providers_admin.sql.

alter table public.providers     enable row level security;
alter table public.bookings      enable row level security;
alter table public.notifications enable row level security;
alter table public.reviews       enable row level security;
alter table public.testimonials  enable row level security;
alter table public.guides        enable row level security;
alter table public.admin_actions enable row level security;

-- ===========================================================================
-- providers
-- ===========================================================================
drop policy if exists "read own provider record" on public.providers;
drop policy if exists "read verified providers"  on public.providers;
drop policy if exists "register as provider"     on public.providers;
drop policy if exists "edit own provider record" on public.providers;
drop policy if exists "admins manage providers"  on public.providers;

create policy "read own provider record" on public.providers
  for select to authenticated using (auth.uid() = user_id);

-- verified providers are visible so their services can show who offers them
create policy "read verified providers" on public.providers
  for select to authenticated using (status = 'verified');

create policy "register as provider" on public.providers
  for insert to authenticated with check (auth.uid() = user_id);

create policy "edit own provider record" on public.providers
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "admins manage providers" on public.providers
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- a provider cannot verify itself
revoke insert, update on public.providers from anon, authenticated;
grant insert (user_id, business_name, registration_number, contact_email,
              contact_phone, category, description, location, accreditation_path)
  on public.providers to authenticated;
grant update (business_name, registration_number, contact_email, contact_phone,
              category, description, location, accreditation_path)
  on public.providers to authenticated;

-- ===========================================================================
-- services - only active services from verified providers are listed.
-- Rows seeded without a provider (provider_id is null) remain visible.
-- ===========================================================================
drop policy if exists "signed-in users read services" on public.services;
drop policy if exists "read listable services"        on public.services;
drop policy if exists "providers manage own services" on public.services;
drop policy if exists "admins manage services"        on public.services;

create policy "read listable services" on public.services
  for select to authenticated using (
    is_active and (
      provider_id is null
      or exists (select 1 from public.providers p
                 where p.id = services.provider_id and p.status = 'verified')
    )
  );

create policy "providers manage own services" on public.services
  for all to authenticated
  using (exists (select 1 from public.providers p
                 where p.id = services.provider_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.providers p
                      where p.id = services.provider_id and p.user_id = auth.uid()));

create policy "admins manage services" on public.services
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ===========================================================================
-- bookings
-- ===========================================================================
drop policy if exists "read own bookings"         on public.bookings;
drop policy if exists "provider reads bookings"   on public.bookings;
drop policy if exists "create own bookings"       on public.bookings;
drop policy if exists "edit own booking notes"    on public.bookings;
drop policy if exists "admins manage bookings"    on public.bookings;

create policy "read own bookings" on public.bookings
  for select to authenticated using (auth.uid() = user_id);

create policy "provider reads bookings" on public.bookings
  for select to authenticated using (
    exists (select 1 from public.services s
            join public.providers p on p.id = s.provider_id
            where s.id = bookings.service_id and p.user_id = auth.uid())
  );

create policy "create own bookings" on public.bookings
  for insert to authenticated with check (auth.uid() = user_id);

create policy "edit own booking notes" on public.bookings
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "admins manage bookings" on public.bookings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- status is moved through the audited functions below, never written directly
revoke insert, update on public.bookings from anon, authenticated;
grant insert (user_id, service_id, scheduled_for, notes) on public.bookings to authenticated;
grant update (notes) on public.bookings to authenticated;

-- ===========================================================================
-- notifications - written by triggers only, read and marked read by the owner
-- ===========================================================================
drop policy if exists "read own notifications"      on public.notifications;
drop policy if exists "mark own notifications read" on public.notifications;

create policy "read own notifications" on public.notifications
  for select to authenticated using (auth.uid() = user_id);

create policy "mark own notifications read" on public.notifications
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

revoke insert, update on public.notifications from anon, authenticated;
grant update (read_at) on public.notifications to authenticated;

-- ===========================================================================
-- reviews
-- ===========================================================================
drop policy if exists "read visible reviews" on public.reviews;
drop policy if exists "write own review"     on public.reviews;
drop policy if exists "edit own review"      on public.reviews;
drop policy if exists "admins manage reviews" on public.reviews;

create policy "read visible reviews" on public.reviews
  for select to authenticated using (removed = false or auth.uid() = user_id or public.is_admin());

create policy "write own review" on public.reviews
  for insert to authenticated with check (auth.uid() = user_id);

create policy "edit own review" on public.reviews
  for update to authenticated
  using (auth.uid() = user_id and removed = false)
  with check (auth.uid() = user_id);

create policy "admins manage reviews" on public.reviews
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- an author cannot un-remove their own review
revoke insert, update on public.reviews from anon, authenticated;
grant insert (user_id, booking_id, service_id, rating, comment) on public.reviews to authenticated;
grant update (rating, comment) on public.reviews to authenticated;

-- ===========================================================================
-- testimonials - approved ones are readable by anyone, including signed-out
-- visitors, because they appear on the public landing page
-- ===========================================================================
drop policy if exists "read approved testimonials" on public.testimonials;
drop policy if exists "read own testimonial"       on public.testimonials;
drop policy if exists "submit testimonial"         on public.testimonials;
drop policy if exists "admins manage testimonials" on public.testimonials;

create policy "read approved testimonials" on public.testimonials
  for select to anon, authenticated using (status = 'approved');

create policy "read own testimonial" on public.testimonials
  for select to authenticated using (auth.uid() = user_id);

create policy "submit testimonial" on public.testimonials
  for insert to authenticated with check (auth.uid() = user_id);

create policy "admins manage testimonials" on public.testimonials
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- an author cannot approve their own testimonial
revoke insert, update on public.testimonials from anon, authenticated;
grant insert (user_id, quote, display_name, name_consent) on public.testimonials to authenticated;

-- ===========================================================================
-- guides - published guides are public reading material
-- ===========================================================================
drop policy if exists "read published guides" on public.guides;
drop policy if exists "admins manage guides"  on public.guides;

create policy "read published guides" on public.guides
  for select to anon, authenticated using (published = true);

create policy "admins manage guides" on public.guides
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

revoke insert, update, delete on public.guides from anon, authenticated;

-- ===========================================================================
-- admin audit log - admins read it, nobody writes it directly
-- ===========================================================================
drop policy if exists "admins read the audit log" on public.admin_actions;

create policy "admins read the audit log" on public.admin_actions
  for select to authenticated using (public.is_admin());

revoke insert, update, delete on public.admin_actions from anon, authenticated;

-- ===========================================================================
-- Audited operations.
--
-- Every state change that is not the owner's to make goes through one of these.
-- They check the caller's right to act, perform the change, and write the audit
-- row in the same transaction - so an unlogged admin action is not possible.
-- ===========================================================================

create or replace function public.log_admin_action(
  p_action text, p_table text, p_id uuid, p_detail jsonb default '{}'::jsonb
) returns void language sql security definer
set search_path = pg_catalog, public as $$
  insert into public.admin_actions (admin_id, action, target_table, target_id, detail)
  values (auth.uid(), p_action, p_table, p_id, p_detail);
$$;
revoke execute on function public.log_admin_action(text, text, uuid, jsonb)
  from public, anon, authenticated;

-- --- student cancels their own booking -------------------------------------
create or replace function public.cancel_booking(p_booking uuid)
returns void language plpgsql security definer
set search_path = pg_catalog, public as $$
begin
  update public.bookings
     set status = 'cancelled'
   where id = p_booking and user_id = auth.uid() and status in ('pending','confirmed');
  if not found then
    raise exception 'That booking cannot be cancelled.';
  end if;
end; $$;
revoke execute on function public.cancel_booking(uuid) from public, anon;
grant execute on function public.cancel_booking(uuid) to authenticated;

-- --- provider or admin moves a booking forward -----------------------------
create or replace function public.set_booking_status(p_booking uuid, p_status text)
returns void language plpgsql security definer
set search_path = pg_catalog, public as $$
declare allowed boolean;
begin
  if p_status not in ('pending','confirmed','completed','cancelled') then
    raise exception 'Unknown booking status %', p_status;
  end if;

  select public.is_admin() or exists (
    select 1 from public.bookings b
    join public.services s on s.id = b.service_id
    join public.providers p on p.id = s.provider_id
    where b.id = p_booking and p.user_id = auth.uid() and p.status = 'verified'
  ) into allowed;

  if not allowed then
    raise exception 'You may not change the status of that booking.';
  end if;

  update public.bookings set status = p_status where id = p_booking;

  if public.is_admin() then
    perform public.log_admin_action('booking.status', 'bookings', p_booking,
      jsonb_build_object('status', p_status));
  end if;
end; $$;
revoke execute on function public.set_booking_status(uuid, text) from public, anon;
grant execute on function public.set_booking_status(uuid, text) to authenticated;

-- --- admin: suspend / reactivate an account --------------------------------
create or replace function public.admin_set_suspended(
  p_user uuid, p_suspended boolean, p_reason text default null
) returns void language plpgsql security definer
set search_path = pg_catalog, public as $$
begin
  if not public.is_admin() then raise exception 'Administrators only.'; end if;
  if p_user = auth.uid() then raise exception 'You cannot suspend your own account.'; end if;

  update public.profiles
     set suspended = p_suspended, suspended_reason = case when p_suspended then p_reason end
   where id = p_user;

  perform public.log_admin_action(
    case when p_suspended then 'user.suspend' else 'user.reactivate' end,
    'profiles', p_user, jsonb_build_object('reason', p_reason));

  perform public.notify(p_user, 'system',
    case when p_suspended then 'Your account has been suspended'
         else 'Your account has been reactivated' end,
    p_reason, '/profile');
end; $$;
revoke execute on function public.admin_set_suspended(uuid, boolean, text) from public, anon;
grant execute on function public.admin_set_suspended(uuid, boolean, text) to authenticated;

-- --- admin: verify or reject a provider ------------------------------------
create or replace function public.admin_set_provider_status(
  p_provider uuid, p_status text, p_reason text default null
) returns void language plpgsql security definer
set search_path = pg_catalog, public as $$
declare owner uuid;
begin
  if not public.is_admin() then raise exception 'Administrators only.'; end if;
  if p_status not in ('pending','verified','rejected') then
    raise exception 'Unknown provider status %', p_status;
  end if;

  update public.providers
     set status = p_status,
         rejection_reason = case when p_status = 'rejected' then p_reason end,
         verified_at = case when p_status = 'verified' then now() end
   where id = p_provider
   returning user_id into owner;

  if owner is null then raise exception 'No such provider.'; end if;

  -- a verified provider gains the provider role
  if p_status = 'verified' then
    update public.profiles set role = 'provider' where id = owner and role = 'student';
  end if;

  perform public.log_admin_action('provider.' || p_status, 'providers', p_provider,
    jsonb_build_object('reason', p_reason));
end; $$;
revoke execute on function public.admin_set_provider_status(uuid, text, text) from public, anon;
grant execute on function public.admin_set_provider_status(uuid, text, text) to authenticated;

-- --- admin: approve or reject a testimonial --------------------------------
create or replace function public.admin_set_testimonial_status(p_id uuid, p_status text)
returns void language plpgsql security definer
set search_path = pg_catalog, public as $$
begin
  if not public.is_admin() then raise exception 'Administrators only.'; end if;
  if p_status not in ('pending','approved','rejected') then
    raise exception 'Unknown testimonial status %', p_status;
  end if;

  update public.testimonials
     set status = p_status,
         approved_at = case when p_status = 'approved' then now() end
   where id = p_id;

  perform public.log_admin_action('testimonial.' || p_status, 'testimonials', p_id, '{}'::jsonb);
end; $$;
revoke execute on function public.admin_set_testimonial_status(uuid, text) from public, anon;
grant execute on function public.admin_set_testimonial_status(uuid, text) to authenticated;

-- --- admin: remove an abusive review ---------------------------------------
create or replace function public.admin_remove_review(p_id uuid, p_reason text)
returns void language plpgsql security definer
set search_path = pg_catalog, public as $$
begin
  if not public.is_admin() then raise exception 'Administrators only.'; end if;

  update public.reviews set removed = true, removed_reason = p_reason where id = p_id;

  perform public.log_admin_action('review.remove', 'reviews', p_id,
    jsonb_build_object('reason', p_reason));
end; $$;
revoke execute on function public.admin_remove_review(uuid, text) from public, anon;
grant execute on function public.admin_remove_review(uuid, text) to authenticated;

-- --- admin: search accounts -------------------------------------------------
-- RLS confines profiles to the owner's own row, which is correct for students.
-- Admin search therefore goes through a function that checks the caller first.
create or replace function public.admin_search_users(p_query text default '')
returns table (
  id uuid, email text, first_name text, last_name text, role text,
  suspended boolean, verification_status text, created_at timestamptz,
  provider_status text, provider_business text
) language sql security definer
set search_path = pg_catalog, public as $$
  select p.id, p.email, p.first_name, p.last_name, p.role, p.suspended,
         p.verification_status, p.created_at, pr.status, pr.business_name
  from public.profiles p
  left join public.providers pr on pr.user_id = p.id
  where public.is_admin()
    and (
      coalesce(p_query, '') = ''
      or p.email ilike '%' || p_query || '%'
      or coalesce(p.first_name, '') ilike '%' || p_query || '%'
      or coalesce(p.last_name, '')  ilike '%' || p_query || '%'
      or coalesce(pr.business_name, '') ilike '%' || p_query || '%'
    )
  order by p.created_at desc
  limit 200;
$$;
revoke execute on function public.admin_search_users(text) from public, anon;
grant execute on function public.admin_search_users(text) to authenticated;

-- --- admin: queues needing attention ----------------------------------------
create or replace function public.admin_pending_providers()
returns setof public.providers language sql security definer
set search_path = pg_catalog, public as $$
  select * from public.providers where public.is_admin() order by created_at desc;
$$;
revoke execute on function public.admin_pending_providers() from public, anon;
grant execute on function public.admin_pending_providers() to authenticated;

create or replace function public.admin_all_testimonials()
returns setof public.testimonials language sql security definer
set search_path = pg_catalog, public as $$
  select * from public.testimonials where public.is_admin() order by created_at desc;
$$;
revoke execute on function public.admin_all_testimonials() from public, anon;
grant execute on function public.admin_all_testimonials() to authenticated;
