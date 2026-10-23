-- =============================================================================
-- 0001 — Extensii, tipuri și utilitare de bază
-- Platformă Psihologi
-- =============================================================================
-- Rulare: Supabase CLI (`supabase db push`) sau `psql -f`.
-- Toate migrațiile sunt idempotente la nivel de obiect (IF NOT EXISTS / DO).
-- =============================================================================

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

-- Schema `extensions` există pe Supabase; local poate lipsi, iar un search_path
-- cu o schemă inexistentă este ignorat de PostgreSQL.
set search_path = public, extensions;

-- -----------------------------------------------------------------------------
-- Tipuri enumerare
-- -----------------------------------------------------------------------------
do $$
begin
  create type public.user_role as enum ('client', 'psychologist', 'admin');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.account_status as enum ('active', 'suspended', 'pending_deletion', 'deleted');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.professional_status as enum ('draft', 'pending', 'approved', 'rejected', 'suspended');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.consultation_mode as enum ('in_person', 'online');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.appointment_status as enum ('pending', 'confirmed', 'rejected', 'cancelled', 'completed', 'no_show');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.notification_type as enum (
    'message_new',
    'appointment_requested',
    'appointment_confirmed',
    'appointment_rejected',
    'appointment_cancelled',
    'appointment_rescheduled',
    'appointment_completed',
    'account_status',
    'professional_status',
    'abuse_report',
    'data_request',
    'system'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.report_status as enum ('open', 'in_review', 'resolved', 'dismissed');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.data_request_type as enum ('export', 'deletion');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.data_request_status as enum ('pending', 'processing', 'completed', 'rejected');
exception when duplicate_object then null;
end $$;

-- -----------------------------------------------------------------------------
-- Utilitar: actualizare automată a coloanei updated_at
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Trigger generic: setează updated_at la now() înainte de UPDATE.';
