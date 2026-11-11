-- =============================================================================
-- 0019 — Specializare suplimentară: terapie de cuplu Imago
-- =============================================================================
set search_path = public, extensions;

insert into public.specialties (slug, name, description, sort_order)
values (
  'terapie-cuplu-imago',
  'Terapie de cuplu Imago',
  'Terapie relațională pentru cupluri, bazată pe abordarea Imago.',
  65
)
on conflict (slug) do nothing;
