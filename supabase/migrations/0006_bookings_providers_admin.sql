-- NavigSA — US-17, 18, 19, 21, 22, 23, 25
-- Run AFTER 0005_harden_functions.sql.

-- ===========================================================================
-- roles and suspension (US-21)
-- ===========================================================================
alter table public.profiles
  add column if not exists role text not null default 'student'
    check (role in ('student', 'provider', 'admin')),
  add column if not exists suspended boolean not null default false,
  add column if not exists suspended_reason text;

-- Admin checks have to read somebody else's profile row, which RLS forbids,
-- and a policy on profiles that queried profiles would recurse. A SECURITY
-- DEFINER helper sidesteps both. It takes no arguments, returns a boolean and
-- touches nothing else, so the surface is as small as it can be.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and suspended = false
  );
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ===========================================================================
-- providers (US-19)
-- ===========================================================================
create table if not exists public.providers (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references auth.users (id) on delete cascade,
  business_name       text not null,
  registration_number text,
  contact_email       text,
  contact_phone       text,
  category            text not null
                        check (category in ('translation','visa','accommodation','tutoring','legal')),
  description         text,
  location            text,
  accreditation_path  text,
  status              text not null default 'pending'
                        check (status in ('pending','verified','rejected')),
  rejection_reason    text,
  verified_at         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists providers_status_idx on public.providers (status);

-- a verified provider's services appear in the marketplace; everything else stays hidden
alter table public.services
  add column if not exists provider_id uuid references public.providers (id) on delete cascade,
  add column if not exists is_active boolean not null default true;

-- ===========================================================================
-- bookings (US-17)
-- ===========================================================================
create table if not exists public.bookings (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  service_id    uuid not null references public.services (id) on delete restrict,
  scheduled_for timestamptz not null,
  status        text not null default 'pending'
                  check (status in ('pending','confirmed','completed','cancelled')),
  notes         text,
  reference     text not null unique,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- a booking may not be made for a moment that has already passed
  constraint booking_not_in_past check (scheduled_for > created_at)
);

create index if not exists bookings_user_idx on public.bookings (user_id);
create index if not exists bookings_service_idx on public.bookings (service_id);

-- human-readable confirmation reference, e.g. NAV-7Q3K2M
create or replace function public.set_booking_reference()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if new.reference is null or new.reference = '' then
    new.reference := 'NAV-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_set_reference on public.bookings;
create trigger bookings_set_reference
  before insert on public.bookings
  for each row execute function public.set_booking_reference();

-- ===========================================================================
-- notifications (US-18)
-- ===========================================================================
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  type       text not null
               check (type in ('application_status','booking','deadline_reminder',
                               'provider_status','document_status','system')),
  title      text not null,
  body       text,
  link       text,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id, read_at);

-- raised by triggers below; security definer so it can write a row for a user
-- other than the one making the change (e.g. a provider confirming a booking)
create or replace function public.notify(
  p_user uuid, p_type text, p_title text, p_body text default null, p_link text default null
) returns void
language sql
security definer
set search_path = pg_catalog, public
as $$
  insert into public.notifications (user_id, type, title, body, link)
  values (p_user, p_type, p_title, p_body, p_link);
$$;

revoke execute on function public.notify(uuid, text, text, text, text) from public, anon, authenticated;

create or replace function public.on_application_status_change()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public as $$
begin
  if new.status is distinct from old.status then
    perform public.notify(new.user_id, 'application_status',
      'Application status updated',
      new.university || ' - ' || new.program || ' is now ' || new.status || '.',
      '/applications');
  end if;
  return new;
end; $$;

drop trigger if exists applications_notify_status on public.applications;
create trigger applications_notify_status
  after update on public.applications
  for each row execute function public.on_application_status_change();

create or replace function public.on_booking_change()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public as $$
begin
  if tg_op = 'INSERT' then
    perform public.notify(new.user_id, 'booking', 'Booking received',
      'Your booking ' || new.reference || ' has been received.', '/bookings');
  elsif new.status is distinct from old.status then
    perform public.notify(new.user_id, 'booking',
      'Booking ' || new.status,
      'Booking ' || new.reference || ' is now ' || new.status || '.', '/bookings');
  end if;
  return new;
end; $$;

drop trigger if exists bookings_notify on public.bookings;
create trigger bookings_notify
  after insert or update on public.bookings
  for each row execute function public.on_booking_change();

create or replace function public.on_document_status_change()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public as $$
begin
  if new.status is distinct from old.status then
    perform public.notify(new.user_id, 'document_status',
      'Document ' || new.status, new.name || ' is now ' || new.status || '.', '/documents');
  end if;
  return new;
end; $$;

drop trigger if exists documents_notify_status on public.documents;
create trigger documents_notify_status
  after update on public.documents
  for each row execute function public.on_document_status_change();

