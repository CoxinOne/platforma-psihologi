# Securitate și RLS

> **Actualizare 24.10.2026:** politicile pentru programări și disponibilitate rămân valide pentru
> schema legacy, dar aplicația nu mai expune aceste funcții. Testele DB includ în continuare
> verificări pentru ele, ca protecție a datelor istorice.

## 1. Principii

1. **Rolul se verifică în baza de date**, nu doar în UI. Fiecare tabel privat are RLS activ.
2. **Scrierile sensibile sunt funcții `security definer`** care verifică `auth.uid()` și rolul.
3. **`anon` nu are privilegii pe tabele**. Citește doar view-urile publice.
4. **Cheia de serviciu** este folosită exclusiv pe server, după `requireAdmin()`, și nu este expusă
   în bundle. Ea ocolește RLS prin design; de aceea nu este folosită în fluxurile utilizatorului.
5. **Mesajele private nu sunt accesibile administratorului** prin politicile RLS. Nu există politică
   pe `messages` pentru admin.
6. **Trigger-e de protecție**: rol, status, email, câmpuri de verificare, imutabilitate mesaje.

## 2. Matrice de acces (prin clientul utilizatorului)

| Tabel / acțiune | anon | client | psiholog | admin (JWT) |
|---|---|---|---|---|
| `public_psychologists` SELECT | ✅ aprobate | ✅ | ✅ | ✅ |
| `public_specialties` / `public_cabinets` SELECT | ✅ | ✅ | ✅ | ✅ |
| `profiles` SELECT | ❌ | propriul rând + persoane cu care are conversație/programare | idem | toate rândurile, doar coloane ne-sensibile |
| `profiles` UPDATE | ❌ | ❌ (RPC) | ❌ (RPC) | ❌ (RPC) |
| `psychologist_profiles` SELECT | ❌ | ❌ | propriul profil | toate |
| `psychologist_profiles` INSERT/UPDATE | ❌ | ❌ | propriul profil, fără auto-aprobare | ✅ |
| `appointments` SELECT | ❌ | propriile | propriile | ❌ |
| `appointments` INSERT/UPDATE | ❌ | ❌ (RPC) | ❌ (RPC) | ❌ |
| `conversations` / `messages` SELECT | ❌ | doar ca participant | doar ca participant | ❌ |
| `messages` INSERT/UPDATE/DELETE | ❌ | ❌ (RPC) / ❌ / ❌ | ❌ (RPC) / ❌ / ❌ | ❌ |
| `notifications` SELECT | ❌ | proprii | proprii | proprii |
| `notification_preferences` | ❌ | proprii (RPC) | proprii (RPC) | proprii |
| `abuse_reports` SELECT | ❌ | propriile | propriile | toate |
| `data_requests` SELECT | ❌ | propriile | propriile | toate (service role) |
| `audit_logs`, `contact_messages` | ❌ | ❌ | ❌ | service role |
| `platform_settings` SELECT | ❌ | doar `is_public` | idem | toate |
| `availability_*` | ❌ | ❌ | propriile | toate |
| `psychologist_specialties`, `psychologist_cabinets` | ❌ | ❌ | propriile | toate |
| `specialties`, `cabinets` SELECT | ❌ | active | active | toate |

> Administratorul autentificat nu are politică pe `messages`; accesul la conversații nu este permis
> nici măcar cu rolul `admin`. Operațiunile administrative care necesită date folosesc cheia de
> serviciu pe server, iar UI-ul nu expune conținut privat.

## 3. Funcții expuse

- `anon`: doar `available_slots`, `available_slots_range`.
- `authenticated`: funcțiile de business și `admin_*` (fiecare `admin_*` verifică `is_admin()`).
- `check_rate_limit`, trigger-ele și funcțiile interne nu au `EXECUTE` pentru rolurile de aplicație.
- `service_role`: acces complet, exclusiv server-side.

## 4. Rate limiting

| Operațiune | Limită | Implementare |
|---|---|---|
| Mesaje | 20/minut, 300/zi per utilizator | `send_message` |
| Programări | 10/oră per client | `book_appointment` |
| Conversații noi | 5/oră per client | `start_conversation` |
| Raportări | 5/zi | `report_abuse` |
| Export / ștergere | 3/zi | RPC GDPR |
| Contact | 5/oră per IP | `check_rate_limit` (service role) |

Rate limiting-ul este persistent în PostgreSQL (`rate_limit_events`), nu doar în memorie.

## 5. Protecții anti-abuz

- Mesaje imutabile, fără DELETE pentru utilizatori.
- Raportarea necesită o relație existentă (conversație sau programare).
- Confirmarea programărilor doar de către psihologul proprietar.
- Ștergerea contului necesită o cerere `deletion` validă + confirmarea textului „sterge”.
- Trigger-ele blochează auto-promovarea și auto-aprobarea.
- Cookie-uri de sesiune gestionate de Supabase; `HttpOnly`, `Secure` în producție (HTTPS).
- Erorile afișate utilizatorului sunt traduse; nu se expun stive, chei sau detalii SQL.

## 6. Teste rulate (24/24)

Fișier: `tests/db/rls.test.ts`. Rezultate pe PostgreSQL 18.4, 24 octombrie 2026.

| # | Test | Rezultat |
|---|---|---|
| 1 | anon nu citește tabele private | ✅ |
| 2 | view public doar profile aprobate, fără coloane private | ✅ |
| 3 | client vede doar propriile programări | ✅ |
| 4 | client nu modifică profilul altuia / rolul propriu | ✅ |
| 5 | client nu scrie direct programări | ✅ |
| 6 | rezervare creează pending + notificare | ✅ |
| 7 | a doua rezervare pe același interval respinsă | ✅ |
| 8 | două rezervări simultane: exact una reușește | ✅ |
| 9 | fereastra de anulare 24 h | ✅ |
| 10 | doar psihologul proprietar confirmă | ✅ |
| 11 | cont suspendat nu poate rezerva | ✅ |
| 12 | mesaje vizibile doar participanților | ✅ |
| 13 | mesaje imutabile | ✅ |
| 14 | notificări izolate | ✅ |
| 15 | profil privat invizibil fără relație | ✅ |
| 16 | psiholog nu se auto-aprobă; admin aprobă cu audit | ✅ |
| 17 | admin nu își schimbă propriul rol | ✅ |
| 18 | DST corect (martie și octombrie) | ✅ |
| 19 | cabinet obligatoriu pentru in_person | ✅ |
| 20 | raportare doar cu relație | ✅ |
| 21 | export GDPR înregistrat și auditat | ✅ |
| 22 | funcții interne neexpuse | ✅ |
| 23 | suspendare/reactivare auditate, profil public ascuns | ✅ |
| 24 | ștergere psiholog cu programări: cascadă profil + programări | ✅ |

Testele sunt rulate pe un PostgreSQL real cu un stub care reproduce `auth.uid()`, rolurile Supabase
și `auth.users`. Nu înlocuiesc un test pe proiectul Supabase găzduit, dar validează logica SQL/RLS.

## 7. Limitări

- Nu există audit al citirilor (cine a deschis o conversație); jurnalul acoperă acțiuni, nu accesări.
- Nu există MFA obligatoriu; poate fi activat din Supabase, dar nu este impus de aplicație.
- Nu există protecție CSRF separată; Server Actions Next.js au protecții încorporate, iar apelurile
  RPC folosesc tokenul utilizatorului.
- Nu există WAF / bot detection; se poate adăuga la nivel de hosting.
- Cheia de serviciu compromisă = acces total; trebuie rotită imediat și păstrată doar în secrets.
