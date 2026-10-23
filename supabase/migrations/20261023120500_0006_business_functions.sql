-- =============================================================================
-- 0006 — Funcții de business (disponibilitate, programări, mesagerie, GDPR)
-- =============================================================================
-- Toate funcțiile care modifică date rulează cu privilegii de definer și verifică
-- explicit identitatea și rolul. Nu se bazează pe UI sau pe RLS-ul apelantului.
-- =============================================================================
set search_path = public, extensions;

-- -----------------------------------------------------------------------------
-- Identitate și rol
-- -----------------------------------------------------------------------------
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
     where id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

create or replace function public.is_active_account()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
     where id = auth.uid() and status = 'active'
  );
$$;

create or replace function public.is_conversation_participant(p_conversation uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.conversation_participants
     where conversation_id = p_conversation and user_id = auth.uid()
  );
$$;

create or replace function public.shares_conversation_with(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.conversation_participants me
      join public.conversation_participants other
        on other.conversation_id = me.conversation_id
     where me.user_id = auth.uid()
       and other.user_id = p_user
       and p_user <> auth.uid()
  );
$$;

create or replace function public.has_appointment_with(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.appointments a
     where (a.client_id = auth.uid() and a.psychologist_id = p_user)
        or (a.psychologist_id = auth.uid() and a.client_id = p_user)
  );
$$;

-- -----------------------------------------------------------------------------
-- Setări
-- -----------------------------------------------------------------------------
create or replace function public.get_setting_int(p_key text, p_default integer)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select (value #>> '{}')::integer from public.platform_settings where key = p_key),
    p_default
  );
$$;

