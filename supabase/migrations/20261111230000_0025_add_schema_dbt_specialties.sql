-- =============================================================================
-- 0025 — Specializări: terapia schemelor cognitive și terapie dialectic-comportamentală
-- =============================================================================
set search_path = public, extensions;

insert into public.specialties (slug, name, description, sort_order)
values
  ('terapia-schemelor-cognitive', 'Terapia schemelor cognitive',
   'Intervenție asupra schemelor cognitive timpurii și a tiparelor relaționale profunde.', 25),
  ('terapie-dialectica-comportamentala', 'Terapie dialectic-comportamentală',
   'Intervenție structurată pentru reglarea emoțională, toleranța la stres și relații sănătoase.', 26)
on conflict (slug) do nothing;