create or replace function public.on_provider_status_change()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public as $$
begin
  if new.status is distinct from old.status then
    perform public.notify(new.user_id, 'provider_status',
      'Provider application ' || new.status,
      coalesce(new.rejection_reason, 'Your provider registration is now ' || new.status || '.'),
      '/provider');
  end if;
  return new;
end; $$;

drop trigger if exists providers_notify_status on public.providers;
create trigger providers_notify_status
  after update on public.providers
  for each row execute function public.on_provider_status_change();

-- Deadline reminders. Inserts one reminder per application falling due in the
-- next seven days, at most once per application per day. Safe to run often.
create or replace function public.create_deadline_reminders()
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  made integer := 0;
begin
  insert into public.notifications (user_id, type, title, body, link)
  select a.user_id, 'deadline_reminder',
         'Deadline approaching',
         a.university || ' - ' || a.program || ' closes on ' || to_char(a.deadline, 'DD Mon YYYY') || '.',
         '/applications'
  from public.applications a
  where a.deadline is not null
    and a.status <> 'completed'
    and a.deadline between current_date and current_date + 7
    and not exists (
      select 1 from public.notifications n
      where n.user_id = a.user_id
        and n.type = 'deadline_reminder'
        and n.body like '%' || a.university || ' - ' || a.program || '%'
        and n.created_at > now() - interval '1 day'
    );
  get diagnostics made = row_count;
  return made;
end;
$$;

revoke execute on function public.create_deadline_reminders() from public, anon, authenticated;

-- ===========================================================================
-- reviews (US-22)
-- ===========================================================================
create table if not exists public.reviews (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  booking_id     uuid not null unique references public.bookings (id) on delete cascade,
  service_id     uuid not null references public.services (id) on delete cascade,
  rating         integer not null check (rating between 1 and 5),
  comment        text,
  removed        boolean not null default false,
  removed_reason text,
  created_at     timestamptz not null default now()
);

create index if not exists reviews_service_idx on public.reviews (service_id);

-- a review is only possible once the booking it refers to is completed
create or replace function public.enforce_review_eligibility()
returns trigger language plpgsql
set search_path = pg_catalog, public as $$
declare ok boolean;
begin
  select exists (
    select 1 from public.bookings b
    where b.id = new.booking_id and b.user_id = new.user_id and b.status = 'completed'
  ) into ok;
  if not ok then
    raise exception 'You can only review a booking of your own that has been completed.';
  end if;
  return new;
end; $$;

drop trigger if exists reviews_check_eligibility on public.reviews;
create trigger reviews_check_eligibility
  before insert on public.reviews
  for each row execute function public.enforce_review_eligibility();

-- ===========================================================================
-- testimonials (US-23)
-- ===========================================================================
create table if not exists public.testimonials (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users (id) on delete set null,
  quote         text not null,
  display_name  text,
  name_consent  boolean not null default false,
  status        text not null default 'pending'
                  check (status in ('pending','approved','rejected')),
  created_at    timestamptz not null default now(),
  approved_at   timestamptz
);

-- ===========================================================================
-- guides (US-25)
-- ===========================================================================
create table if not exists public.guides (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null,
  language   text not null check (language in ('en','fr','pt')),
  category   text not null check (category in ('saqa','visa','university','accommodation')),
  title      text not null,
  summary    text,
  body       text not null,
  sources    jsonb not null default '[]'::jsonb,
  published  boolean not null default true,
  created_at timestamptz not null default now(),
  unique (slug, language)
);

-- ===========================================================================
-- admin audit log (US-21)
-- ===========================================================================
create table if not exists public.admin_actions (
  id           uuid primary key default gen_random_uuid(),
  admin_id     uuid not null references auth.users (id) on delete cascade,
  action       text not null,
  target_table text,
  target_id    uuid,
  detail       jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists admin_actions_created_idx on public.admin_actions (created_at desc);

-- ===========================================================================
-- updated_at triggers for the new tables
-- ===========================================================================
drop trigger if exists providers_set_updated_at on public.providers;
create trigger providers_set_updated_at before update on public.providers
  for each row execute function public.set_updated_at();

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Trigger functions live in the public schema, so PostgREST publishes them as
-- RPC endpoints. They would error on NEW outside a trigger, but a SECURITY
-- DEFINER function should not be reachable from the internet at all.
-- PostgreSQL checks EXECUTE when a trigger is created rather than each time it
-- fires, so revoking here does not stop the triggers working.
-- ---------------------------------------------------------------------------
revoke execute on function public.on_application_status_change() from public, anon, authenticated;
revoke execute on function public.on_booking_change()            from public, anon, authenticated;
revoke execute on function public.on_document_status_change()    from public, anon, authenticated;
revoke execute on function public.on_provider_status_change()    from public, anon, authenticated;
revoke execute on function public.set_booking_reference()        from public, anon, authenticated;
revoke execute on function public.enforce_review_eligibility()   from public, anon, authenticated;
