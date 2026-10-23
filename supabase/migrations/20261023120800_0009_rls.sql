-- =============================================================================
-- 0009 — Row Level Security și privilegii minime
-- =============================================================================
-- Principii:
--   * anon nu are acces direct la niciun tabel; citește doar view-urile publice.
--   * authenticated primește doar operațiile necesare, iar RLS filtrează rândurile.
--   * scrierile sensibile (programări, mesaje, roluri) trec prin funcții auditate.
--   * administratorul folosește cheia de serviciu doar pe server, după verificarea rolului.
-- =============================================================================
set search_path = public, extensions;

alter table public.profiles enable row level security;
alter table public.specialties enable row level security;
alter table public.psychologist_profiles enable row level security;
alter table public.psychologist_specialties enable row level security;
alter table public.cabinets enable row level security;
alter table public.psychologist_cabinets enable row level security;
alter table public.availability_rules enable row level security;
alter table public.availability_exceptions enable row level security;
alter table public.appointments enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.audit_logs enable row level security;
alter table public.abuse_reports enable row level security;
alter table public.contact_messages enable row level security;
alter table public.data_requests enable row level security;
alter table public.rate_limit_events enable row level security;
alter table public.platform_settings enable row level security;

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
drop policy if exists profiles_select_related on public.profiles;
create policy profiles_select_related on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.is_admin()
    or public.shares_conversation_with(id)
    or public.has_appointment_with(id)
  );

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- -----------------------------------------------------------------------------
-- specialties (citire pentru formulare; scrierea doar prin service role)
-- -----------------------------------------------------------------------------
drop policy if exists specialties_select on public.specialties;
create policy specialties_select on public.specialties
  for select to authenticated
  using (is_active or public.is_admin());

-- -----------------------------------------------------------------------------
-- psychologist_profiles
-- -----------------------------------------------------------------------------
drop policy if exists psychologist_profiles_select on public.psychologist_profiles;
create policy psychologist_profiles_select on public.psychologist_profiles
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists psychologist_profiles_insert on public.psychologist_profiles;
create policy psychologist_profiles_insert on public.psychologist_profiles
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and public.current_user_role() = 'psychologist'
    and status = 'draft'
  );

drop policy if exists psychologist_profiles_update on public.psychologist_profiles;
create policy psychologist_profiles_update on public.psychologist_profiles
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists psychologist_profiles_delete on public.psychologist_profiles;
create policy psychologist_profiles_delete on public.psychologist_profiles
  for delete to authenticated
  using (user_id = auth.uid() and status in ('draft', 'rejected'));

-- -----------------------------------------------------------------------------
-- psychologist_specialties
-- -----------------------------------------------------------------------------
drop policy if exists psychologist_specialties_select on public.psychologist_specialties;
create policy psychologist_specialties_select on public.psychologist_specialties
  for select to authenticated
  using (psychologist_id = auth.uid() or public.is_admin());

drop policy if exists psychologist_specialties_insert on public.psychologist_specialties;
create policy psychologist_specialties_insert on public.psychologist_specialties
  for insert to authenticated
  with check (psychologist_id = auth.uid());

drop policy if exists psychologist_specialties_delete on public.psychologist_specialties;
create policy psychologist_specialties_delete on public.psychologist_specialties
  for delete to authenticated
  using (psychologist_id = auth.uid());

-- -----------------------------------------------------------------------------
-- cabinets
-- -----------------------------------------------------------------------------
drop policy if exists cabinets_select on public.cabinets;
create policy cabinets_select on public.cabinets
  for select to authenticated
  using (is_active or public.is_admin());

-- -----------------------------------------------------------------------------
-- psychologist_cabinets
-- -----------------------------------------------------------------------------
drop policy if exists psychologist_cabinets_select on public.psychologist_cabinets;
create policy psychologist_cabinets_select on public.psychologist_cabinets
  for select to authenticated
  using (psychologist_id = auth.uid() or public.is_admin());

