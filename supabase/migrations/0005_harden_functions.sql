-- NavigSA — function hardening
-- Run this AFTER 0004_lock_privileged_columns.sql.
--
-- Both items were raised by Supabase's own security advisor.

-- ---------------------------------------------------------------------------
-- 1. set_updated_at had a mutable search_path.
--
-- A function without a pinned search_path resolves unqualified names using
-- whatever the caller's search_path happens to be, so a caller could in
-- principle shadow an object it relies on. Pinning removes the question.
-- ---------------------------------------------------------------------------
alter function public.set_updated_at()
  set search_path = pg_catalog, public, pg_temp;

-- ---------------------------------------------------------------------------
-- 2. handle_new_user was reachable as a public RPC.
--
-- It is a trigger function, but anything in the public schema is also
-- published by PostgREST — so it was callable as
-- POST /rest/v1/rpc/handle_new_user, by anon, as SECURITY DEFINER.
--
-- Called outside a trigger it errors on NEW, so there is no known exploit,
-- but a SECURITY DEFINER function should not be reachable from the internet
-- at all.
--
-- PostgreSQL checks EXECUTE when a trigger is CREATED, not each time it
-- fires, so revoking does not affect signup. Verified against this database:
-- inserting an auth.users row inside a rolled-back block still produced the
-- matching profiles row, with first_name copied from the metadata.
-- ---------------------------------------------------------------------------
revoke execute on function public.handle_new_user()
  from public, anon, authenticated;
