-- =============================================================================
-- 0002 — Schema de bază: conturi, profiluri profesionale, specializări, cabinete
-- =============================================================================
set search_path = public, extensions;

-- -----------------------------------------------------------------------------
-- profiles — oglinda datelor de cont necesare aplicației.
-- Sursa de adevăr pentru autentificare rămâne auth.users (Supabase Auth).
-- Datele de contact (email, telefon) NU sunt expuse public prin RLS.
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'client',
  requested_role public.user_role,
  full_name text not null,
  email text not null,
  phone text,
  status public.account_status not null default 'active',
  is_demo boolean not null default false,
  terms_accepted_at timestamptz,
  privacy_accepted_at timestamptz,
  marketing_consent boolean not null default false,
  marketing_consent_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_length check (char_length(full_name) between 2 and 120),
  constraint profiles_phone_length check (phone is null or char_length(phone) between 6 and 30),
  constraint profiles_email_lowercase check (email = lower(email)),
  constraint profiles_requested_role_check check (requested_role is null or requested_role in ('client', 'psychologist'))
);

comment on table public.profiles is
  'Date de cont pentru toți utilizatorii. Rolul și statusul pot fi modificate doar de administrator prin funcții auditate.';
comment on column public.profiles.requested_role is
  'Intenția declarată la înregistrare (ex. psiholog). Nu acordă drepturi; administratorul decide.';
comment on column public.profiles.email is
  'Copie pentru administrare; nu se acordă SELECT pe această coloană rolului authenticated.';

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_status_idx on public.profiles (status);
create index if not exists profiles_email_lower_idx on public.profiles (lower(email));

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- specialties — taxonomie administrată de administrator
-- -----------------------------------------------------------------------------
create table if not exists public.specialties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint specialties_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint specialties_name_length check (char_length(name) between 2 and 120)
);

create index if not exists specialties_active_idx on public.specialties (is_active, sort_order);

create trigger specialties_set_updated_at
  before update on public.specialties
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- psychologist_profiles — datele profesionale, separate de contul privat.
-- Profilul devine public doar după aprobarea administratorului (status=approved).
-- -----------------------------------------------------------------------------
create table if not exists public.psychologist_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  slug text not null unique,
  display_name text not null,
  professional_title text not null,
  bio text,
  education text,
  experience text,
  languages text[] not null default array['română']::text[],
  consultation_modes public.consultation_mode[] not null default array['online']::public.consultation_mode[],
  session_duration_minutes integer not null default 50,
  price_ron numeric(10, 2),
  timezone text not null default 'Europe/Bucharest',
  photo_path text,
  status public.professional_status not null default 'draft',
  is_accepting_new_clients boolean not null default true,
  is_demo boolean not null default false,
  professional_registry_number text,
  verification_note text,
  verified_at timestamptz,
  verified_by uuid references public.profiles (id) on delete set null,
  rejection_reason text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint psychologist_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint psychologist_display_name_length check (char_length(display_name) between 2 and 120),
  constraint psychologist_title_length check (char_length(professional_title) between 2 and 160),
  constraint psychologist_duration_range check (session_duration_minutes between 20 and 120),
  constraint psychologist_price_positive check (price_ron is null or price_ron >= 0),
  constraint psychologist_modes_not_empty check (array_length(consultation_modes, 1) >= 1),
  constraint psychologist_languages_not_empty check (array_length(languages, 1) >= 1),
  constraint psychologist_bio_length check (bio is null or char_length(bio) <= 6000),
  constraint psychologist_education_length check (education is null or char_length(education) <= 4000),
  constraint psychologist_experience_length check (experience is null or char_length(experience) <= 4000),
  constraint psychologist_approved_requires_verification check (
    status <> 'approved' or (verified_at is not null and published_at is not null)
  )
);

comment on table public.psychologist_profiles is
  'Profil profesional. Nu se publică automat: necesită aprobare administrativă și verificarea calificărilor.';
comment on column public.psychologist_profiles.professional_registry_number is
  'Număr de înregistrare profesională, folosit exclusiv la verificare. Nu este expus public.';

create index if not exists psychologist_profiles_status_idx
  on public.psychologist_profiles (status) where status = 'approved';
create index if not exists psychologist_profiles_slug_idx on public.psychologist_profiles (slug);

create trigger psychologist_profiles_set_updated_at
  before update on public.psychologist_profiles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- psychologist_specialties
-- -----------------------------------------------------------------------------
create table if not exists public.psychologist_specialties (
  psychologist_id uuid not null references public.psychologist_profiles (user_id) on delete cascade,
  specialty_id uuid not null references public.specialties (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (psychologist_id, specialty_id)
);

create index if not exists psychologist_specialties_specialty_idx
  on public.psychologist_specialties (specialty_id);

-- -----------------------------------------------------------------------------
-- cabinets — locații fizice; informații publice
-- -----------------------------------------------------------------------------
create table if not exists public.cabinets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  address_line text not null,
  city text not null,
  county text,
  postal_code text,
  phone text,
  description text,
  is_active boolean not null default true,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cabinets_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint cabinets_name_length check (char_length(name) between 2 and 160),
  constraint cabinets_city_length check (char_length(city) between 2 and 80),
  constraint cabinets_postal_code_format check (postal_code is null or postal_code ~ '^[0-9]{6}$')
);

create index if not exists cabinets_city_idx on public.cabinets (city) where is_active;

create trigger cabinets_set_updated_at
  before update on public.cabinets
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- psychologist_cabinets — legătura psiholog ↔ cabinet
-- -----------------------------------------------------------------------------
create table if not exists public.psychologist_cabinets (
  psychologist_id uuid not null references public.psychologist_profiles (user_id) on delete cascade,
  cabinet_id uuid not null references public.cabinets (id) on delete restrict,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (psychologist_id, cabinet_id)
);

create unique index if not exists psychologist_one_primary_cabinet_idx
  on public.psychologist_cabinets (psychologist_id) where is_primary;
create index if not exists psychologist_cabinets_cabinet_idx
  on public.psychologist_cabinets (cabinet_id);
