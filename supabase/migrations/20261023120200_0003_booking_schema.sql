-- =============================================================================
-- 0003 — Programări și disponibilitate
-- =============================================================================
-- Regula centrală anti-suprapunere este impusă de baza de date prin constrângeri
-- de excludere GiST, nu doar de codul aplicației. Două rezervări simultane pentru
-- același interval eșuează una dintre ele, indiferent de concurență.
-- =============================================================================
set search_path = public, extensions;

-- -----------------------------------------------------------------------------
-- availability_rules — program săptămânal recurent
-- weekday: 0 = duminică ... 6 = sâmbătă (aceeași convenție ca EXTRACT(DOW)).
-- Orele sunt locale în fusul orar al psihologului.
-- -----------------------------------------------------------------------------
create table if not exists public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  psychologist_id uuid not null references public.psychologist_profiles (user_id) on delete cascade,
  weekday smallint not null,
  start_time time not null,
  end_time time not null,
  slot_step_minutes integer not null default 30,
  mode public.consultation_mode not null default 'online',
  cabinet_id uuid references public.cabinets (id) on delete set null,
  valid_from date,
  valid_to date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint availability_weekday_range check (weekday between 0 and 6),
  constraint availability_time_order check (start_time < end_time),
  constraint availability_step_range check (slot_step_minutes between 10 and 120),
  constraint availability_validity_order check (valid_to is null or valid_from is null or valid_from <= valid_to)
);

comment on table public.availability_rules is
  'Program săptămânal. slot_step_minutes este pasul dintre începuturile posibile de ședință.';

create index if not exists availability_rules_psychologist_idx
  on public.availability_rules (psychologist_id, weekday) where is_active;

create trigger availability_rules_set_updated_at
  before update on public.availability_rules
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- availability_exceptions — zile libere sau program special pentru o dată
-- -----------------------------------------------------------------------------
create table if not exists public.availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  psychologist_id uuid not null references public.psychologist_profiles (user_id) on delete cascade,
  exception_date date not null,
  is_closed boolean not null default true,
  start_time time,
  end_time time,
  slot_step_minutes integer not null default 30,
  note text,
  created_at timestamptz not null default now(),
  constraint availability_exception_unique unique (psychologist_id, exception_date),
  constraint availability_exception_times check (
    is_closed
    or (start_time is not null and end_time is not null and start_time < end_time)
  ),
  constraint availability_exception_step check (slot_step_minutes between 10 and 120),
  constraint availability_exception_note_length check (note is null or char_length(note) <= 500)
);

create index if not exists availability_exceptions_psychologist_date_idx
  on public.availability_exceptions (psychologist_id, exception_date);

-- -----------------------------------------------------------------------------
-- appointments
-- -----------------------------------------------------------------------------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  psychologist_id uuid not null references public.psychologist_profiles (user_id) on delete restrict,
  cabinet_id uuid references public.cabinets (id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  duration_minutes integer not null,
  mode public.consultation_mode not null,
  status public.appointment_status not null default 'pending',
  timezone text not null default 'Europe/Bucharest',
  price_ron numeric(10, 2),
  currency text not null default 'RON',
  client_note text,
  psychologist_note text,
  cancellation_reason text,
  cancelled_by uuid references public.profiles (id) on delete set null,
  rescheduled_from uuid references public.appointments (id) on delete set null,
  rescheduled_at timestamptz,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_time_order check (ends_at > starts_at),
  constraint appointments_duration_range check (duration_minutes between 20 and 120),
  constraint appointments_duration_matches check (
    ends_at = starts_at + make_interval(mins => duration_minutes)
  ),
  constraint appointments_client_note_length check (client_note is null or char_length(client_note) <= 1000),
  constraint appointments_psychologist_note_length check (psychologist_note is null or char_length(psychologist_note) <= 4000),
  constraint appointments_cancel_reason_length check (cancellation_reason is null or char_length(cancellation_reason) <= 500),
  constraint appointments_currency_check check (currency = 'RON'),
  constraint appointments_price_positive check (price_ron is null or price_ron >= 0),
  constraint appointments_cabinet_required_for_in_person check (
    mode <> 'in_person' or cabinet_id is not null
  ),
  constraint appointments_no_psychologist_overlap exclude using gist (
    psychologist_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('pending', 'confirmed')),
  constraint appointments_no_client_overlap exclude using gist (
    client_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('pending', 'confirmed')),
  constraint appointments_no_self_booking check (client_id <> psychologist_id)
);

comment on table public.appointments is
  'Programări. Constrângerile de excludere blochează suprapunerea pentru aceeași persoană cât timp statusul este pending/confirmed.';

create index if not exists appointments_psychologist_time_idx
  on public.appointments (psychologist_id, starts_at);
create index if not exists appointments_client_time_idx
  on public.appointments (client_id, starts_at desc);
create index if not exists appointments_status_idx
  on public.appointments (status, starts_at);

create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

-- Tranziții de status permise. Reschedule readuce o programare confirmată în
-- pending, ceea ce este permis explicit.
create or replace function public.enforce_appointment_transition()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if old.status = 'pending' and new.status in ('confirmed', 'rejected', 'cancelled') then
    return new;
  end if;
  if old.status = 'confirmed' and new.status in ('pending', 'cancelled', 'completed', 'no_show') then
    return new;
  end if;
  if old.status = 'rejected' and new.status = 'cancelled' then
    return new;
  end if;

  raise exception 'APPOINTMENT_INVALID_TRANSITION'
    using errcode = 'P0001',
          detail = format('Tranziție nepermisă: %s -> %s', old.status, new.status);
end;
$$;

create trigger appointments_enforce_transition
  before update of status on public.appointments
  for each row execute function public.enforce_appointment_transition();
