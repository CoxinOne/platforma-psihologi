-- =============================================================================
-- 0005 — Notificări, jurnal de audit, raportări, cereri GDPR, rate limiting
-- =============================================================================
set search_path = public, extensions;

-- -----------------------------------------------------------------------------
-- notifications — în aplicație; nu conțin conținutul mesajelor private
-- -----------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text,
  action_url text,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_title_length check (char_length(title) between 1 and 140),
  constraint notifications_body_length check (body is null or char_length(body) <= 500)
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);
create index if not exists notifications_unread_idx
  on public.notifications (user_id) where read_at is null;

-- -----------------------------------------------------------------------------
-- notification_preferences
-- -----------------------------------------------------------------------------
create table if not exists public.notification_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  in_app boolean not null default true,
  email_messages boolean not null default false,
  email_appointments boolean not null default true,
  updated_at timestamptz not null default now()
);

comment on table public.notification_preferences is
  'Preferințe de notificare. E-mailurile nu includ niciodată conținutul mesajelor.';

create trigger notification_preferences_set_updated_at
  before update on public.notification_preferences
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- audit_logs — fără parole, tokenuri sau conținutul conversațiilor
-- -----------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  actor_role public.user_role,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip inet,
  user_agent text,
  created_at timestamptz not null default now(),
  constraint audit_action_length check (char_length(action) between 3 and 80)
);

comment on table public.audit_logs is
  'Jurnal de securitate și activitate administrativă. Nu conține conținut privat.';

create index if not exists audit_logs_created_idx on public.audit_logs (created_at desc);
create index if not exists audit_logs_actor_idx on public.audit_logs (actor_id, created_at desc);
create index if not exists audit_logs_action_idx on public.audit_logs (action, created_at desc);

-- -----------------------------------------------------------------------------
-- abuse_reports
-- -----------------------------------------------------------------------------
create table if not exists public.abuse_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reported_user_id uuid not null references public.profiles (id) on delete cascade,
  conversation_id uuid references public.conversations (id) on delete set null,
  category text not null,
  details text,
  status public.report_status not null default 'open',
  handled_by uuid references public.profiles (id) on delete set null,
  resolution_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint abuse_reports_not_self check (reporter_id <> reported_user_id),
  constraint abuse_category_allowed check (category in ('spam', 'harassment', 'inappropriate', 'impersonation', 'other')),
  constraint abuse_details_length check (details is null or char_length(details) <= 2000),
  constraint abuse_resolution_length check (resolution_note is null or char_length(resolution_note) <= 2000)
);

create index if not exists abuse_reports_status_idx on public.abuse_reports (status, created_at desc);

create trigger abuse_reports_set_updated_at
  before update on public.abuse_reports
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- contact_messages — formular public; scris doar de server (service role)
-- -----------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  handled_at timestamptz,
  constraint contact_name_length check (char_length(name) between 2 and 120),
  constraint contact_subject_length check (char_length(subject) between 2 and 160),
  constraint contact_message_length check (char_length(message) between 10 and 4000),
  constraint contact_status_allowed check (status in ('new', 'read', 'archived'))
);

create index if not exists contact_messages_created_idx on public.contact_messages (created_at desc);

-- -----------------------------------------------------------------------------
-- data_requests — solicitări GDPR de export / ștergere
-- -----------------------------------------------------------------------------
create table if not exists public.data_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type public.data_request_type not null,
  status public.data_request_status not null default 'pending',
  note text,
  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  processed_by uuid references public.profiles (id) on delete set null,
  constraint data_request_note_length check (note is null or char_length(note) <= 1000)
);

create index if not exists data_requests_status_idx on public.data_requests (status, requested_at);

