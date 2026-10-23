-- =============================================================================
-- 0007 — Funcții administrative (verificate în baza de date + audit)
-- =============================================================================
set search_path = public, extensions;

create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if not public.is_admin() then
    raise exception 'NOT_ALLOWED' using errcode = 'P0001';
  end if;

  select jsonb_build_object(
    'users_total', (select count(*) from public.profiles where status <> 'deleted'),
    'clients', (select count(*) from public.profiles where role = 'client' and status <> 'deleted'),
    'psychologists', (select count(*) from public.profiles where role = 'psychologist' and status <> 'deleted'),
    'admins', (select count(*) from public.profiles where role = 'admin' and status <> 'deleted'),
    'suspended', (select count(*) from public.profiles where status = 'suspended'),
    'role_requests', (select count(*) from public.profiles where requested_role = 'psychologist' and role = 'client'),
    'profiles_pending', (select count(*) from public.psychologist_profiles where status = 'pending'),
    'profiles_approved', (select count(*) from public.psychologist_profiles where status = 'approved'),
    'profiles_draft', (select count(*) from public.psychologist_profiles where status = 'draft'),
    'profiles_rejected', (select count(*) from public.psychologist_profiles where status = 'rejected'),
    'reports_open', (select count(*) from public.abuse_reports where status in ('open', 'in_review')),
    'data_requests_pending', (select count(*) from public.data_requests where status in ('pending', 'processing')),
    'appointments_pending', (select count(*) from public.appointments where status = 'pending'),
    'appointments_upcoming', (select count(*) from public.appointments where starts_at > now() and status in ('pending', 'confirmed')),
    'contact_new', (select count(*) from public.contact_messages where status = 'new'),
    'messages_total', (select count(*) from public.messages)
  ) into v_result;

  return v_result;
end;
$$;

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

