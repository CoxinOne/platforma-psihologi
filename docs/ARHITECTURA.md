# Arhitectură

> **Actualizare 24.10.2026:** modulul de programări și tarifele au fost eliminate din aplicație.
> Secțiunile despre programări, disponibilitate și booking descriu schema legacy păstrată în baza de
> date; nu mai există rute, componente sau API care să creeze programări. Platforma oferă profiluri
> publice și mesagerie privată, iar prețul este afișat ca „Prețul este în funcție de complexitate”.

## 1. Straturi

```
Browser
  ├─ React Server Components (paginile) ───────────────┐
  ├─ Client Components (chat, booking, formulare)      │
  └─ Supabase JS (auth, Realtime, RPC)                 │
                                                       ▼
Next.js 16 (server)                            Supabase
  ├─ Server Actions (Zod + sesiune)               ├─ PostgreSQL + RLS
  ├─ Route Handlers (/api/slots, export, health)  ├─ Auth (cookie SSR)
  ├─ Service-role client (doar admin/server)      ├─ Realtime
  └─ proxy.ts (refresh sesiune, protecție rute)   └─ Storage (avatars)
```

- **Server Components** citesc datele prin clientul legat de cookie-urile utilizatorului; RLS
  filtrează rândurile.
- **Server Actions** validează inputul cu Zod, verifică sesiunea/rolul și apelează funcții RPC sau
  scrie prin clientul utilizatorului. Nu există endpoint-uri care să accepte roluri din body.
- **Client Components** sunt folosite doar unde e nevoie de stare/efecte: chat Realtime, selector de
  intervale, editor de disponibilitate, formulare cu `useActionState`.
- **Service role** este izolat în `src/lib/supabase/admin.ts` (import `server-only`) și este folosit
  exclusiv după `requireAdmin()` sau în fluxuri server necesare (export GDPR, contact form, ștergere
  cont).

## 2. Autentificare și sesiune

- `@supabase/ssr` păstrează sesiunea în cookie-uri HttpOnly gestionate de Supabase.
- `src/proxy.ts` (noul `middleware` din Next 16) reîmprospătează tokenul și redirecționează
  utilizatorii neautentificați de pe `/dashboard`, `/cabinet`, `/admin`.
- Layout-urile de zonă verifică rolul pe server (`requireClient`, `requirePsychologist`, `requireAdmin`);
  simpla ascundere a unui link nu este considerată securitate.
- Confirmarea e-mailului este verificată în `requireUser`; utilizatorii neconfirmați sunt trimiși la
  `/verifica-email`.
- Callback-urile acceptă atât fluxul PKCE (`?code=`), cât și `token_hash` + `type`.

## 3. Model de date (rezumat)

- `profiles` — date de cont, rol, status, consimțământ.
- `psychologist_profiles` — date profesionale, status de verificare, vizibilitate.
- `specialties`, `psychologist_specialties`, `cabinets`, `psychologist_cabinets`.
- `availability_rules`, `availability_exceptions`.
- `appointments` — intervale, status, snapshots de tarif și fus orar.
- `conversations`, `conversation_participants`, `messages`.
- `notifications`, `notification_preferences`.
- `abuse_reports`, `data_requests`, `contact_messages`, `audit_logs`, `rate_limit_events`,
  `platform_settings`.

Detalii în [`BAZA-DE-DATE.md`](BAZA-DE-DATE.md).

## 4. Programări

### Generarea intervalelor

`public.available_slots(psychologist, date, mode)`:

1. verifică profil aprobat și disponibilitate;
2. citește regula săptămânală (`weekday`, `start_time`, `end_time`, pas) sau excepția zilei;
3. generează orele **în timp local** (`date + time`), apoi le convertesc la `timestamptz` cu
   `AT TIME ZONE timezone`; astfel DST este tratat corect;
4. elimină duplicatele rezultate din ora inexistentă la trecerea la vară;
5. elimină intervalele deja acoperite de programări `pending`/`confirmed`;
6. elimină intervalele prea apropiate de momentul curent (`min_notice_hours`).