drop policy if exists psychologist_cabinets_insert on public.psychologist_cabinets;
create policy psychologist_cabinets_insert on public.psychologist_cabinets
  for insert to authenticated
  with check (psychologist_id = auth.uid());

drop policy if exists psychologist_cabinets_delete on public.psychologist_cabinets;
create policy psychologist_cabinets_delete on public.psychologist_cabinets
  for delete to authenticated
  using (psychologist_id = auth.uid());

-- -----------------------------------------------------------------------------
-- availability_rules / availability_exceptions
-- -----------------------------------------------------------------------------
drop policy if exists availability_rules_all on public.availability_rules;
create policy availability_rules_all on public.availability_rules
  for all to authenticated
  using (psychologist_id = auth.uid())
  with check (psychologist_id = auth.uid());

drop policy if exists availability_exceptions_all on public.availability_exceptions;
create policy availability_exceptions_all on public.availability_exceptions
  for all to authenticated
  using (psychologist_id = auth.uid())
  with check (psychologist_id = auth.uid());

-- -----------------------------------------------------------------------------
-- appointments — doar citire; scrierea exclusiv prin funcțiile RPC
-- -----------------------------------------------------------------------------
drop policy if exists appointments_select_participants on public.appointments;
create policy appointments_select_participants on public.appointments
  for select to authenticated
  using (client_id = auth.uid() or psychologist_id = auth.uid());

-- -----------------------------------------------------------------------------
-- conversations
-- -----------------------------------------------------------------------------
drop policy if exists conversations_select_participant on public.conversations;
create policy conversations_select_participant on public.conversations
  for select to authenticated
  using (public.is_conversation_participant(id));

drop policy if exists conversation_participants_select_self on public.conversation_participants;
create policy conversation_participants_select_self on public.conversation_participants
  for select to authenticated
  using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- messages
-- -----------------------------------------------------------------------------
drop policy if exists messages_select_participant on public.messages;
create policy messages_select_participant on public.messages
  for select to authenticated
  using (public.is_conversation_participant(conversation_id));

-- -----------------------------------------------------------------------------
-- notifications
-- -----------------------------------------------------------------------------
drop policy if exists notifications_select_self on public.notifications;
create policy notifications_select_self on public.notifications
  for select to authenticated
  using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- notification_preferences
-- -----------------------------------------------------------------------------
drop policy if exists notification_preferences_select_self on public.notification_preferences;
create policy notification_preferences_select_self on public.notification_preferences
  for select to authenticated
  using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- abuse_reports
-- -----------------------------------------------------------------------------
drop policy if exists abuse_reports_select_self on public.abuse_reports;
create policy abuse_reports_select_self on public.abuse_reports
  for select to authenticated
  using (reporter_id = auth.uid() or public.is_admin());

-- -----------------------------------------------------------------------------
-- data_requests
-- -----------------------------------------------------------------------------
drop policy if exists data_requests_select_self on public.data_requests;
create policy data_requests_select_self on public.data_requests
  for select to authenticated
  using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- platform_settings — doar cele marcate publice
-- -----------------------------------------------------------------------------
drop policy if exists platform_settings_select_public on public.platform_settings;
create policy platform_settings_select_public on public.platform_settings
  for select to authenticated
  using (is_public or public.is_admin());

-- audit_logs, contact_messages, rate_limit_events rămân fără politici:
-- accesul se face exclusiv cu cheia de serviciu, pe server.

-- =============================================================================
-- Privilegii la nivel de tabel / coloană
-- =============================================================================
revoke all on all tables in schema public from anon, authenticated;

grant select (id, role, full_name, status, is_demo, created_at)
  on public.profiles to authenticated;

