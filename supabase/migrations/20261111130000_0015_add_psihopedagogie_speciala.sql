-- =============================================================================
-- 0015 — Specializare suplimentară: psihopedagogie specială
-- =============================================================================
set search_path = public, extensions;

insert into public.specialties (slug, name, description, sort_order)
values (
  'psihopedagogie-speciala',
  'Psihopedagogie specială',
  'Evaluare și intervenție pentru copii cu dizabilități, tulburări de dezvoltare și cerințe educaționale speciale.',
  140
)
on conflict (slug) do nothing;
