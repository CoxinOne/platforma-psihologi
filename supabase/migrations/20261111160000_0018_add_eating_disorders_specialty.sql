-- =============================================================================
-- 0018 — Specializare suplimentară: tulburări ale conduitei alimentare
-- =============================================================================
set search_path = public, extensions;

insert into public.specialties (slug, name, description, sort_order)
values (
  'tulburari-alimentare',
  'Tulburări ale conduitei alimentare',
  'Evaluare și intervenție psihologică pentru tulburări de alimentație și relația cu corpul.',
  150
)
on conflict (slug) do nothing;
