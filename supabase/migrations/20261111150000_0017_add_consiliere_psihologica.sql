-- =============================================================================
-- 0017 — Specializare suplimentară: consiliere psihologică
-- =============================================================================
set search_path = public, extensions;

insert into public.specialties (slug, name, description, sort_order)
values (
  'consiliere-psihologica',
  'Consiliere psihologică',
  'Sprijin pentru dificultăți emoționale și relaționale, comunicare și dezvoltare personală.',
  15
)
on conflict (slug) do nothing;
