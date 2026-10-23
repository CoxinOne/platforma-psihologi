# Baza de date

Migrațiile sunt în `supabase/migrations/` și trebuie aplicate în ordine. Sunt scrise pentru
PostgreSQL 15+ și Supabase (extensii, `auth.users`, `auth.uid()`).

## 1. Tabele

| Tabel | Cheie | Rol |
|---|---|---|
| `profiles` | `id` = `auth.users.id` | cont, rol, status, consimțământ |
| `specialties` | `id` | taxonomie publică |
| `psychologist_profiles` | `user_id` = `profiles.id` | date profesionale și verificare |
| `psychologist_specialties` | (`psychologist_id`,`specialty_id`) | legătură N:N |
| `cabinets` | `id` | locații publice |
| `psychologist_cabinets` | (`psychologist_id`,`cabinet_id`) | legătură N:N, un cabinet principal |
| `availability_rules` | `id` | program săptămânal |
| `availability_exceptions` | `id` | zile libere / program special |
| `appointments` | `id` | programări |
| `conversations` | `id` | conversație unică per pereche |
| `conversation_participants` | (`conversation_id`,`user_id`) | membri + `last_read_at` |
| `messages` | `id` | mesaje imutabile |
| `notifications` | `id` | notificări în aplicație |
| `notification_preferences` | `user_id` | preferințe |
| `audit_logs` | `id` | jurnal de securitate/administrativ |
| `abuse_reports` | `id` | raportări |
| `contact_messages` | `id` | formular public |
| `data_requests` | `id` | export/ștergere GDPR |
| `rate_limit_events` | `id` | rate limiting persistent |
| `platform_settings` | `key` | setări (fereastră anulare etc.) |

## 2. Relații principale

```
auth.users 1──1 profiles
profiles 1──0..1 psychologist_profiles
psychologist_profiles 1──N availability_rules
psychologist_profiles 1──N appointments (psychologist_id)
profiles (client) 1──N appointments (client_id)
appointments N──1 cabinets (opțional)
conversations N──1 profiles (client)
conversations N──1 psychologist_profiles (psiholog)
conversations 1──N messages
conversations 1──N conversation_participants
profiles 1──N notifications
profiles 1──N abuse_reports
profiles 1──N data_requests
```

Cheile externe folosesc `on delete cascade` pentru datele personale (cont, mesaje, programări) și
`on delete restrict`/`set null` pentru referințe editoriale (specializări, cabinete).

## 3. Constrângeri importante

### Programări

```sql
constraint appointments_duration_matches check (
  ends_at = starts_at + make_interval(mins => duration_minutes)
)
constraint appointments_no_psychologist_overlap exclude using gist (
  psychologist_id with =,
  tstzrange(starts_at, ends_at, '[)') with &&
) where (status in ('pending','confirmed'))
constraint appointments_no_client_overlap exclude using gist (
  client_id with =,
  tstzrange(starts_at, ends_at, '[)') with &&
) where (status in ('pending','confirmed'))
constraint appointments_no_self_booking check (client_id <> psychologist_id)
constraint appointments_cabinet_required_for_in_person check (
  mode <> 'in_person' or cabinet_id is not null
)
```

Tranzițiile de status sunt limitate de trigger-ul `enforce_appointment_transition`:

- `pending → confirmed | rejected | cancelled`
- `confirmed → pending (reprogramare) | cancelled | completed | no_show`
- `rejected → cancelled`

### Profiluri

- `slug` unic, format `^[a-z0-9]+(-[a-z0-9]+)*$`;
- durata ședinței 20–120 min;
- un profil aprobat cere `verified_at` și `published_at` (constrângere `CHECK`);
- trigger-ele interzic auto-aprobarea și modificarea câmpurilor de verificare.

### Mesaje

- lungime 1–4000, fără text doar spații;
- trigger de imutabilitate pentru UPDATE/DELETE din partea utilizatorilor.

### Disponibilitate

- `start_time < end_time`, pas 10–120 min;
- excepție unică per psiholog și dată;
- trigger care verifică proprietarul și cabinetul.

