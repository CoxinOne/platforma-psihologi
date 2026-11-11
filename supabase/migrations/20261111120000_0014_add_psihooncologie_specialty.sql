-- =============================================================================
-- 0014 — Specializare suplimentară: psihooncologie
-- =============================================================================
set search_path = public, extensions;

insert into public.specialties (slug, name, description, sort_order)
values (
  'psihooncologie',
  'Psihooncologie',
  'Suport emoțional pentru persoanele diagnosticate cu cancer și pentru aparținătorii lor.',
  130
)
on conflict (slug) do nothing;
