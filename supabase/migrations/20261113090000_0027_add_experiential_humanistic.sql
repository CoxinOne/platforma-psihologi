-- =============================================================================
-- 0027 — Specializare: psihoterapie experiențial-umanistă
-- =============================================================================
set search_path = public, extensions;

insert into public.specialties (slug, name, description, sort_order)
values (
  'psihoterapie-experiential-umanista',
  'Psihoterapie experiențial-umanistă',
  'Abordare centrată pe experiența prezentă, relația terapeutică și resursele fiecărei persoane.',
  28
)
on conflict (slug) do nothing;
