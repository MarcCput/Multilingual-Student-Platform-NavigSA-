-- NavigSA — let providers list services without letting them grade themselves
-- Run AFTER 0008_enforce_suspension.sql.
--
-- 0007 gave providers a row-level right to manage their own services, but the
-- table still carried its original blanket column privileges. A provider could
-- therefore have inserted a service with rating = 5.0, reviews = 999,
-- featured = true and verified = true. Those columns describe the provider,
-- they are not the provider's to set.

revoke insert, update on public.services from anon, authenticated;

grant insert (name, category, description, price, location, delivery_time,
              provider_id, is_active)
  on public.services to authenticated;

grant update (name, category, description, price, location, delivery_time,
              is_active)
  on public.services to authenticated;

-- The display name must be the registered business name, not free text, or one
-- provider could list services under another's name. Set by trigger from the
-- provider record; the column is not granted, so the client cannot supply it.
create or replace function public.set_service_provider_name()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public as $$
begin
  if new.provider_id is not null then
    select business_name into new.provider
      from public.providers where id = new.provider_id;
  end if;
  return new;
end; $$;
revoke execute on function public.set_service_provider_name() from public, anon, authenticated;

drop trigger if exists services_set_provider_name on public.services;
create trigger services_set_provider_name
  before insert or update on public.services
  for each row execute function public.set_service_provider_name();

-- The shield shown on a service follows the provider's verification, so it is
-- kept in step whenever an administrator changes that status.
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
   where id = p_provider returning user_id into owner;
  if owner is null then raise exception 'No such provider.'; end if;

  update public.services set verified = (p_status = 'verified')
   where provider_id = p_provider;

  if p_status = 'verified' then
    update public.profiles set role = 'provider' where id = owner and role = 'student';
  end if;
  perform public.log_admin_action('provider.' || p_status, 'providers', p_provider,
    jsonb_build_object('reason', p_reason));
end; $$;
revoke execute on function public.admin_set_provider_status(uuid, text, text) from public, anon;
grant execute on function public.admin_set_provider_status(uuid, text, text) to authenticated;
