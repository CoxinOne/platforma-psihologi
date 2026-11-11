-- =============================================================================
-- 0023 — Specializări pentru psihologia educațională, muncii, securității și transporturilor
-- =============================================================================
set search_path = public, extensions;

insert into public.specialties (slug, name, description, sort_order)
values
  ('psihologie-educationala', 'Psihologie educațională și consiliere școlară',
   'Consiliere școlară, orientare vocațională și sprijin pentru elevi, părinți și cadre didactice.', 45),
  ('psihologia-muncii-organizationala', 'Psihologia muncii și organizațională',
   'Evaluare și consiliere pentru persoane și organizații, selecție, dezvoltare și climat de lucru.', 55),
  ('psihologie-securitate-nationala', 'Psihologie aplicată în domeniul securității naționale',
   'Psihologie aplicată în domeniul securității naționale, conform atestării profesionale.', 57),
  ('psihologia-transporturilor', 'Psihologia transporturilor',
   'Evaluare psihologică și consiliere pentru siguranța și performanța în transporturi.', 59)
on conflict (slug) do nothing;
