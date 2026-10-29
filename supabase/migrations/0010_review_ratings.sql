-- NavigSA — make review ratings drive the rating shown on a service (US-22)
-- Run AFTER 0009_provider_services.sql.
--
-- Reviews were saved and the one-per-booking rule held, but the stars shown in
-- the marketplace come from services.rating, which nothing recalculated. The
-- average is derived from the reviews themselves by trigger, so it cannot
-- drift from them: a review that is posted, edited, or removed by an
-- administrator moves the number in the same transaction.
--
-- Removed reviews do not count. A service with no visible reviews shows 0.
--
-- Note for the five seeded services: their original ratings (4.6 to 4.9) and
-- review counts were placeholder figures carried over from the design mock-up,
-- not real reviews. A service keeps its placeholder until it receives its first
-- real review, at which point the real figure replaces it.

create or replace function public.recompute_service_rating(p_service uuid)
returns void language sql security definer
set search_path = pg_catalog, public as $$
  update public.services s
     set rating  = coalesce((select round(avg(r.rating)::numeric, 1)
                               from public.reviews r
                              where r.service_id = p_service and r.removed = false), 0),
         reviews = (select count(*) from public.reviews r
                     where r.service_id = p_service and r.removed = false)
   where s.id = p_service;
$$;
revoke execute on function public.recompute_service_rating(uuid) from public, anon, authenticated;

create or replace function public.on_review_change()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public as $$
begin
  if tg_op in ('INSERT', 'UPDATE') then
    perform public.recompute_service_rating(new.service_id);
  end if;
  if tg_op = 'DELETE' or (tg_op = 'UPDATE' and old.service_id is distinct from new.service_id) then
    perform public.recompute_service_rating(old.service_id);
  end if;
  return coalesce(new, old);
end; $$;
revoke execute on function public.on_review_change() from public, anon, authenticated;

drop trigger if exists reviews_update_rating on public.reviews;
create trigger reviews_update_rating
  after insert or update or delete on public.reviews
  for each row execute function public.on_review_change();
