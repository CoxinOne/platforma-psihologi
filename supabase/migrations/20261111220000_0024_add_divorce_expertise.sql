-- =============================================================================
-- 0024 — Specializare: expertiză psihologică a copilului și familiei în divorț
-- =============================================================================
set search_path = public, extensions;

insert into public.specialties (slug, name, description, sort_order)
values (
  'expertiza-psihologica-divort',
  'Expertiză psihologică în divorț',
  'Evaluare psihologică a copilului și familiei aflate în situație de divorț.',
  75
)
on conflict (slug) do nothing;