-- -----------------------------------------------------------------------------
-- rate_limit_events — limitare abuzivă la nivel de bază de date
-- -----------------------------------------------------------------------------
create table if not exists public.rate_limit_events (
  id bigint generated always as identity primary key,
  bucket text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_events_bucket_idx
  on public.rate_limit_events (bucket, created_at desc);

-- -----------------------------------------------------------------------------
-- platform_settings — setări administrative (cheie/valoare JSON)
-- -----------------------------------------------------------------------------
create table if not exists public.platform_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  description text,
  is_public boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

create trigger platform_settings_set_updated_at
  before update on public.platform_settings
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Notificări automate la mesaje (fără conținutul mesajului)
-- -----------------------------------------------------------------------------
create or replace function public.notify_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recipient uuid;
  v_sender_name text;
  v_recipient_role public.user_role;
  v_action_url text;
begin
  select case
           when c.client_id = new.sender_id then c.psychologist_id
           else c.client_id
         end
    into v_recipient
    from public.conversations c
   where c.id = new.conversation_id;

  if v_recipient is null then
    return new;
  end if;

  select full_name, role into v_sender_name, v_recipient_role
    from public.profiles
   where id = new.sender_id;

  v_action_url := case
    when v_recipient_role = 'psychologist' then '/cabinet/mesaje/'
    else '/dashboard/mesaje/'
  end || new.conversation_id::text;

  insert into public.notifications (user_id, type, title, body, action_url, metadata)
  values (
    v_recipient,
    'message_new',
    'Mesaj nou',
    coalesce(v_sender_name, 'Un utilizator') || ' ți-a trimis un mesaj privat.',
    v_action_url,
    jsonb_build_object('conversation_id', new.conversation_id)
  );

  return new;
end;
$$;

create trigger messages_notify_recipient
  after insert on public.messages
  for each row execute function public.notify_on_message();

-- -----------------------------------------------------------------------------
-- Notificări automate la programări
-- -----------------------------------------------------------------------------
create or replace function public.notify_on_appointment_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_name text;
begin
  if new.status <> 'pending' then
    return new;
  end if;

  select full_name into v_client_name from public.profiles where id = new.client_id;

  insert into public.notifications (user_id, type, title, body, action_url, metadata)
  values (
    new.psychologist_id,
    'appointment_requested',
    'Solicitare nouă de programare',
    coalesce(v_client_name, 'Un client') || ' a solicitat o ședință. Verifică cererea în panou.',
    '/cabinet/programari',
    jsonb_build_object('appointment_id', new.id)
  );

  return new;
end;
$$;

create trigger appointments_notify_insert
  after insert on public.appointments
  for each row execute function public.notify_on_appointment_insert();

create or replace function public.notify_on_appointment_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_type public.notification_type;
  v_title text;
  v_body text;
  v_recipient uuid;
  v_url text;
begin
  if new.status = old.status then
    return new;
  end if;

  if new.status = 'confirmed' then
    v_type := 'appointment_confirmed';
    v_title := 'Programare confirmată';
    v_body := 'Programarea ta a fost confirmată. Detaliile sunt disponibile în cont.';
    v_recipient := new.client_id;
    v_url := '/dashboard/programari';
  elsif new.status = 'rejected' then
    v_type := 'appointment_rejected';
    v_title := 'Programare respinsă';
    v_body := 'Solicitarea de programare a fost respinsă. Poți alege alt interval disponibil.';
    v_recipient := new.client_id;
    v_url := '/dashboard/programari';
  elsif new.status = 'cancelled' then
    v_type := 'appointment_cancelled';
    v_title := 'Programare anulată';
    v_body := 'O programare a fost anulată. Verifică detaliile în cont.';
    v_recipient := case when new.cancelled_by = new.client_id then new.psychologist_id else new.client_id end;
    v_url := case when new.cancelled_by = new.client_id then '/cabinet/programari' else '/dashboard/programari' end;
  elsif new.status = 'completed' then
    v_type := 'appointment_completed';
    v_title := 'Ședință finalizată';
    v_body := 'Ședința a fost marcată ca finalizată.';
    v_recipient := new.client_id;
    v_url := '/dashboard/programari';
  else
    return new;
  end if;

  insert into public.notifications (user_id, type, title, body, action_url, metadata)
  values (
    v_recipient,
    v_type,
    v_title,
    v_body,
    v_url,
    jsonb_build_object('appointment_id', new.id, 'status', new.status)
  );

  return new;
end;
$$;

create trigger appointments_notify_update
  after update of status on public.appointments
  for each row execute function public.notify_on_appointment_update();
