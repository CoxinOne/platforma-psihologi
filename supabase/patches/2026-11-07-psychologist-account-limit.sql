-- Patch pentru proiecte Supabase existente (create inainte de 07.11.2026).
-- Ruleaza o singura data in SQL Editor. Include: inregistrare publica doar client,
-- dezactivarea cererilor de cont profesional si limita de 12 conturi de psiholog.

-- =============================================================================
-- 0013 — Conturi publice doar pentru clienți; maximum 12 conturi de psiholog
-- =============================================================================
set search_path = public, extensions;

-- -----------------------------------------------------------------------------
-- 1. Înregistrarea publică creează exclusiv conturi de client.
-- Metadata `requested_role` este ignorată intenționat, chiar dacă un client
-- încearcă să o trimită direct către Supabase Auth.
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_terms timestamptz;
begin
  v_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    split_part(coalesce(new.email, 'utilizator'), '@', 1)
  );

  if char_length(v_name) < 2 then
    v_name := 'Utilizator';
  end if;

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
    null,
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

-- Cererile publice de cont profesional sunt dezactivate. Conturile se creează
-- de administrator prin promovarea unui cont de client existent.
create or replace function public.request_psychologist_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  raise exception 'PSYCHOLOGIST_SIGNUP_DISABLED' using errcode = 'P0001';
end;
$$;

comment on function public.request_psychologist_account() is
  'Dezactivată: conturile de psiholog sunt create exclusiv de administrator.';

-- -----------------------------------------------------------------------------
-- 2. Limită dură de 12 conturi de psiholog.
-- Trigger-ul serializează schimbările de rol cu un advisory lock, ca două
-- promovări simultane să nu poată depăși limita.
-- -----------------------------------------------------------------------------
create or replace function public.enforce_psychologist_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_check boolean;
begin
  if tg_op = 'INSERT' then
    v_check := new.role = 'psychologist';
  else
    v_check := new.role = 'psychologist' and old.role is distinct from 'psychologist';
  end if;

  if v_check then
    perform pg_advisory_xact_lock(hashtextextended('psychologist-limit', 0));

    select count(*) into v_count
      from public.profiles
     where role = 'psychologist'
       and status <> 'deleted'
       and id <> new.id;

    if v_count >= 12 then
      raise exception 'PSYCHOLOGIST_LIMIT_REACHED' using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_limit_psychologists_insert on public.profiles;
create trigger profiles_limit_psychologists_insert
  before insert on public.profiles
  for each row execute function public.enforce_psychologist_limit();

drop trigger if exists profiles_limit_psychologists_update on public.profiles;
create trigger profiles_limit_psychologists_update
  before update of role on public.profiles
  for each row execute function public.enforce_psychologist_limit();

-- -----------------------------------------------------------------------------
-- 3. Rolurile administrative verifică limita înainte de update, pentru un mesaj
-- de eroare clar. Trigger-ul rămâne garanția finală.
-- -----------------------------------------------------------------------------
create or replace function public.admin_set_user_role(p_user uuid, p_role public.user_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_old public.profiles%rowtype;
  v_admins integer;
  v_psychologists integer;
begin
  if not public.is_admin() then
    raise exception 'NOT_ALLOWED' using errcode = 'P0001';
  end if;
  if p_user = v_actor then
    raise exception 'CANNOT_CHANGE_OWN_ROLE' using errcode = 'P0001';
  end if;

  select * into v_old from public.profiles where id = p_user;
  if not found then
    raise exception 'USER_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_old.role = p_role then
    return;
  end if;

  if v_old.role = 'admin' and p_role <> 'admin' then
    select count(*) into v_admins from public.profiles
     where role = 'admin' and status = 'active' and id <> p_user;
    if v_admins < 1 then
      raise exception 'LAST_ADMIN' using errcode = 'P0001';
    end if;
  end if;

  if p_role = 'psychologist' and v_old.role <> 'psychologist' then
    select count(*) into v_psychologists
      from public.profiles
     where role = 'psychologist' and status <> 'deleted' and id <> p_user;
    if v_psychologists >= 12 then
      raise exception 'PSYCHOLOGIST_LIMIT_REACHED' using errcode = 'P0001';
    end if;
  end if;

  update public.profiles
     set role = p_role,
         requested_role = null
   where id = p_user;

  if v_old.role = 'psychologist' and p_role <> 'psychologist' then
    update public.psychologist_profiles
       set status = 'suspended',
           published_at = null
     where user_id = p_user and status <> 'draft';
  end if;

  insert into public.notifications (user_id, type, title, body, action_url)
  values (
    p_user,
    'account_status',
    'Rolul contului a fost actualizat',
    'Rolul contului tău a fost modificat de administrator.',
    '/dashboard'
  );

  insert into public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
  values (
    v_actor, 'admin', 'admin.user.role_changed', 'profile', p_user::text,
    jsonb_build_object('old_role', v_old.role, 'new_role', p_role)
  );
end;
$$;

-- Curăță cererile publice rămase din versiunile anterioare.
-- Trigger-ul de protecție a profilului blochează update-uri din SQL Editor,
-- deci îl dezactivăm doar pe durata acestei migrații.
alter table public.profiles disable trigger profiles_guard_update;

update public.profiles
   set requested_role = null
 where requested_role = 'psychologist'
   and role = 'client';

alter table public.profiles enable trigger profiles_guard_update;
