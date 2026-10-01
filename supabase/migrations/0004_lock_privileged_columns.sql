-- NavigSA — close the self-approval hole
-- Run this AFTER 0003_seed_services.sql.
--
-- The policies in 0002 scope every row to its owner, which is correct. But
-- "it is your row" is not the same as "you may change every column in it".
-- As written, a signed-in student could open the browser console and run:
--
--     supabase.from('documents').update({ status: 'verified' }).eq('id', mine)
--     supabase.from('profiles').update({ verification_status: 'verified' })
--
-- Both would have succeeded: the rows genuinely are theirs. The whole point
-- of a verification flag is that somebody independent set it, so these
-- columns must not be writable by the account they describe.
--
-- Row Level Security cannot express "this column, but not that one", so the
-- fix is Postgres column privileges, which apply underneath RLS. A request
-- touching a column with no grant is rejected outright.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
revoke insert, update on public.profiles from anon, authenticated;

-- the signup trigger (security definer) creates this row; the grant below
-- only covers the manual-repair path the insert policy exists for.
grant insert (id, email, first_name, last_name)
  on public.profiles to authenticated;

-- everything a student legitimately edits in onboarding and on the profile
-- page. Deliberately absent: verification_status, verified_at, id, email,
-- created_at, updated_at.
grant update (
  first_name,
  last_name,
  phone,
  country_of_origin,
  preferred_language,
  field_of_study,
  intended_start_year,
  preferred_universities,
  id_document_type,
  id_document_number,
  onboarding_completed,
  notification_prefs
) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- documents
-- ---------------------------------------------------------------------------
revoke insert, update on public.documents from anon, authenticated;

-- uploadDocument() sends exactly these columns. status is omitted on purpose,
-- so a new row always lands on the 'pending' default and cannot be born
-- pre-approved.
grant insert (
  user_id,
  application_id,
  name,
  type,
  storage_path,
  size_bytes,
  mime_type
) on public.documents to authenticated;

-- renaming or refiling a document is fine; judging it is not.
grant update (name, type, application_id)
  on public.documents to authenticated;

-- ---------------------------------------------------------------------------
-- A reviewer sets documents.status, documents.rejection_reason,
-- profiles.verification_status and profiles.verified_at server-side with the
-- service_role key, which bypasses both RLS and these grants.
--
-- Nothing in this file changes who can SELECT or DELETE their own rows, and
-- applications is untouched: its status and progress are the student's own
-- working notes, not a judgement about them.
-- ---------------------------------------------------------------------------