create or replace function public.admin_set_account_status(
  p_user uuid,
  p_status public.account_status,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_old public.profiles%rowtype;
  v_reason text := nullif(btrim(coalesce(p_reason, '')), '');
begin
  if not public.is_admin() then
    raise exception 'NOT_ALLOWED' using errcode = 'P0001';
  end if;
  if p_user = v_actor then
    raise exception 'CANNOT_SUSPEND_SELF' using errcode = 'P0001';
  end if;
  if p_status not in ('active', 'suspended') then
    raise exception 'INVALID_STATUS' using errcode = 'P0001';
  end if;
  if p_status = 'suspended' and (v_reason is null or char_length(v_reason) < 10) then
    raise exception 'REASON_REQUIRED' using errcode = 'P0001';
  end if;
  if v_reason is not null and char_length(v_reason) > 1000 then
    raise exception 'REASON_TOO_LONG' using errcode = 'P0001';
  end if;

  select * into v_old from public.profiles where id = p_user;
  if not found then
    raise exception 'USER_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_old.status = p_status then
    return;
  end if;

  update public.profiles
     set status = p_status
   where id = p_user;

  if v_old.role = 'psychologist' then
    if p_status = 'suspended' then
      update public.psychologist_profiles
         set status = 'suspended', published_at = null
       where user_id = p_user;
    else
      update public.psychologist_profiles
         set status = 'pending'
       where user_id = p_user and status = 'suspended';
    end if;
  end if;

  insert into public.notifications (user_id, type, title, body, action_url)
  values (
    p_user,
    'account_status',
    case when p_status = 'suspended' then 'Cont suspendat' else 'Cont reactivat' end,
    case when p_status = 'suspended'
      then 'Contul tău a fost suspendat. Motivul este disponibil la administrator.'
      else 'Contul tău a fost reactivat. Profilul profesional necesită o nouă aprobare.'
    end,
    '/dashboard'
  );

  insert into public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
  values (
    v_actor, 'admin', 'admin.user.status_changed', 'profile', p_user::text,
    jsonb_build_object('old_status', v_old.status, 'new_status', p_status, 'reason', v_reason)
  );
end;
$$;

create or replace function public.admin_set_professional_status(
  p_user uuid,
  p_status public.professional_status,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_old public.psychologist_profiles%rowtype;
  v_reason text := nullif(btrim(coalesce(p_reason, '')), '');
begin
  if not public.is_admin() then
    raise exception 'NOT_ALLOWED' using errcode = 'P0001';
  end if;

  select * into v_old from public.psychologist_profiles where user_id = p_user;
  if not found then
    raise exception 'PROFILE_NOT_FOUND' using errcode = 'P0001';
  end if;

  if p_status = 'rejected' and (v_reason is null or char_length(v_reason) < 10) then
    raise exception 'REASON_REQUIRED' using errcode = 'P0001';
  end if;
  if v_reason is not null and char_length(v_reason) > 1000 then
    raise exception 'REASON_TOO_LONG' using errcode = 'P0001';
  end if;

  if p_status = 'approved' then
    if v_old.bio is null or char_length(v_old.bio) < 80 then
      raise exception 'PROFILE_INCOMPLETE' using errcode = 'P0001';
    end if;
    if v_old.education is null or char_length(v_old.education) < 20 then
      raise exception 'PROFILE_INCOMPLETE' using errcode = 'P0001';
    end if;
    if not exists (select 1 from public.psychologist_specialties where psychologist_id = p_user) then
      raise exception 'PROFILE_INCOMPLETE' using errcode = 'P0001';
    end if;
    if 'in_person' = any (v_old.consultation_modes)
       and not exists (select 1 from public.psychologist_cabinets where psychologist_id = p_user) then
      raise exception 'PROFILE_INCOMPLETE' using errcode = 'P0001';
    end if;
  end if;

  update public.psychologist_profiles
     set status = p_status,
         verified_at = case when p_status = 'approved' then now() else verified_at end,
         verified_by = case when p_status = 'approved' then v_actor else verified_by end,
         published_at = case
           when p_status = 'approved' then coalesce(published_at, now())
           when p_status in ('rejected', 'suspended') then null
           else published_at
         end,
         rejection_reason = case when p_status = 'rejected' then v_reason else null end
   where user_id = p_user;

  insert into public.notifications (user_id, type, title, body, action_url)
  values (
    p_user,
    'professional_status',
    case
      when p_status = 'approved' then 'Profil profesional aprobat'
      when p_status = 'rejected' then 'Profil profesional respins'
      when p_status = 'suspended' then 'Profil profesional suspendat'
      else 'Profil profesional actualizat'
    end,
    case
      when p_status = 'approved' then 'Profilul tău este public și poate primi solicitări.'
      when p_status = 'rejected' then 'Profilul necesită modificări. Verifică motivul în panoul de psiholog.'
      when p_status = 'suspended' then 'Profilul tău nu mai este public.'
      else 'Statusul profilului profesional a fost actualizat.'
    end,
    '/cabinet/profil'
  );

  insert into public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
  values (
    v_actor, 'admin', 'admin.professional.status_changed', 'psychologist_profile', p_user::text,
    jsonb_build_object('old_status', v_old.status, 'new_status', p_status, 'reason', v_reason)
  );
end;
$$;

create or replace function public.admin_process_data_request(
  p_request uuid,
  p_status public.data_request_status,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_request public.data_requests%rowtype;
begin
  if not public.is_admin() then
    raise exception 'NOT_ALLOWED' using errcode = 'P0001';
  end if;

  select * into v_request from public.data_requests where id = p_request;
  if not found then
    raise exception 'REQUEST_NOT_FOUND' using errcode = 'P0001';
  end if;

  update public.data_requests
     set status = p_status,
         processed_at = case when p_status in ('completed', 'rejected') then now() else processed_at end,
         processed_by = v_actor,
         note = coalesce(nullif(btrim(coalesce(p_note, '')), ''), note)
   where id = p_request;

  insert into public.notifications (user_id, type, title, body, action_url)
  values (
    v_request.user_id,
    'data_request',
    'Cerere de date actualizată',
    case when p_status = 'completed' then 'Cererea ta privind datele a fost finalizată.'
         when p_status = 'rejected' then 'Cererea ta privind datele a fost respinsă. Contactează administratorul.'
         else 'Cererea ta privind datele este în procesare.' end,
    '/dashboard/confidentialitate'
  );

  insert into public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
  values (
    v_actor, 'admin', 'admin.data_request.processed', 'data_request', p_request::text,
    jsonb_build_object('status', p_status)
  );
end;
$$;

create or replace function public.log_admin_action(
  p_action text,
  p_entity_type text,
  p_entity_id text,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'NOT_ALLOWED' using errcode = 'P0001';
  end if;

  insert into public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
  values (auth.uid(), 'admin', p_action, p_entity_type, p_entity_id, coalesce(p_metadata, '{}'::jsonb));
end;
$$;
