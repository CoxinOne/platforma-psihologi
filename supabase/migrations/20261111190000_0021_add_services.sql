-- =============================================================================
-- 0021 — Servicii oferite, listă publică opțională
-- =============================================================================
set search_path = public, extensions;

alter table public.psychologist_profiles
  add column if not exists services text[] not null default '{}'::text[];

create or replace view public.public_psychologists
with (security_barrier = true)
as
select
  pp.user_id,
  pp.slug,
  pp.display_name,
  pp.professional_title,
  pp.bio,
  pp.education,
  pp.experience,
  pp.languages,
  pp.consultation_modes,
  pp.session_duration_minutes,
  pp.price_ron,
  pp.photo_path,
  pp.is_accepting_new_clients,
  pp.is_demo,
  pp.timezone,
  (pp.verified_at is not null and not pp.is_demo) as is_verified,
  pp.published_at,
  coalesce(sp.specialties, '[]'::jsonb) as specialties,
  coalesce(sp.slugs, '{}'::text[]) as specialty_slugs,
  coalesce(cb.cabinets, '[]'::jsonb) as cabinets,
  coalesce(cb.cities, '{}'::text[]) as cabinet_cities,
  pp.website_url,
  pp.motto,
  pp.services
from public.psychologist_profiles pp
left join lateral (
  select
    jsonb_agg(jsonb_build_object('slug', s.slug, 'name', s.name) order by s.sort_order, s.name) as specialties,
    array_agg(s.slug order by s.sort_order, s.name) as slugs
  from public.psychologist_specialties ps
  join public.specialties s on s.id = ps.specialty_id
  where ps.psychologist_id = pp.user_id and s.is_active
) sp on true
left join lateral (
  select
    jsonb_agg(
      jsonb_build_object(
        'id', c.id,
        'slug', c.slug,
        'name', c.name,
        'address_line', c.address_line,
        'city', c.city,
        'county', c.county,
        'phone', c.phone
      ) order by pc.is_primary desc, c.name
    ) as cabinets,
    array_agg(distinct c.city) as cities
  from public.psychologist_cabinets pc
  join public.cabinets c on c.id = pc.cabinet_id
  where pc.psychologist_id = pp.user_id and c.is_active
) cb on true
where pp.status = 'approved';
