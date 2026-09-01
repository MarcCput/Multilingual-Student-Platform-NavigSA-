-- NavigSA — row level security + document storage
-- Run this AFTER 0001_init.sql.

-- ---------------------------------------------------------------------------
-- Every table is deny-by-default once RLS is on. Students may only ever touch
-- rows where user_id = their own auth uid.
-- ---------------------------------------------------------------------------
alter table public.profiles     enable row level security;
alter table public.applications enable row level security;
alter table public.documents    enable row level security;
alter table public.services     enable row level security;

-- profiles ------------------------------------------------------------------
drop policy if exists "read own profile"   on public.profiles;
drop policy if exists "insert own profile" on public.profiles;
drop policy if exists "update own profile" on public.profiles;

create policy "read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- the signup trigger normally creates this row; this covers manual repair
create policy "insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- applications --------------------------------------------------------------
drop policy if exists "read own applications"   on public.applications;
drop policy if exists "insert own applications" on public.applications;
drop policy if exists "update own applications" on public.applications;
drop policy if exists "delete own applications" on public.applications;

create policy "read own applications"
  on public.applications for select
  using (auth.uid() = user_id);

create policy "insert own applications"
  on public.applications for insert
  with check (auth.uid() = user_id);

create policy "update own applications"
  on public.applications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "delete own applications"
  on public.applications for delete
  using (auth.uid() = user_id);

-- documents -----------------------------------------------------------------
drop policy if exists "read own documents"   on public.documents;
drop policy if exists "insert own documents" on public.documents;
drop policy if exists "update own documents" on public.documents;
drop policy if exists "delete own documents" on public.documents;

create policy "read own documents"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "insert own documents"
  on public.documents for insert
  with check (auth.uid() = user_id);

-- students may rename/refile a document, but verification_status is set by
-- staff via the service role, which bypasses RLS entirely.
create policy "update own documents"
  on public.documents for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "delete own documents"
  on public.documents for delete
  using (auth.uid() = user_id);

-- services ------------------------------------------------------------------
-- public catalogue: any signed-in user reads it, nobody writes it from the
-- browser (seed/manage it with the service role or the dashboard).
drop policy if exists "signed-in users read services" on public.services;

create policy "signed-in users read services"
  on public.services for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Storage: private `documents` bucket, 10MB cap, PDF/JPG/PNG only.
-- Files are stored under <user-id>/<filename>, and the policies below pin
-- the first path segment to the caller's uid so nobody can read anyone
-- else's uploads.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update
  set file_size_limit   = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types,
      public             = excluded.public;

drop policy if exists "read own files"   on storage.objects;
drop policy if exists "upload own files" on storage.objects;
drop policy if exists "update own files" on storage.objects;
drop policy if exists "delete own files" on storage.objects;

create policy "read own files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "upload own files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "update own files"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "delete own files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
