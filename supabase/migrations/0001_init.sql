-- NavigSA — initial schema
-- Run this in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user, created automatically on signup
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id                      uuid primary key references auth.users (id) on delete cascade,
  email                   text,
  first_name              text,
  last_name               text,
  phone                   text,
  country_of_origin       text,
  preferred_language      text not null default 'en'
                            check (preferred_language in ('en', 'pt', 'fr', 'es')),
  field_of_study          text,
  intended_start_year     integer,
  preferred_universities  text[] not null default '{}',
  id_document_type        text,
  id_document_number      text,
  verification_status     text not null default 'pending'
                            check (verification_status in ('pending', 'verified', 'rejected')),
  verified_at             timestamptz,
  onboarding_completed    boolean not null default false,
  notification_prefs      jsonb not null default '{"application_updates": true, "document_verification": true, "new_messages": true, "deadline_reminders": true}'::jsonb,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- applications: university applications owned by a student
-- ---------------------------------------------------------------------------
create table if not exists public.applications (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references auth.users (id) on delete cascade,
  university             text not null,
  program                text not null,
  status                 text not null default 'pending'
                           check (status in ('pending', 'in-progress', 'completed')),
  progress               integer not null default 0 check (progress between 0 and 100),
  deadline               date,
  submitted_date         date,
  requirements_total     integer not null default 0 check (requirements_total >= 0),
  requirements_completed integer not null default 0 check (requirements_completed >= 0),
  next_step              text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists applications_user_id_idx on public.applications (user_id);

-- ---------------------------------------------------------------------------
-- documents: metadata rows; the file itself lives in the `documents` bucket
-- ---------------------------------------------------------------------------
create table if not exists public.documents (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  application_id   uuid references public.applications (id) on delete set null,
  name             text not null,
  type             text not null default 'Other'
                     check (type in ('Identity', 'Academic', 'Language', 'Application', 'Financial', 'Other')),
  storage_path     text not null,
  size_bytes       bigint not null default 0,
  mime_type        text,
  status           text not null default 'pending'
                     check (status in ('pending', 'verified', 'rejected')),
  rejection_reason text,
  uploaded_at      timestamptz not null default now()
);

create index if not exists documents_user_id_idx on public.documents (user_id);
create index if not exists documents_application_id_idx on public.documents (application_id);

-- ---------------------------------------------------------------------------
-- services: the provider marketplace. Public catalogue, readable by anyone
-- signed in; not owned by students.
-- ---------------------------------------------------------------------------
create table if not exists public.services (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  provider      text not null,
  category      text not null
                  check (category in ('translation', 'visa', 'accommodation', 'tutoring', 'legal')),
  description   text,
  rating        numeric(2,1) not null default 0 check (rating between 0 and 5),
  reviews       integer not null default 0,
  price         text,
  location      text,
  delivery_time text,
  verified      boolean not null default false,
  featured      boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- keep updated_at honest
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- auto-create a profile row when someone signs up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