## 4. Indexuri

- `appointments (psychologist_id, starts_at)`, `(client_id, starts_at desc)`, `(status, starts_at)`
- `messages (conversation_id, created_at)`, `(sender_id)`
- `notifications (user_id, created_at desc)`, index parțial pe necitite
- `audit_logs (created_at desc)`, `(actor_id, created_at desc)`, `(action, created_at desc)`
- `availability_rules (psychologist_id, weekday) where is_active`
- `psychologist_profiles (status) where status='approved'`, `(slug)`
- `profiles (role)`, `(status)`, `(lower(email))`
- `rate_limit_events (bucket, created_at desc)`

## 5. Funcții (RPC)

| Funcție | Scop |
|---|---|
| `available_slots`, `available_slots_range` | intervale libere (anon + authenticated) |
| `book_appointment` | rezervare cu verificări și lock |
| `reschedule_appointment` | propunere interval nou |
| `cancel_appointment` | anulare cu fereastră de 24 h pentru client |
| `confirm_appointment`, `reject_appointment`, `complete_appointment` | tranziții psiholog |
| `set_appointment_note` | notă privată |
| `start_conversation`, `send_message`, `mark_conversation_read` | mesagerie |
| `list_conversations`, `unread_badge` | citiri agregate |
| `mark_notification_read`, `mark_all_notifications_read` | notificări |
| `get_notification_preferences`, `update_notification_preferences` | preferințe |
| `get_my_profile`, `update_my_profile`, `request_psychologist_account` | cont |
| `report_abuse`, `request_data_export`, `request_account_deletion` | siguranță/GDPR |
| `admin_*` | operațiuni administrative cu audit |
| `log_admin_action` | audit pentru acțiuni din service role |

Funcțiile care modifică date sunt `security definer`, verifică `auth.uid()` și rolul și au
`search_path` fixat.

## 6. View-uri publice

- `public_psychologists` — doar profile `approved`, fără email/telefon/note de verificare.
- `public_specialties` — specializări active + număr de profiluri aprobate.
- `public_cabinets` — cabinete active + număr de psihologi.
- `public_psychologist_specialties`, `public_psychologist_cabinets` — legături publice.

View-urile sunt deținute de rolul de migrare, filtrează explicit și sunt singura cale de citire
pentru `anon`.

## 7. Realtime și Storage

- Publicația `supabase_realtime`: `messages`, `notifications`, `conversations`, `appointments`.
- `replica identity full` pentru evenimente de update.
- Bucket public `avatars` (2 MB, JPEG/PNG/WebP), politici:
  - citire publică;
  - scriere doar în folderul `auth.uid()`;
  - update/delete doar pentru propriile fișiere.

## 8. Migrații

| Fișier | Conținut |
|---|---|
| `..._0001_extensions_and_types.sql` | extensii, enum-uri, `set_updated_at` |
| `..._0002_core_schema.sql` | profiles, specializări, profiluri, cabinete |
| `..._0003_booking_schema.sql` | disponibilitate, programări, constrângeri |
| `..._0004_messaging_schema.sql` | conversații, mesaje, trigger de actualizare |
| `..._0005_notifications_admin_schema.sql` | notificări, audit, raportări, GDPR, rate limit, trigger-e |
| `..._0006_business_functions.sql` | identitate, disponibilitate, programări, mesagerie, GDPR |
| `..._0007_admin_functions.sql` | funcții administrative |
| `..._0008_guards_and_auth.sql` | trigger `auth.users`, protecții, imutabilitate |
| `..._0009_rls.sql` | RLS, privilegii, grant-uri pe funcții |
| `..._0010_public_views.sql` | view-uri publice |
| `..._0011_realtime_storage.sql` | publicație, replica identity, bucket |
| `..._0012_reference_data.sql` | setări și specializări inițiale |

> Migrațiile nu sunt concepute să fie reaplicate pe aceeași bază (trigger-ele `CREATE TRIGGER` nu au
> `IF NOT EXISTS`). Folosește o bază goală sau `supabase db push`.
