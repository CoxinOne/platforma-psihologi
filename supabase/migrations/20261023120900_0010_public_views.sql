-- =============================================================================
-- 0010 — View-uri publice (singura cale de citire pentru anon)
-- =============================================================================
-- View-urile sunt deținute de rolul de migrare și filtrează explicit statusul
-- aprobat. Nu expun email, telefon, note de verificare sau alte date private.
-- =============================================================================
set search_path = public, extensions;

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
  coalesce(cb.cities, '{}'::text[]) as cabinet_cities
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

comment on view public.public_psychologists is
  'Profiluri profesionale aprobate. Nu conține date de contact private sau note de verificare.';

create or replace view public.public_specialties
with (security_barrier = true)
as
select
  s.id,
  s.slug,
  s.name,
  s.description,
  s.sort_order,
  (
    select count(*)
      from public.psychologist_specialties ps
      join public.psychologist_profiles pp on pp.user_id = ps.psychologist_id
     where ps.specialty_id = s.id and pp.status = 'approved'
  ) as psychologist_count
from public.specialties s
where s.is_active
order by s.sort_order, s.name;

create or replace view public.public_cabinets
with (security_barrier = true)
as
select
  c.id,
  c.slug,
  c.name,
  c.address_line,
  c.city,
  c.county,
  c.postal_code,
  c.phone,
  c.description,
  c.is_demo,
  (
    select count(*)
      from public.psychologist_cabinets pc
      join public.psychologist_profiles pp on pp.user_id = pc.psychologist_id
     where pc.cabinet_id = c.id and pp.status = 'approved'
  ) as psychologist_count
from public.cabinets c
where c.is_active
order by c.city, c.name;

create or replace view public.public_psychologist_specialties
with (security_barrier = true)
as
select ps.psychologist_id, s.slug, s.name
from public.psychologist_specialties ps
join public.specialties s on s.id = ps.specialty_id
join public.psychologist_profiles pp on pp.user_id = ps.psychologist_id
where pp.status = 'approved' and s.is_active;

create or replace view public.public_psychologist_cabinets
with (security_barrier = true)
as
select pc.psychologist_id, c.id as cabinet_id, c.slug, c.name, c.city, c.address_line, c.phone
from public.psychologist_cabinets pc
join public.cabinets c on c.id = pc.cabinet_id
join public.psychologist_profiles pp on pp.user_id = pc.psychologist_id
where pp.status = 'approved' and c.is_active;

-- -----------------------------------------------------------------------------
-- Acces la view-uri
-- -----------------------------------------------------------------------------
revoke all on public.public_psychologists from anon, authenticated;
revoke all on public.public_specialties from anon, authenticated;
revoke all on public.public_cabinets from anon, authenticated;
revoke all on public.public_psychologist_specialties from anon, authenticated;
revoke all on public.public_psychologist_cabinets from anon, authenticated;

grant select on public.public_psychologists to anon, authenticated;
grant select on public.public_specialties to anon, authenticated;
grant select on public.public_cabinets to anon, authenticated;
grant select on public.public_psychologist_specialties to anon, authenticated;
grant select on public.public_psychologist_cabinets to anon, authenticated;

-- Cheia de serviciu este folosită pe server pentru operațiuni administrative
-- și pentru verificări operaționale; are nevoie de SELECT pe view-uri.
grant select on public.public_psychologists to service_role;
grant select on public.public_specialties to service_role;
grant select on public.public_cabinets to service_role;
grant select on public.public_psychologist_specialties to service_role;
grant select on public.public_psychologist_cabinets to service_role;

-- View-urile nu trebuie să fie modificabile.
revoke insert, update, delete on public.public_psychologists from anon, authenticated;
revoke insert, update, delete on public.public_specialties from anon, authenticated;
revoke insert, update, delete on public.public_cabinets from anon, authenticated;
