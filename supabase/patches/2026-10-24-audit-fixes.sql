-- =============================================================================
-- Patch pentru proiectele Supabase create ÎNAINTE de auditul din 24.10.2026
-- Rulează o singură dată în SQL Editor (sau ca migrație manuală).
-- Nu este necesar pentru o instalare nouă din migrațiile 0001–0012, unde
-- constrângerea este deja creată cu ON DELETE CASCADE.
-- =============================================================================

-- 1. Permite ștergerea unui psiholog care are programări. Fără această
--    modificare, ștergerea contului eșua cu o eroare de cheie externă.
alter table public.appointments
  drop constraint if exists appointments_psychologist_id_fkey;

alter table public.appointments
  add constraint appointments_psychologist_id_fkey
  foreign key (psychologist_id)
  references public.psychologist_profiles (user_id)
  on delete cascade;

-- 2. Cheia de serviciu trebuie să poată citi view-urile publice atunci când
--    este folosită pe server (administrare/verificări operaționale).
grant select on public.public_psychologists to service_role;
grant select on public.public_specialties to service_role;
grant select on public.public_cabinets to service_role;
grant select on public.public_psychologist_specialties to service_role;
grant select on public.public_psychologist_cabinets to service_role;

-- 3. Verificare rapidă (opțional):
--    select confdeltype from pg_constraint
--    where conname = 'appointments_psychologist_id_fkey';
--    -- 'c' = CASCADE
