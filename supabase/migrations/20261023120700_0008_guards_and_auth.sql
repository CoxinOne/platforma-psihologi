-- =============================================================================
-- 0008 — Trigger-e de integritate și creare automată a profilului de cont
-- =============================================================================
set search_path = public, extensions;

-- -----------------------------------------------------------------------------
-- La înregistrare: profil + preferințe implicite.
-- Funcția rulează ca definer, deci poate scrie în profiles fără politică INSERT.
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_requested public.user_role;
  v_terms timestamptz;
begin
  v_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    split_part(coalesce(new.email, 'utilizator'), '@', 1)
  );

  if char_length(v_name) < 2 then
    v_name := 'Utilizator';
  end if;

  v_requested := case
    when new.raw_user_meta_data ->> 'requested_role' = 'psychologist' then 'psychologist'::public.user_role
    else null
  end;

  v_terms := case
    when (new.raw_user_meta_data ->> 'terms_accepted_at') ~ '^\d{4}-\d{2}-\d{2}T'
      then (new.raw_user_meta_data ->> 'terms_accepted_at')::timestamptz
    else now()
  end;

  insert into public.profiles (
    id, full_name, email, requested_role, terms_accepted_at, privacy_accepted_at
  ) values (
    new.id,
    left(v_name, 120),
    lower(coalesce(new.email, '')),
    v_requested,
    v_terms,
    v_terms
  )
  on conflict (id) do nothing;

  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Profil de cont: utilizatorul nu își poate schimba rolul, statusul sau emailul.
-- -----------------------------------------------------------------------------
create or replace function public.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin()
     or coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') = 'service_role' then
    return new;
  end if;

  if auth.uid() is distinct from old.id then
    raise exception 'NOT_ALLOWED' using errcode = 'P0001';
  end if;

  if new.role is distinct from old.role then
    raise exception 'ROLE_CHANGE_FORBIDDEN' using errcode = 'P0001';
  end if;
  if new.status is distinct from old.status then
    raise exception 'STATUS_CHANGE_FORBIDDEN' using errcode = 'P0001';
  end if;
  if new.email is distinct from old.email then
    raise exception 'EMAIL_CHANGE_FORBIDDEN' using errcode = 'P0001';
  end if;
  if new.is_demo is distinct from old.is_demo then
    raise exception 'DEMO_FLAG_FORBIDDEN' using errcode = 'P0001';
  end if;
  if new.terms_accepted_at is distinct from old.terms_accepted_at
     or new.privacy_accepted_at is distinct from old.privacy_accepted_at then
    raise exception 'CONSENT_TIMESTAMP_FORBIDDEN' using errcode = 'P0001';
  end if;
  if new.requested_role is distinct from old.requested_role
     and new.requested_role is not null
     and new.requested_role <> 'psychologist' then
    raise exception 'ROLE_REQUEST_FORBIDDEN' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_update on public.profiles;
create trigger profiles_guard_update
  before update on public.profiles
  for each row execute function public.guard_profile_update();

-- -----------------------------------------------------------------------------
-- Profil profesional: utilizatorul nu se poate auto-aproba și nu poate falsifica
-- marcajul de verificare.
-- -----------------------------------------------------------------------------
create or replace function public.guard_psychologist_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin()
     or coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') = 'service_role' then
    return new;
  end if;

  if new.user_id is distinct from old.user_id then
    raise exception 'NOT_ALLOWED' using errcode = 'P0001';
  end if;

  if new.status is distinct from old.status and new.status not in ('draft', 'pending') then
    raise exception 'PROFILE_STATUS_FORBIDDEN' using errcode = 'P0001';
  end if;

  if new.verified_at is distinct from old.verified_at
     or new.verified_by is distinct from old.verified_by
     or new.is_demo is distinct from old.is_demo
     or new.published_at is distinct from old.published_at then
    raise exception 'VERIFICATION_FIELDS_FORBIDDEN' using errcode = 'P0001';
  end if;

  if new.status = 'pending' and old.status <> 'pending' then
    if new.bio is null or char_length(new.bio) < 80 then
      raise exception 'PROFILE_INCOMPLETE_BIO' using errcode = 'P0001';
    end if;
    if new.education is null or char_length(new.education) < 20 then
      raise exception 'PROFILE_INCOMPLETE_EDUCATION' using errcode = 'P0001';
    end if;
    if not exists (select 1 from public.psychologist_specialties where psychologist_id = new.user_id) then
      raise exception 'PROFILE_INCOMPLETE_SPECIALTIES' using errcode = 'P0001';
    end if;
    if 'in_person' = any (new.consultation_modes)
       and not exists (select 1 from public.psychologist_cabinets where psychologist_id = new.user_id) then
      raise exception 'PROFILE_INCOMPLETE_CABINET' using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists psychologist_profiles_guard_update on public.psychologist_profiles;
create trigger psychologist_profiles_guard_update
  before update on public.psychologist_profiles
  for each row execute function public.guard_psychologist_profile();

-- -----------------------------------------------------------------------------
-- Disponibilitate: doar proprietarul, iar cabinetul trebuie să-i aparțină.
-- -----------------------------------------------------------------------------
create or replace function public.guard_availability_rule()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin()
     and coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') <> 'service_role'
     and auth.uid() is distinct from new.psychologist_id then
    raise exception 'NOT_ALLOWED' using errcode = 'P0001';
  end if;

  if new.cabinet_id is not null and not exists (
    select 1 from public.psychologist_cabinets
     where psychologist_id = new.psychologist_id and cabinet_id = new.cabinet_id
  ) then
    raise exception 'CABINET_NOT_OWNED' using errcode = 'P0001';
  end if;

  if new.mode = 'in_person' and new.cabinet_id is null then
    raise exception 'CABINET_REQUIRED' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists availability_rules_guard on public.availability_rules;
create trigger availability_rules_guard
  before insert or update on public.availability_rules
  for each row execute function public.guard_availability_rule();

create or replace function public.guard_availability_exception()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin()
     and coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') <> 'service_role'
     and auth.uid() is distinct from new.psychologist_id then
    raise exception 'NOT_ALLOWED' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists availability_exceptions_guard on public.availability_exceptions;
create trigger availability_exceptions_guard
  before insert or update on public.availability_exceptions
  for each row execute function public.guard_availability_exception();

-- -----------------------------------------------------------------------------
-- Mesajele sunt imutabile. Ștergerea este permisă doar în fluxuri server-side
-- (ștergerea contului), unde auth.uid() este null.
-- -----------------------------------------------------------------------------
create or replace function public.guard_message_immutability()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    raise exception 'MESSAGES_IMMUTABLE' using errcode = 'P0001';
  end if;
  if tg_op = 'DELETE' and auth.uid() is not null then
    raise exception 'MESSAGES_IMMUTABLE' using errcode = 'P0001';
  end if;
  return old;
end;
$$;

drop trigger if exists messages_immutable_update on public.messages;
create trigger messages_immutable_update
  before update on public.messages
  for each row execute function public.guard_message_immutability();

drop trigger if exists messages_immutable_delete on public.messages;
create trigger messages_immutable_delete
  before delete on public.messages
  for each row execute function public.guard_message_immutability();
