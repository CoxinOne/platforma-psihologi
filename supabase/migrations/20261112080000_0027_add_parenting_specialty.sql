-- =============================================================================
-- 0027 — Specializare suplimentară: parenting
-- =============================================================================
set search_path = public, extensions;

insert into public.specialties (slug, name, description, sort_order)
values (
  'parenting',
  'Parenting',
  'Sprijin pentru părinți în relația cu copiii: comunicare, limite sănătoase, educație emoțională și echilibru familial.',
  52
)
on conflict (slug) do nothing;