-- -----------------------------------------------------------------------------
-- Rate limiting persistent (nu depinde de memorie sau de un singur proces)
-- -----------------------------------------------------------------------------
create or replace function public.check_rate_limit(
  p_bucket text,
  p_max integer,
  p_window_seconds integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  select count(*) into v_count
    from public.rate_limit_events
   where bucket = p_bucket
     and created_at > now() - make_interval(secs => p_window_seconds);

  if v_count >= p_max then
    raise exception 'RATE_LIMITED'
      using errcode = 'P0001',
            detail = format('Prea multe operațiuni. Încearcă din nou peste %s secunde.', p_window_seconds);
  end if;

  insert into public.rate_limit_events (bucket) values (p_bucket);

  -- Curățare oportunistă, fără a bloca cererea.
  if random() < 0.02 then
    delete from public.rate_limit_events where created_at < now() - interval '48 hours';
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- Profilul propriu (datele private nu sunt expuse prin SELECT direct)
-- -----------------------------------------------------------------------------
create or replace function public.get_my_profile()
returns public.profiles
language sql
stable
security definer
set search_path = public
as $$
  select * from public.profiles where id = auth.uid();
$$;

create or replace function public.update_my_profile(
  p_full_name text,
  p_phone text,
  p_marketing_consent boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = 'P0001';
  end if;

  if p_full_name is null or char_length(btrim(p_full_name)) not between 2 and 120 then
    raise exception 'INVALID_FULL_NAME' using errcode = 'P0001';
  end if;

  if p_phone is not null and btrim(p_phone) <> '' and char_length(btrim(p_phone)) not between 6 and 30 then
    raise exception 'INVALID_PHONE' using errcode = 'P0001';
  end if;

  update public.profiles
     set full_name = btrim(p_full_name),
         phone = nullif(btrim(p_phone), ''),
         marketing_consent = coalesce(p_marketing_consent, false),
         marketing_consent_at = case
           when coalesce(p_marketing_consent, false) and not marketing_consent then now()
           when not coalesce(p_marketing_consent, false) then null
           else marketing_consent_at
         end
   where id = auth.uid();

  insert into public.audit_logs (actor_id, actor_role, action, entity_type, entity_id)
  values (auth.uid(), public.current_user_role(), 'profile.updated', 'profile', auth.uid()::text);
end;
$$;

create or replace function public.request_psychologist_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
begin
  select * into v_profile from public.profiles where id = auth.uid();
  if not found then
    raise exception 'NOT_AUTHENTICATED' using errcode = 'P0001';
  end if;
  if v_profile.role = 'psychologist' then
    raise exception 'ALREADY_PSYCHOLOGIST' using errcode = 'P0001';
  end if;
  if v_profile.role = 'admin' then
    raise exception 'INVALID_ROLE' using errcode = 'P0001';
  end if;
  if v_profile.requested_role = 'psychologist' then
    return;
  end if;

  perform public.check_rate_limit('role-request:' || auth.uid()::text, 3, 86400);

  update public.profiles set requested_role = 'psychologist' where id = auth.uid();

  insert into public.notifications (user_id, type, title, body, action_url)
  select p.id, 'system', 'Cerere de cont profesional',
         'Un utilizator a solicitat cont de psiholog. Verifică identitatea și calificările.',
         '/admin/conturi'
    from public.profiles p
   where p.role = 'admin' and p.status = 'active';

  insert into public.audit_logs (actor_id, actor_role, action, entity_type, entity_id)
  values (auth.uid(), v_profile.role, 'role.requested', 'profile', auth.uid()::text);
end;
$$;

-- -----------------------------------------------------------------------------
-- Disponibilitate
-- -----------------------------------------------------------------------------
create or replace function public.available_slots(
  p_psychologist uuid,
  p_date date,
  p_mode public.consultation_mode
)
returns table (starts_at timestamptz, ends_at timestamptz)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_timezone text;
  v_duration integer;
  v_status public.professional_status;
  v_accepting boolean;
  v_weekday integer;
  v_min_notice interval;
  v_min_start timestamptz;
  v_exception public.availability_exceptions%rowtype;
  v_has_exception boolean := false;
  v_rule record;
  v_wall_start timestamp;
  v_wall_end timestamp;
  v_slot timestamp;
  v_slot_start timestamptz;
  v_slot_end timestamptz;
  v_seen timestamptz[] := '{}';
  v_step integer;
  v_start_time time;
  v_end_time time;
begin
  select pp.timezone, pp.session_duration_minutes, pp.status, pp.is_accepting_new_clients
    into v_timezone, v_duration, v_status, v_accepting
    from public.psychologist_profiles pp
   where pp.user_id = p_psychologist;

  if not found or v_status <> 'approved' or not v_accepting then
    return;
  end if;

  if p_date < (now() at time zone v_timezone)::date then
    return;
  end if;

  v_min_notice := make_interval(hours => public.get_setting_int('min_notice_hours', 2));
  v_min_start := now() + v_min_notice;

  select * into v_exception
    from public.availability_exceptions
   where psychologist_id = p_psychologist and exception_date = p_date;
  v_has_exception := found;

  if v_has_exception and v_exception.is_closed then
    return;
  end if;

  if not v_has_exception then
    v_weekday := extract(dow from p_date)::integer;
    for v_rule in
      select r.start_time, r.end_time, r.slot_step_minutes
        from public.availability_rules r
       where r.psychologist_id = p_psychologist
         and r.weekday = v_weekday
         and r.mode = p_mode
         and r.is_active
         and (r.valid_from is null or r.valid_from <= p_date)
         and (r.valid_to is null or r.valid_to >= p_date)
       order by r.start_time
    loop
      v_start_time := v_rule.start_time;
      v_end_time := v_rule.end_time;
      v_step := v_rule.slot_step_minutes;

      if (p_date + v_end_time) at time zone v_timezone <= v_min_start then
        continue;
      end if;

      for v_slot in
        select generate_series(
          p_date + v_start_time,
          p_date + v_end_time - make_interval(mins => v_duration),
          make_interval(mins => v_step)
        )
      loop
        v_slot_start := v_slot at time zone v_timezone;
        v_slot_end := v_slot_start + make_interval(mins => v_duration);

        continue when v_slot_start < v_min_start;
        continue when v_slot_start = any (v_seen);
        v_seen := array_append(v_seen, v_slot_start);

        if not exists (
          select 1 from public.appointments a
           where a.psychologist_id = p_psychologist
             and a.status in ('pending', 'confirmed')
             and tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(v_slot_start, v_slot_end, '[)')
        ) then
          starts_at := v_slot_start;
          ends_at := v_slot_end;
          return next;
        end if;
      end loop;
    end loop;
    return;
  end if;

  -- Program special pentru acea zi
  v_start_time := v_exception.start_time;
  v_end_time := v_exception.end_time;
  v_step := v_exception.slot_step_minutes;

  for v_slot in
    select generate_series(
      p_date + v_start_time,
      p_date + v_end_time - make_interval(mins => v_duration),
      make_interval(mins => v_step)
    )
  loop
    v_slot_start := v_slot at time zone v_timezone;
    v_slot_end := v_slot_start + make_interval(mins => v_duration);

    continue when v_slot_start < v_min_start;
    continue when v_slot_start = any (v_seen);
    v_seen := array_append(v_seen, v_slot_start);

    if not exists (
      select 1 from public.appointments a
       where a.psychologist_id = p_psychologist
         and a.status in ('pending', 'confirmed')
         and tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(v_slot_start, v_slot_end, '[)')
    ) then
      starts_at := v_slot_start;
      ends_at := v_slot_end;
      return next;
    end if;
  end loop;
end;
$$;

create or replace function public.available_slots_range(
  p_psychologist uuid,
  p_from date,
  p_days integer,
  p_mode public.consultation_mode
)
returns table (day date, starts_at timestamptz, ends_at timestamptz)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  i integer;
  d date;
  s record;
begin
  if p_days is null or p_days < 1 then
    return;
  end if;
  if p_days > 31 then
    p_days := 31;
  end if;

  for i in 0 .. (p_days - 1) loop
    d := p_from + i;
    for s in select * from public.available_slots(p_psychologist, d, p_mode) loop
      day := d;
      starts_at := s.starts_at;
      ends_at := s.ends_at;
      return next;
    end loop;
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Programări
-- -----------------------------------------------------------------------------
create or replace function public.book_appointment(
  p_psychologist uuid,
  p_start timestamptz,
  p_mode public.consultation_mode,
  p_cabinet uuid default null,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_profile public.profiles%rowtype;
  v_psy public.psychologist_profiles%rowtype;
  v_end timestamptz;
  v_local_date date;
  v_cabinet uuid;
  v_id uuid;
  v_max_advance integer;
begin
  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = 'P0001';
  end if;

  select * into v_profile from public.profiles where id = v_uid;
  if not found or v_profile.status <> 'active' then
    raise exception 'ACCOUNT_INACTIVE' using errcode = 'P0001';
  end if;
  if v_profile.role <> 'client' then
    raise exception 'ONLY_CLIENTS_CAN_BOOK' using errcode = 'P0001';
  end if;
  if p_psychologist = v_uid then
    raise exception 'SELF_BOOKING_FORBIDDEN' using errcode = 'P0001';
  end if;

  select * into v_psy from public.psychologist_profiles where user_id = p_psychologist;
  if not found or v_psy.status <> 'approved' or not v_psy.is_accepting_new_clients then
    raise exception 'PSYCHOLOGIST_UNAVAILABLE' using errcode = 'P0001';
  end if;
  if not (p_mode = any (v_psy.consultation_modes)) then
    raise exception 'MODE_UNAVAILABLE' using errcode = 'P0001';
  end if;

  if p_start < now() + make_interval(hours => public.get_setting_int('min_notice_hours', 2)) then
    raise exception 'SLOT_IN_PAST' using errcode = 'P0001';
  end if;

  v_max_advance := public.get_setting_int('max_advance_days', 180);
  if p_start > now() + make_interval(days => v_max_advance) then
    raise exception 'SLOT_TOO_FAR' using errcode = 'P0001';
  end if;

  if p_note is not null and char_length(p_note) > 1000 then
    raise exception 'NOTE_TOO_LONG' using errcode = 'P0001';
  end if;

  perform public.check_rate_limit('booking:' || v_uid::text, 10, 3600);

  v_end := p_start + make_interval(mins => v_psy.session_duration_minutes);
  v_local_date := (p_start at time zone v_psy.timezone)::date;

  if p_mode = 'in_person' then
    select pc.cabinet_id into v_cabinet
      from public.psychologist_cabinets pc
      join public.cabinets c on c.id = pc.cabinet_id
     where pc.psychologist_id = p_psychologist
       and pc.cabinet_id = p_cabinet
       and c.is_active;
    if v_cabinet is null then
      raise exception 'CABINET_INVALID' using errcode = 'P0001';
    end if;
  else
    v_cabinet := null;
  end if;

  -- Serializează rezervările pentru același psiholog. Constrângerea de excludere
  -- rămâne plasa de siguranță finală.
  perform pg_advisory_xact_lock(hashtextextended(p_psychologist::text, 0));

  if not exists (
    select 1 from public.available_slots(p_psychologist, v_local_date, p_mode) s
     where s.starts_at = p_start
  ) then
    raise exception 'SLOT_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  insert into public.appointments (
    client_id, psychologist_id, cabinet_id, starts_at, ends_at, duration_minutes,
    mode, status, timezone, price_ron, client_note
  ) values (
    v_uid, p_psychologist, v_cabinet, p_start, v_end, v_psy.session_duration_minutes,
    p_mode, 'pending', v_psy.timezone, v_psy.price_ron, nullif(btrim(coalesce(p_note, '')), '')
  )
  returning id into v_id;

  insert into public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
  values (v_uid, v_profile.role, 'appointment.requested', 'appointment', v_id::text,
          jsonb_build_object('psychologist_id', p_psychologist, 'mode', p_mode));

  return v_id;
exception
  when exclusion_violation then
    raise exception 'SLOT_ALREADY_BOOKED' using errcode = 'P0001';
end;
$$;

create or replace function public.reschedule_appointment(
  p_appointment uuid,
  p_new_start timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_appt public.appointments%rowtype;
  v_psy public.psychologist_profiles%rowtype;
  v_local_date date;
  v_end timestamptz;
  v_window_hours integer;
begin
  select * into v_appt from public.appointments where id = p_appointment;
  if not found then
    raise exception 'APPOINTMENT_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_appt.client_id <> v_uid then
    raise exception 'NOT_ALLOWED' using errcode = 'P0001';
  end if;
  if v_appt.status not in ('pending', 'confirmed') then
    raise exception 'APPOINTMENT_NOT_CHANGEABLE' using errcode = 'P0001';
  end if;

  v_window_hours := public.get_setting_int('cancellation_window_hours', 24);
  if v_appt.starts_at < now() + make_interval(hours => v_window_hours) then
    raise exception 'RESCHEDULE_WINDOW_CLOSED' using errcode = 'P0001';
  end if;

  select * into v_psy from public.psychologist_profiles where user_id = v_appt.psychologist_id;
  v_end := p_new_start + make_interval(mins => v_psy.session_duration_minutes);
  v_local_date := (p_new_start at time zone v_psy.timezone)::date;

  if p_new_start < now() + make_interval(hours => public.get_setting_int('min_notice_hours', 2)) then
    raise exception 'SLOT_IN_PAST' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_appt.psychologist_id::text, 0));

  if not exists (
    select 1 from public.available_slots(v_appt.psychologist_id, v_local_date, v_appt.mode) s
     where s.starts_at = p_new_start
  ) then
    raise exception 'SLOT_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  update public.appointments
     set starts_at = p_new_start,
         ends_at = v_end,
         status = 'pending',
         confirmed_at = null,
         rescheduled_at = now()
   where id = p_appointment;

  insert into public.notifications (user_id, type, title, body, action_url, metadata)
  values (
    v_appt.psychologist_id,
    'appointment_rescheduled',
    'Programare reprogramată',
    'Clientul a propus un interval nou. Solicitarea a revenit în așteptare.',
    '/cabinet/programari',
    jsonb_build_object('appointment_id', p_appointment, 'new_start', p_new_start)
  );

  insert into public.audit_logs (actor_id, actor_role, action, entity_type, entity_id)
  values (v_uid, 'client', 'appointment.rescheduled', 'appointment', p_appointment::text);
exception
  when exclusion_violation then
    raise exception 'SLOT_ALREADY_BOOKED' using errcode = 'P0001';
end;
$$;

create or replace function public.cancel_appointment(
  p_appointment uuid,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_appt public.appointments%rowtype;
  v_window_hours integer;
  v_reason text := nullif(btrim(coalesce(p_reason, '')), '');
begin
  select * into v_appt from public.appointments where id = p_appointment;
  if not found then
    raise exception 'APPOINTMENT_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_appt.client_id <> v_uid and v_appt.psychologist_id <> v_uid then
    raise exception 'NOT_ALLOWED' using errcode = 'P0001';
  end if;
  if v_appt.status not in ('pending', 'confirmed') then
    raise exception 'APPOINTMENT_NOT_CHANGEABLE' using errcode = 'P0001';
  end if;

  if v_uid = v_appt.client_id then
    v_window_hours := public.get_setting_int('cancellation_window_hours', 24);
    if v_appt.starts_at < now() + make_interval(hours => v_window_hours) then
      raise exception 'CANCELLATION_WINDOW_CLOSED' using errcode = 'P0001';
    end if;
  elsif v_reason is null or char_length(v_reason) < 3 then
    raise exception 'REASON_REQUIRED' using errcode = 'P0001';
  end if;

  if v_reason is not null and char_length(v_reason) > 500 then
    raise exception 'REASON_TOO_LONG' using errcode = 'P0001';
  end if;

  update public.appointments
     set status = 'cancelled',
         cancelled_at = now(),
         cancelled_by = v_uid,
         cancellation_reason = v_reason
   where id = p_appointment;

  insert into public.audit_logs (actor_id, actor_role, action, entity_type, entity_id)
  values (v_uid, public.current_user_role(), 'appointment.cancelled', 'appointment', p_appointment::text);
end;
$$;

create or replace function public.confirm_appointment(p_appointment uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_appt public.appointments%rowtype;
begin
  select * into v_appt from public.appointments where id = p_appointment;
  if not found then
    raise exception 'APPOINTMENT_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_appt.psychologist_id <> auth.uid() then
    raise exception 'NOT_ALLOWED' using errcode = 'P0001';
  end if;
  if v_appt.status <> 'pending' then
    raise exception 'APPOINTMENT_NOT_PENDING' using errcode = 'P0001';
  end if;

  update public.appointments
     set status = 'confirmed', confirmed_at = now()
   where id = p_appointment;

  insert into public.audit_logs (actor_id, actor_role, action, entity_type, entity_id)
  values (auth.uid(), 'psychologist', 'appointment.confirmed', 'appointment', p_appointment::text);
end;
$$;

create or replace function public.reject_appointment(p_appointment uuid, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_appt public.appointments%rowtype;
  v_reason text := nullif(btrim(coalesce(p_reason, '')), '');
begin
  select * into v_appt from public.appointments where id = p_appointment;
  if not found then
    raise exception 'APPOINTMENT_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_appt.psychologist_id <> auth.uid() then
    raise exception 'NOT_ALLOWED' using errcode = 'P0001';
  end if;
  if v_appt.status <> 'pending' then
    raise exception 'APPOINTMENT_NOT_PENDING' using errcode = 'P0001';
  end if;
  if v_reason is not null and char_length(v_reason) > 500 then
    raise exception 'REASON_TOO_LONG' using errcode = 'P0001';
  end if;

  update public.appointments
     set status = 'rejected', cancellation_reason = v_reason
   where id = p_appointment;

  insert into public.audit_logs (actor_id, actor_role, action, entity_type, entity_id)
  values (auth.uid(), 'psychologist', 'appointment.rejected', 'appointment', p_appointment::text);
end;
$$;

create or replace function public.complete_appointment(p_appointment uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_appt public.appointments%rowtype;
begin
  select * into v_appt from public.appointments where id = p_appointment;
  if not found then
    raise exception 'APPOINTMENT_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_appt.psychologist_id <> auth.uid() then
    raise exception 'NOT_ALLOWED' using errcode = 'P0001';
  end if;
  if v_appt.status <> 'confirmed' then
    raise exception 'APPOINTMENT_NOT_CONFIRMED' using errcode = 'P0001';
  end if;
  if v_appt.ends_at > now() then
    raise exception 'APPOINTMENT_NOT_ENDED' using errcode = 'P0001';
  end if;

  update public.appointments
     set status = 'completed', completed_at = now()
   where id = p_appointment;

  insert into public.audit_logs (actor_id, actor_role, action, entity_type, entity_id)
  values (auth.uid(), 'psychologist', 'appointment.completed', 'appointment', p_appointment::text);
end;
$$;

create or replace function public.set_appointment_note(p_appointment uuid, p_note text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_note is not null and char_length(p_note) > 4000 then
    raise exception 'NOTE_TOO_LONG' using errcode = 'P0001';
  end if;

  update public.appointments
     set psychologist_note = nullif(btrim(coalesce(p_note, '')), '')
   where id = p_appointment
     and psychologist_id = auth.uid();

  if not found then
    raise exception 'NOT_ALLOWED' using errcode = 'P0001';
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- Mesagerie
-- -----------------------------------------------------------------------------
create or replace function public.start_conversation(
  p_psychologist uuid,
  p_message text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_profile public.profiles%rowtype;
  v_psy public.psychologist_profiles%rowtype;
  v_conversation uuid;
  v_body text := nullif(btrim(coalesce(p_message, '')), '');
begin
  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = 'P0001';
  end if;

  select * into v_profile from public.profiles where id = v_uid;
  if not found or v_profile.status <> 'active' then
    raise exception 'ACCOUNT_INACTIVE' using errcode = 'P0001';
  end if;
  if v_profile.role <> 'client' then
    raise exception 'ONLY_CLIENTS_CAN_START' using errcode = 'P0001';
  end if;

  select * into v_psy from public.psychologist_profiles where user_id = p_psychologist;
  if not found or v_psy.status <> 'approved' then
    raise exception 'PSYCHOLOGIST_UNAVAILABLE' using errcode = 'P0001';
  end if;

  if v_body is not null and char_length(v_body) > 4000 then
    raise exception 'MESSAGE_TOO_LONG' using errcode = 'P0001';
  end if;

  select id into v_conversation
    from public.conversations
   where client_id = v_uid and psychologist_id = p_psychologist;

  if v_conversation is null then
    perform public.check_rate_limit('conversation:' || v_uid::text, 5, 3600);

    insert into public.conversations (client_id, psychologist_id)
    values (v_uid, p_psychologist)
    on conflict (client_id, psychologist_id) do nothing
    returning id into v_conversation;

    if v_conversation is null then
      select id into v_conversation
        from public.conversations
       where client_id = v_uid and psychologist_id = p_psychologist;
    end if;
  end if;

  insert into public.conversation_participants (conversation_id, user_id, role_in_conversation)
  values (v_conversation, v_uid, 'client')
  on conflict do nothing;

  insert into public.conversation_participants (conversation_id, user_id, role_in_conversation)
  values (v_conversation, p_psychologist, 'psychologist')
  on conflict do nothing;

  if v_body is not null then
    perform public.check_rate_limit('message:' || v_uid::text, 20, 60);
    insert into public.messages (conversation_id, sender_id, body)
    values (v_conversation, v_uid, v_body);
  else
    insert into public.notifications (user_id, type, title, body, action_url, metadata)
    values (
      p_psychologist,
      'message_new',
      'Conversație nouă',
      'Un client a început o conversație privată.',
      '/cabinet/mesaje',
      jsonb_build_object('conversation_id', v_conversation)
    );
  end if;

  return v_conversation;
end;
$$;

create or replace function public.send_message(p_conversation uuid, p_body text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_body text := btrim(coalesce(p_body, ''));
  v_conversation public.conversations%rowtype;
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = 'P0001';
  end if;
  if v_body = '' or char_length(v_body) < 1 then
    raise exception 'MESSAGE_EMPTY' using errcode = 'P0001';
  end if;
  if char_length(v_body) > 4000 then
    raise exception 'MESSAGE_TOO_LONG' using errcode = 'P0001';
  end if;

  select * into v_conversation from public.conversations where id = p_conversation;
  if not found then
    raise exception 'CONVERSATION_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_uid <> v_conversation.client_id and v_uid <> v_conversation.psychologist_id then
    raise exception 'NOT_ALLOWED' using errcode = 'P0001';
  end if;
  if v_conversation.closed_at is not null then
    raise exception 'CONVERSATION_CLOSED' using errcode = 'P0001';
  end if;

  perform public.check_rate_limit('message:' || v_uid::text, 20, 60);
  perform public.check_rate_limit('message-day:' || v_uid::text, 300, 86400);

  insert into public.messages (conversation_id, sender_id, body)
  values (p_conversation, v_uid, v_body)
  returning id into v_id;

  update public.conversation_participants
     set last_read_at = now()
   where conversation_id = p_conversation and user_id = v_uid;

  return v_id;
end;
$$;

create or replace function public.mark_conversation_read(p_conversation uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.conversation_participants
     set last_read_at = now()
   where conversation_id = p_conversation and user_id = auth.uid();
$$;

create or replace function public.list_conversations()
returns table (
  id uuid,
  counterpart_id uuid,
  counterpart_name text,
  counterpart_photo text,
  last_message_at timestamptz,
  last_message_preview text,
  unread_count bigint,
  closed_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    case when c.client_id = auth.uid() then c.psychologist_id else c.client_id end,
    p.full_name,
    pp.photo_path,
    c.last_message_at,
    left(lm.body, 140),
    coalesce((
      select count(*)
        from public.messages m
        join public.conversation_participants me
          on me.conversation_id = m.conversation_id and me.user_id = auth.uid()
       where m.conversation_id = c.id
         and m.sender_id <> auth.uid()
         and m.created_at > me.last_read_at
    ), 0),
    c.closed_at
  from public.conversations c
  join public.conversation_participants me
    on me.conversation_id = c.id and me.user_id = auth.uid()
  join public.profiles p
    on p.id = case when c.client_id = auth.uid() then c.psychologist_id else c.client_id end
  left join public.psychologist_profiles pp
    on pp.user_id = case when c.client_id = auth.uid() then c.psychologist_id else c.client_id end
  left join lateral (
    select m.body
      from public.messages m
     where m.conversation_id = c.id
     order by m.created_at desc
     limit 1
  ) lm on true
  order by c.last_message_at desc;
$$;

create or replace function public.unread_badge()
returns table (unread_notifications bigint, unread_messages bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*) from public.notifications n
      where n.user_id = auth.uid() and n.read_at is null),
    (select count(*)
       from public.messages m
       join public.conversation_participants me
         on me.conversation_id = m.conversation_id and me.user_id = auth.uid()
      where m.sender_id <> auth.uid()
        and m.created_at > me.last_read_at);
$$;

create or replace function public.mark_notification_read(p_notification uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.notifications
     set read_at = now()
   where id = p_notification and user_id = auth.uid();
$$;

create or replace function public.mark_all_notifications_read()
returns void
language sql
security definer
set search_path = public
as $$
  update public.notifications
     set read_at = now()
   where user_id = auth.uid() and read_at is null;
$$;

-- -----------------------------------------------------------------------------
-- Preferințe de notificare
-- -----------------------------------------------------------------------------
create or replace function public.get_notification_preferences()
returns public.notification_preferences
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.notification_preferences;
begin
  insert into public.notification_preferences (user_id)
  values (auth.uid())
  on conflict (user_id) do nothing;

  select * into v_row from public.notification_preferences where user_id = auth.uid();
  return v_row;
end;
$$;

create or replace function public.update_notification_preferences(
  p_in_app boolean,
  p_email_messages boolean,
  p_email_appointments boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = 'P0001';
  end if;

  insert into public.notification_preferences (user_id, in_app, email_messages, email_appointments)
  values (auth.uid(), coalesce(p_in_app, true), coalesce(p_email_messages, false), coalesce(p_email_appointments, true))
  on conflict (user_id) do update
    set in_app = excluded.in_app,
        email_messages = excluded.email_messages,
        email_appointments = excluded.email_appointments;
end;
$$;

-- -----------------------------------------------------------------------------
-- Raportări de abuz
-- -----------------------------------------------------------------------------
create or replace function public.report_abuse(
  p_reported_user uuid,
  p_conversation uuid,
  p_category text,
  p_details text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = 'P0001';
  end if;
  if p_reported_user = v_uid then
    raise exception 'CANNOT_REPORT_SELF' using errcode = 'P0001';
  end if;
  if p_category not in ('spam', 'harassment', 'inappropriate', 'impersonation', 'other') then
    raise exception 'INVALID_CATEGORY' using errcode = 'P0001';
  end if;
  if p_details is not null and char_length(p_details) > 2000 then
    raise exception 'DETAILS_TOO_LONG' using errcode = 'P0001';
  end if;

  if p_conversation is not null then
    if not public.is_conversation_participant(p_conversation) then
      raise exception 'NOT_ALLOWED' using errcode = 'P0001';
    end if;
    if not exists (
      select 1 from public.conversation_participants
       where conversation_id = p_conversation and user_id = p_reported_user
    ) then
      raise exception 'INVALID_CONVERSATION' using errcode = 'P0001';
    end if;
  elsif not public.shares_conversation_with(p_reported_user)
        and not public.has_appointment_with(p_reported_user) then
    raise exception 'NO_RELATION_TO_REPORT' using errcode = 'P0001';
  end if;

  perform public.check_rate_limit('report:' || v_uid::text, 5, 86400);

  insert into public.abuse_reports (reporter_id, reported_user_id, conversation_id, category, details)
  values (v_uid, p_reported_user, p_conversation, p_category, nullif(btrim(coalesce(p_details, '')), ''))
  returning id into v_id;

  insert into public.notifications (user_id, type, title, body, action_url, metadata)
  select p.id, 'abuse_report', 'Raportare nouă de abuz',
         'Un utilizator a trimis o raportare care necesită verificare.',
         '/admin/raportari', jsonb_build_object('report_id', v_id)
    from public.profiles p
   where p.role = 'admin' and p.status = 'active';

  insert into public.audit_logs (actor_id, actor_role, action, entity_type, entity_id)
  values (v_uid, public.current_user_role(), 'abuse.reported', 'abuse_report', v_id::text);

  return v_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- GDPR: cereri de export și ștergere
-- -----------------------------------------------------------------------------
create or replace function public.request_data_export()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = 'P0001';
  end if;

  perform public.check_rate_limit('export:' || auth.uid()::text, 3, 86400);

  insert into public.data_requests (user_id, type, status, note)
  values (auth.uid(), 'export', 'pending', 'Solicitare de export generată din cont.')
  returning id into v_id;

  insert into public.audit_logs (actor_id, actor_role, action, entity_type, entity_id)
  values (auth.uid(), public.current_user_role(), 'data.export_requested', 'data_request', v_id::text);

  return v_id;
end;
$$;

create or replace function public.request_account_deletion(p_reason text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = 'P0001';
  end if;
  if p_reason is not null and char_length(p_reason) > 1000 then
    raise exception 'REASON_TOO_LONG' using errcode = 'P0001';
  end if;

  perform public.check_rate_limit('deletion:' || auth.uid()::text, 3, 86400);

  insert into public.data_requests (user_id, type, status, note)
  values (auth.uid(), 'deletion', 'pending', nullif(btrim(coalesce(p_reason, '')), ''))
  returning id into v_id;

  insert into public.notifications (user_id, type, title, body, action_url, metadata)
  select p.id, 'data_request', 'Solicitare de ștergere a contului',
         'Un utilizator a solicitat ștergerea contului și a datelor asociate.',
         '/admin/cereri', jsonb_build_object('data_request_id', v_id)
    from public.profiles p
   where p.role = 'admin' and p.status = 'active';

  insert into public.audit_logs (actor_id, actor_role, action, entity_type, entity_id)
  values (auth.uid(), public.current_user_role(), 'data.deletion_requested', 'data_request', v_id::text);

  return v_id;
end;
$$;