grant select, insert, update, delete on public.psychologist_profiles to authenticated;
grant select on public.specialties to authenticated;
grant select, insert, delete on public.psychologist_specialties to authenticated;
grant select on public.cabinets to authenticated;
grant select, insert, delete on public.psychologist_cabinets to authenticated;
grant select, insert, update, delete on public.availability_rules to authenticated;
grant select, insert, update, delete on public.availability_exceptions to authenticated;
grant select on public.appointments to authenticated;
grant select on public.conversations to authenticated;
grant select on public.conversation_participants to authenticated;
grant select on public.messages to authenticated;
grant select on public.notifications to authenticated;
grant select on public.notification_preferences to authenticated;
grant select on public.abuse_reports to authenticated;
grant select on public.data_requests to authenticated;
grant select on public.platform_settings to authenticated;

-- Secvențe: niciun rol de aplicație nu are nevoie de ele direct.
revoke all on all sequences in schema public from anon, authenticated;

-- =============================================================================
-- Funcții: revocare implicită, apoi acordare explicită
-- =============================================================================
revoke all on all functions in schema public from public, anon, authenticated;

-- Utilitare folosite în politicile RLS (apelantul are nevoie de EXECUTE)
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_active_account() to authenticated;
grant execute on function public.is_conversation_participant(uuid) to authenticated;
grant execute on function public.shares_conversation_with(uuid) to authenticated;
grant execute on function public.has_appointment_with(uuid) to authenticated;

-- Disponibilitate — publică (doar intervale libere, fără date despre clienți)
grant execute on function public.available_slots(uuid, date, public.consultation_mode) to anon, authenticated;
grant execute on function public.available_slots_range(uuid, date, integer, public.consultation_mode) to anon, authenticated;

-- Cont și profil
grant execute on function public.get_my_profile() to authenticated;
grant execute on function public.update_my_profile(text, text, boolean) to authenticated;
grant execute on function public.request_psychologist_account() to authenticated;

-- Programări
grant execute on function public.book_appointment(uuid, timestamptz, public.consultation_mode, uuid, text) to authenticated;
grant execute on function public.reschedule_appointment(uuid, timestamptz) to authenticated;
grant execute on function public.cancel_appointment(uuid, text) to authenticated;
grant execute on function public.confirm_appointment(uuid) to authenticated;
grant execute on function public.reject_appointment(uuid, text) to authenticated;
grant execute on function public.complete_appointment(uuid) to authenticated;
grant execute on function public.set_appointment_note(uuid, text) to authenticated;

-- Mesagerie
grant execute on function public.start_conversation(uuid, text) to authenticated;
grant execute on function public.send_message(uuid, text) to authenticated;
grant execute on function public.mark_conversation_read(uuid) to authenticated;
grant execute on function public.list_conversations() to authenticated;
grant execute on function public.unread_badge() to authenticated;

-- Notificări
grant execute on function public.mark_notification_read(uuid) to authenticated;
grant execute on function public.mark_all_notifications_read() to authenticated;
grant execute on function public.get_notification_preferences() to authenticated;
grant execute on function public.update_notification_preferences(boolean, boolean, boolean) to authenticated;

-- Raportări și GDPR
grant execute on function public.report_abuse(uuid, uuid, text, text) to authenticated;
grant execute on function public.request_data_export() to authenticated;
grant execute on function public.request_account_deletion(text) to authenticated;

-- Administrare (verificarea is_admin() este în interiorul fiecărei funcții)
grant execute on function public.admin_dashboard_stats() to authenticated;
grant execute on function public.admin_set_user_role(uuid, public.user_role) to authenticated;
grant execute on function public.admin_set_account_status(uuid, public.account_status, text) to authenticated;
grant execute on function public.admin_set_professional_status(uuid, public.professional_status, text) to authenticated;
grant execute on function public.admin_process_data_request(uuid, public.data_request_status, text) to authenticated;
grant execute on function public.log_admin_action(text, text, text, jsonb) to authenticated;

-- =============================================================================
-- Cheia de serviciu (exclusiv server) are nevoie de acces complet pentru
-- operațiunile administrative și pentru ștergerea conturilor.
-- =============================================================================
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;