`available_slots_range` repetă logica pentru 1–31 de zile și este folosită de widget/API.

### Rezervarea

`public.book_appointment(...)`:

- verifică autentificarea, rolul `client`, statusul contului, profilul aprobat, tipul consultației;
- verifică fereastra de timp (`min_notice_hours`, `max_advance_days`);
- verifică apartenența cabinetului;
- ia un `pg_advisory_xact_lock` pe psiholog pentru serializarea cererilor;
- reverifică slotul cu `available_slots`;
- inserează programarea `pending`; constrângerea de excludere respinge orice suprapunere;
- trigger-ele creează notificarea pentru psiholog;
- eroarea de excludere este transformată în `SLOT_ALREADY_BOOKED`.

**Nicio programare nu este confirmată automat.** Confirmarea/respingerea/anularea/reprogramarea sunt
funcții separate, cu verificarea proprietarului și a tranziției de status.

### Constrângeri anti-suprapunere

```sql
EXCLUDE USING gist (
  psychologist_id WITH =,
  tstzrange(starts_at, ends_at, '[)') WITH &&
) WHERE (status IN ('pending','confirmed'))
```

Există o constrângere echivalentă pe `client_id`, pentru a evita ca același client să aibă două
programări active în același interval.

## 5. Mesagerie

- Conversație unică per pereche client–psiholog (`unique (client_id, psychologist_id)`).
- `conversation_participants` păstrează `last_read_at`; numărul de mesaje necitite este calculat în
  `list_conversations()`.
- `send_message` verifică participarea, lungimea, statusul conversației și aplică rate limiting.
- Mesajele sunt imutabile: nu există politici/privilegii de UPDATE sau DELETE pentru utilizatori, iar
  un trigger blochează modificarea.
- Realtime: publicația `supabase_realtime` include `messages`, `notifications`, `conversations`,
  `appointments`; RLS este aplicat de Supabase pentru fiecare abonat.
- Notificarea conține doar „Mesaj nou”, numele expeditorului și un link; **nu** conține corpul
  mesajului.

## 6. Notificări

- Trigger-e pe `messages` și `appointments` creează notificări în aplicație.
- `unread_badge()` returnează contoarele pentru header.
- Preferințele sunt stocate în `notification_preferences`; e-mailurile respectă
  `email_messages`/`email_appointments`.
- E-mailul este trimis din Server Actions după operațiunea din DB, prin Resend, dacă este configurat.
  Nu există simulare de succes.

## 7. Fus orar

- Stocare: `timestamptz` (UTC).
- Reguli: ore locale în `psychologist_profiles.timezone`.
- Afișare: `formatInTimeZone` cu `Europe/Bucharest` (configurabil).
- Teste: 27–28 martie și 30–31 octombrie 2027, atât în SQL, cât și în TypeScript.

## 8. Administrare

- Rutele `/admin` sunt protejate de `requireAdmin`.
- Citirile administrative folosesc cheia de serviciu; scrierile folosesc RPC-uri auditate sau
  actualizări prin service role, urmate de o intrare în `audit_logs`.
- Administratorul nu poate citi conversațiile prin UI; nu există politică RLS care să îi permită
  accesul la `messages`.
- Ștergerea contului folosește Admin API (`auth.admin.deleteUser`), după verificarea unei cereri
  `deletion` valide și după confirmarea textului „sterge”.

## 9. Compromisuri conștiente

- **Fără ORM**: interogările sunt explicite; tipurile sunt definite manual în `src/lib/types.ts`.
  Un proiect mai mare ar beneficia de tipuri generate din schema Supabase.
- **Fără React Query/SWR**: Server Components + `revalidatePath` acoperă majoritatea fluxurilor;
  chat-ul folosește Realtime.
- **Fără job scheduler**: retenția și curățarea rate-limit sunt oportuniste, nu programate.
- **Fără plăți**: câmpurile de tarif sunt pregătite pentru extindere, dar nu există tranzacții.
- **Fără E2EE**: ar necesita schimb de chei și un model de amenințare suplimentar; nu este pretins.
