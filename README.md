# Platformă Psihologi

Aplicație web completă pentru un grup de psihologi din România: directoriu public, profiluri
profesionale verificate și mesagerie privată în timp real. Platforma nu gestionează programări,
nu afișează tarife fixe și nu procesează plăți.

> **Denumire de lucru.** Identitatea vizuală, operatorul și documentele juridice se stabilesc
> înainte de lansarea publică. Textele legale sunt modele și necesită verificare juridică.

---

## 1. Stare proiect

| Componentă | Stare |
|---|---|
| Frontend Next.js 16 (App Router) | implementat |
| Autentificare Supabase (email + parolă, confirmare, resetare) | implementat |
| Roluri client / psiholog / administrator | implementat; înregistrare publică doar pentru clienți, maximum 12 psihologi |
| RLS pe toate tabelele private | implementat și testat (27 teste SQL) |
| Directoriu, căutare, specializări, cabinete | implementat |
| Profil profesional cu aprobare administrativă | implementat |
| Mesagerie privată + Realtime + notificări | implementat |
| Contact rapid WhatsApp pe profilul public | implementat; folosește telefonul public al cabinetului |
| Programări / calendar / disponibilitate | **eliminate din aplicație** (schema legacy păstrată în DB) |
| Tarife fixe / plăți online | **eliminate**; se afișează „Prețul este în funcție de complexitate” |
| Notificări în aplicație | implementat |
| E-mail tranzacțional | implementat condiționat de configurare (Resend) |
| Panou administrator + audit | implementat |
| Export / ștergere GDPR | implementat (procesare manuală de administrator) |
| Teste unitare / RLS / build | rulate, rezultate în secțiunea 9 |

---

## 2. Tehnologii și versiuni

- **Next.js 16.4.3**, App Router, `proxy.ts` (noul nume pentru middleware în Next 16)
- **React 19.3.1**, TypeScript **5.9.3** cu `strict` și `noUncheckedIndexedAccess`
- **Tailwind CSS 4.3.3** (fără config JS; tema în `globals.css`)
- **Supabase JS 2.118.0**, **@supabase/ssr 0.12.7**
- **Zod 4.6.7** pentru validare pe server
- **date-fns 4.4.0** + **date-fns-tz 3.2.0** pentru fusul orar
- **Vitest 5.0.5**, **pg 8.23.1** pentru testele de bază de date
- **ESLint 9.39.5** + `eslint-config-next` 16.4.3

Toate versiunile sunt fixate în `package.json`; `package-lock.json` este inclus.

### 2.1. Paletă vizuală

| Culoare | Hex | Utilizare |
|---|---|---|
| Crem | `#F6F1E9` | fundal principal |
| Bej | `#DED5C5` | borduri, badge-uri, secțiuni alternante |
| Salvie | `#A9AC8B` | accente decorative, pattern |
| Oliv | `#737B5C` | accent principal; butoanele și linkurile folosesc `#5F684A` pentru contrast |
| Teracotă | `#B97960` | linii de accent, avertismente, detalii calde |
| Cacao | `#51453C` | text principal și secțiunea CTA închisă |

Nuanțele de text și butoane au fost alese pentru contrast AA pe crem: text `#51453C`, text secundar
`#6E6255`, buton principal `#5F684A` cu text crem.

---

## 3. Decizii arhitecturale (pe scurt)

1. **Scrierile sensibile trec prin funcții PostgreSQL `security definer`** (`send_message`,
   `admin_set_user_role` etc.). Astfel regulile de business nu pot fi ocolite apelând direct API-ul
   REST. RLS rămâne a doua linie de apărare pentru citiri.
2. **Programările au fost eliminate din produs.** Rutele, componentele, rutele API și acțiunile au
   fost șterse; tabelele și funcțiile SQL rămân doar ca schemă legacy, pentru compatibilitate și
   eventuală reactivare. Aplicația nu mai expune niciun flux de programare.
3. **Datele publice sunt expuse doar prin view-uri** (`public_psychologists`, `public_specialties`,
   `public_cabinets`). Tabelele `profiles` nu sunt accesibile rolului `anon`; emailul și telefonul nu
   sunt expuse public. Coloanele sensibile nu au privilegii SELECT.
4. **Rolurile nu pot fi auto-modificate**: un trigger blochează schimbarea rolului/statusului/emailului
   din contul propriu. Administratorul folosește funcții auditate. Cheia de serviciu este folosită doar
   pe server, după verificarea sesiunii și a rolului.
5. **Mesageria folosește RLS + Realtime**. Mesajele sunt imutabile (fără UPDATE/DELETE), iar
   notificările conțin doar un text generic, niciodată conținutul mesajului.
6. **Fără tarife fixe**: interfața afișează „Prețul este în funcție de complexitate”, iar detaliile se
   discută direct cu psihologul. Platforma nu procesează plăți.
7. **E-mailul este opțional și explicit**. Fără `RESEND_API_KEY`/`EMAIL_FROM`, aplicația afișează
   „neconfigurat” și **nu simulează** trimiterea. Notificările din aplicație funcționează independent.
8. **Fără criptare end-to-end**. Comunicarea este protejată prin TLS și RLS; acest lucru este declarat
   explicit în interfață. Nu există mesagerie E2EE.

---

## 4. Structura proiectului

```
platforma-psihologi/
├─ src/
│  ├─ app/
│  │  ├─ (public)/                 pagini publice + autentificare + legal
│  │  ├─ (client)/dashboard/       zona clientului
│  │  ├─ (psychologist)/cabinet/   zona psihologului
│  │  ├─ (admin)/admin/            panoul administratorului
│  │  ├─ api/health|account/export
│  │  ├─ auth/callback|confirm/    callback Supabase Auth
│  │  ├─ layout.tsx, error.tsx, not-found.tsx, robots.ts, sitemap.ts
│  │  └─ globals.css
│  ├─ components/                  UI, formulare, chat, raportări
│  ├─ lib/
│  │  ├─ actions/                  Server Actions (Zod + RPC + audit)
│  │  ├─ data/                     interogări (public / user / admin)
│  │  ├─ supabase/                 clienți SSR, browser, admin, proxy
│  │  ├─ auth.ts, permissions.ts, time.ts, validation.ts, errors.ts
│  │  ├─ types.ts, constants.ts, email.ts, notifications.ts
│  │  └─ ...
│  └─ proxy.ts                     refresh sesiune + protecție rute
├─ supabase/
│  ├─ migrations/                  19 migrații SQL (schema, funcții, RLS, views, realtime, storage)
│  └─ tests/00_supabase_stub.sql   stub local pentru roluri/auth
├─ tests/
│  ├─ unit/logic.test.ts           14 teste
│  └─ db/rls.test.ts               27 teste PostgreSQL
├─ scripts/
│  ├─ db-setup.mjs                 PostgreSQL efemer în Docker
│  └─ db-teardown.mjs
├─ docs/                           arhitectură, securitate, GDPR, testare, lansare, producție
├─ .env.example
├─ package.json / package-lock.json
└─ README.md
```

---

## 5. Instalare pe Windows 11 (PowerShell)

### Cerințe

- Windows 11, PowerShell 7 (`pwsh`) recomandat
- **Node.js 22+** și npm (proiectul a fost verificat cu Node 24)
- **Docker Desktop** doar pentru testele de bază de date (opțional)
- Un proiect **Supabase** (plan gratuit este suficient pentru testare)

### 5.1. Pregătirea fișierelor

```powershell
# Extrage arhiva, apoi intră în folderul proiectului
cd C:\Users\<utilizator>\platforma-psihologi

# Instalează dependențele
npm install

# Creează fișierul local de mediu
Copy-Item .env.example .env.local
notepad .env.local
```

Completează în `.env.local` cel puțin:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<proiect>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon/publishable key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_PLATFORM_NAME=Platformă Psihologi
NEXT_PUBLIC_CONTACT_EMAIL=contact@domeniul-tau.ro
PLATFORM_TIMEZONE=Europe/Bucharest
```

> `SUPABASE_SERVICE_ROLE_KEY` nu trebuie prefixată cu `NEXT_PUBLIC_` și nu trebuie publicată.
> Fără ea, zona de administrare afișează un avertisment și nu poate opera.

### 5.2. Configurarea proiectului Supabase

1. Creează un proiect pe [supabase.com](https://supabase.com) și alege o **regiune din UE**
   (ex. Frankfurt) pentru a reduce transferurile internaționale.
2. Din **Project Settings → API** copiază `Project URL`, cheia publică și cheia `service_role`.
3. Aplică migrațiile. Varianta recomandată, cu Supabase CLI:

```powershell
npx supabase init
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

   Alternativ, deschide **SQL Editor** și rulează fișierele din `supabase/migrations/` în ordinea
   numelor. Nu sări peste `0010_public_views.sql`, `0011_realtime_storage.sql`,
   `0012_reference_data.sql`, `0013_psychologist_account_limit.sql`,
   `0014_add_psihooncologie_specialty.sql`, `0015_add_psihopedagogie_speciala.sql`,
   `0016_add_website_url.sql`, `0017_add_consiliere_psihologica.sql`,
   `0018_add_eating_disorders_specialty.sql` sau `0019_add_imago_couple_therapy.sql`.

4. În **Authentication → URL Configuration** setează:
   - Site URL: `http://localhost:3000` (în producție, domeniul real)
   - Redirect URLs: `http://localhost:3000/auth/callback` și
     `https://domeniul-tau.ro/auth/callback`

5. În **Authentication → Providers → Email**:
   - Activează „Confirm email” pentru producție.
   - Pentru teste locale poți dezactiva confirmarea, dar aplicația afișează în continuare pagina de
     verificare până când adresa este confirmată.

6. Creează primul administrator (o singură dată), în **SQL Editor**. Trigger-ele blochează
   modificarea rolului din aplicație, deci se dezactivează temporar trigger-ul de protecție:

```sql
alter table public.profiles disable trigger profiles_guard_update;

update public.profiles
set role = 'admin', status = 'active', requested_role = null
where id = (select id from auth.users where email = 'admin@domeniul-tau.ro');

alter table public.profiles enable trigger profiles_guard_update;
```

Contul trebuie să existe deja (înregistrare prin aplicație). Verifică apoi în aplicație că
`/admin` este accesibil.

### 5.2.1. Conturi de psiholog — maximum 12

Înregistrarea publică creează **exclusiv conturi de client**. Conturile de psiholog se acordă de
administrator, în limita a **12 conturi**:

1. Persoana își creează un cont public de client (sau administratorul creează contul din
   **Supabase → Authentication → Users**).
2. Administratorul intră în **Admin → Conturi**, schimbă rolul în **Psiholog** și salvează.
3. Psihologul completează profilul profesional din `/cabinet/profil` și îl trimite spre aprobare.

Limita este impusă în baza de date prin `0013_psychologist_account_limit.sql`; a 13-a promovare
este respinsă. Cererile publice de cont profesional sunt dezactivate, iar metadata
`requested_role` trimisă direct către Supabase Auth este ignorată.

> **Pentru proiecte Supabase existente:** rulează o singură dată
> `supabase/patches/2026-11-07-psychologist-account-limit.sql` în SQL Editor. Fără acest patch,
> limita și dezactivarea cererilor publice nu sunt active în baza de date.

> **Actualizare pentru proiecte create înainte de 24.10.2026:** rulează o singură dată
> `supabase/patches/2026-10-24-audit-fixes.sql` în SQL Editor. Patch-ul schimbă ștergerea
> programărilor la `ON DELETE CASCADE` (altfel ștergerea unui psiholog cu programări eșuează) și
> acordă cheii de serviciu acces la view-urile publice. Instalările noi nu au nevoie de el.

### 5.3. Date reale de producție

Proiectul **nu mai include date demonstrative** și nu are un seed public. Datele reale se introduc
astfel:

1. Administratorul creează conturile de psiholog (maximum 12), prin promovarea unor conturi de
   client existente sau prin Supabase Auth.
2. Fiecare psiholog își completează profilul din `/cabinet/profil` și îl trimite spre verificare.
3. Administratorul aprobă profilul din `/admin/profesioniști`.
4. Numărul public de telefon/WhatsApp se completează în cabinetul asociat, din
   `/admin/cabinete`; butonul WhatsApp apare automat pe profilul public.

Consultați [`docs/PRODUCTIE.md`](docs/PRODUCTIE.md) pentru lista completă de date necesare
(identitate, contact, date profesionale, cabinete, fotografii, date juridice).

### 5.4. Pornire

```powershell
npm run dev
```

Deschide `http://localhost:3000`.

Pentru build de producție:

```powershell
npm run build
npm start
```

---

## 6. E-mail și notificări

### 6.1. E-mailuri de autentificare (Supabase)

Confirmarea contului și resetarea parolei folosesc SMTP-ul configurat în
**Supabase → Authentication → SMTP Settings**. Fără SMTP, Supabase folosește un serviciu limitat,
nepotrivit pentru producție.

Șabloanele trebuie să folosească `{{ .ConfirmationURL }}` (sau `{{ .TokenHash }}` cu link către
`/auth/confirm`). Aplicația acceptă ambele fluxuri:

- `/auth/callback?code=...` — flux PKCE implicit;
- `/auth/confirm?token_hash=...&type=...` — pentru șabloane personalizate.

### 6.2. E-mailuri tranzacționale ale aplicației (opțional)

Se folosește [Resend](https://resend.com). Completează:

```dotenv
RESEND_API_KEY=re_...
EMAIL_FROM=Platformă Psihologi <notificari@domeniul-tau.ro>
CONTACT_INBOX_EMAIL=contact@domeniul-tau.ro
```

Comportament:

- Fără chei, panoul de administrare și paginile relevante afișează clar **„e-mail neconfigurat”**.
- Notificările din aplicație funcționează mereu.
- E-mailurile nu conțin conținutul mesajelor private sau detalii clinice; trimit doar un text generic
  și un îndemn de autentificare.
- Preferința `email_messages` (implicit dezactivată) este respectată. Coloana legacy
  `email_appointments` nu mai este folosită.
- Nu există coadă de retry; dacă furnizorul eșuează, eroarea este înregistrată în consolă și
  operațiunea din aplicație rămâne validă.

---

## 7. Roluri și fluxuri

### Client

- înregistrare publică doar ca client, confirmare e-mail, autentificare, resetare parolă;
- directoriu, căutare după specializare/oraș/limbă/tip;
- mesagerie privată cu psihologii;
- discută direct detaliile și tariful, în funcție de complexitate;
- notificări, preferințe, export date, solicitare ștergere, raportare abuz.

### Psiholog

- cont profesional activat de administrator;
- profil profesional (bio, studii, experiență, specializări, cabinete, limbi, durată);
- trimitere spre verificare și aprobare;
- conversații proprii, notificări, raportări;
- stabilește direct tariful cu persoana care îi scrie;
- nu vede datele altor psihologi sau conversațiile care nu îi aparțin.

### Administrator

- conturi, roluri și promovarea conturilor de client în psiholog (maximum 12);
- aprobare/respingere/suspendare profiluri, cu motiv și audit;
- specializări și cabinete;
- raportări de abuz, cereri GDPR, mesaje de contact;
- jurnal de audit și stare a sistemului;
- **nu** are acces la conversații private prin interfață.

---

## 8. Securitate și RLS

- RLS activat pe toate tabelele; `anon` nu are privilegii pe tabele, doar pe view-uri publice.
- `profiles` are SELECT doar pe coloane ne-sensibile; emailul/telefonul se citesc prin
  `get_my_profile()` pentru propriul cont. Administratorul folosește cheia de serviciu pe server.
- Scrierea mesajelor, notificărilor și rolurilor se face prin funcții `security definer`
  care verifică `auth.uid()` și rolul.
- Trigger-ele blochează auto-promovarea, auto-aprobarea profilului și modificarea mesajelor.
- Rate limiting persistent în DB: mesaje (20/minut, 300/zi), raportări (5/zi),
  contact (5/oră/IP), cereri GDPR (3/zi).
- Cheia de serviciu nu este expusă în bundle; `src/lib/supabase/admin.ts` importă `server-only`.
- Jurnalele nu conțin parole, tokenuri sau conținutul mesajelor.
- **Nu există criptare end-to-end.** Afirmația este evitată în interfață.

Detalii pe tabel și matricea de teste: [`docs/SECURITATE-RLS.md`](docs/SECURITATE-RLS.md).

---

## 9. Teste și verificări (rezultate reale)

Rulate la **7 noiembrie 2026**, pe Windows 11, Node 24.15, PostgreSQL 18.4 local.

| Verificare | Comandă | Rezultat |
|---|---|---|
| TypeScript strict | `npm run typecheck` | ✅ 0 erori |
| ESLint | `npm run lint` | ✅ 0 erori, 0 warnings |
| Teste unitare | `npm test` | ✅ **14/14** |
| Teste DB + RLS | `npm run test:db` (sau `vitest run tests/db` cu `TEST_DATABASE_URL`) | ✅ **27/27** |
| Build producție | `npm run build` | ✅ compilat, toate rutele generate |
| Verificare live Supabase (health, RLS, autentificare) | rulată pe proiectul configurat în `.env.local` | ✅ `/api/health` 200, izolare RLS verificată; datele demo au fost eliminate |

Testele DB acoperă RLS-ul, izolarea datelor, autentificarea/rolurile și schema legacy de programări
(păstrată în baza de date, dar eliminată din UI). Testele unitare acoperă validarea, fusul orar,
redirectările sigure și mesajele de eroare.

Pe proiectul Supabase configurat, `/api/health` răspunde 200 și politicile RLS izolează datele pe
roluri. Datele demonstrative au fost eliminate; directoriul public se completează cu profilurile
reale. E-mailul rămâne **neconfigurat** până la setarea furnizorului (`email_configured:false`).

### Cum rulezi testele DB

**Varianta A — Docker (recomandat):**

```powershell
# Docker Desktop trebuie să fie pornit
npm run test:db
npm run db:teardown
```

`db-setup.mjs` creează un container PostgreSQL 17 efemer pe portul `55432`, aplică stub-ul Supabase
și toate migrațiile. Nu atinge nicio bază existentă.

**Varianta B — PostgreSQL local:**

```powershell
$env:TEST_DATABASE_URL="postgresql://postgres:parola@127.0.0.1:5432/platforma_test"
node scripts/db-setup.mjs     # o singură dată, pe o bază goală
npx vitest run tests/db
```

Dacă baza conține deja schema, nu rula din nou `db-setup.mjs` (migrațiile creează trigger-e și
constrângeri, nu sunt concepute pentru reaplicare pe aceeași bază).

### Ce **nu** a fost testat integral

- Fluxurile de scriere end-to-end prin interfață (creare cont reală, trimitere mesaj din chat,
  aprobare din panoul admin). Logica lor este acoperită de testele DB, iar citirile/autentificarea
  au fost verificate live.
- Trimiterea reală de e-mailuri prin Resend/SMTP (furnizorul nu este configurat).
- Realtime live între două browsere (publicația și politicile sunt configurate, dar nu au fost
  testate cu un proiect real).
- Upload-ul în Supabase Storage (bucket-ul și politicile sunt în migrație).
- Teste de browser (Playwright). Nu sunt incluse.
- Scanare de securitate externă / pentest.

Aceste puncte sunt marcate și în lista de mai jos.

---

## 10. Probleme cunoscute și funcții neimplementate

1. **Fără plăți online și fără tarife fixe** — interfața afișează „Prețul este în funcție de
   complexitate”. Coloana legacy `price_ron` există în DB, dar nu este afișată și nu este editabilă.
2. **E-mail fără coadă/retry** — trimiterea este best-effort; nu există outbox sau reluare.
3. **Fără notificări push** — doar în aplicație și e-mail (dacă este configurat).
4. **Fără criptare end-to-end** — doar TLS + RLS.
5. **Retenția nu este automatizată** — nu există job de ștergere/anonimizare; administratorul
   procesează cererile manual. Termenele trebuie aprobate juridic.
6. **Ștergerea contului este hard-delete** prin Admin API, fără perioadă de grație; nu există
   anulare a cererii din interfață.
7. **Fără export CSV/PDF** — exportul este JSON.
8. **Modulul de programări a fost eliminat din aplicație.** Tabelele și funcțiile SQL rămân ca
   schemă legacy; nu există UI/API de programare. Pot fi eliminate ulterior printr-o migrație.
9. **Notificările istorice de programări** pot exista în DB; linkurile lor sunt redirecționate.
10. **Fără ștergere automată a fotografiilor vechi** din bucket-ul `avatars`.
11. **Căutarea** folosește filtre PostgREST pe view; nu există index full-text dedicat. Pentru un
    directoriu mare este necesar un index `tsvector` și o funcție de căutare.
12. **Notificările `in_app`** sunt stocate, dar nu pot fi oprite din preferințe; e-mailurile pentru
    mesaje respectă preferința `email_messages`.
13. **Textele juridice** sunt modele; operatorul, DPO, temeiurile, retenția și transferurile trebuie
    completate și verificate de un jurist.
14. **Primul administrator** se creează manual prin SQL (vezi 5.2); nu există flux de invitație.
15. **Datele reale** (administrator, 12 psihologi, cabinete, fotografii, date juridice) trebuie
    introduse conform [`docs/PRODUCTIE.md`](docs/PRODUCTIE.md).
16. **Testele DB necesită Docker sau un PostgreSQL configurat manual**; nu rulează în CI fără serviciu.
17. **Realtime** necesită ca tabelele să fie în publicația `supabase_realtime`; migrația face asta doar
    dacă publicația există (pe Supabase există).
18. **Adminul** nu are acces la conversații; o investigație legală necesită procedură separată,
    cu bază legală și documentare, nu doar cheia de serviciu.
19. **Fără CSP complet** — există headere de securitate de bază, dar nu un Content-Security-Policy
    cu nonce; de adăugat la nivel de hosting dacă este necesar.
20. **Contul de administrator** trebuie înlocuit cu adresa și identitatea reale înainte de lansare;
    contul demo folosit la configurare nu mai este potrivit pentru producție.

---

## 11. GDPR — elemente de verificat înainte de lansare

- Identificarea operatorului, a DPO-ului și a temeiurilor legale.
- Alegerea regiunii Supabase/hosting în SEE și evaluarea transferurilor internaționale.
- Contracte DPA cu Supabase, furnizorul de hosting și Resend.
- Termene de retenție pentru conturi, mesaje, jurnale și backup-uri.
- Procedura pentru acces/export/ștergere și excepțiile legale.
- Informarea minorilor și politica privind vârsta minimă.
- Șabloanele de e-mail și textele de consimțământ.
- Evaluarea riscului pentru datele din mesagerie (pot conține informații despre sănătate).

**Nu se poate afirma că implementarea tehnică garantează conformitatea GDPR.** Vezi
[`docs/GDPR.md`](docs/GDPR.md).

---

## 12. Publicare

### Vercel (recomandat)

1. Importă repository-ul în Vercel.
2. Adaugă variabilele din `.env.local` în **Project Settings → Environment Variables**
   (`SUPABASE_SERVICE_ROLE_KEY` doar ca secret server-side).
3. Setează `NEXT_PUBLIC_SITE_URL=https://www.psihologipentrufamilie.com`.
4. În Supabase → Authentication → URL Configuration setează Site URL
   `https://www.psihologipentrufamilie.com` și Redirect URLs
   `https://www.psihologipentrufamilie.com/**`.
5. Rulează build-ul; verifică `/api/health`.
6. Verifică din nou politicile RLS pe proiectul de producție (nu doar local).

### Server propriu (Windows/Linux)

```powershell
npm ci
npm run build
npm start
```

Folosește un reverse proxy cu HTTPS (IIS/Nginx/Caddy) și setează `NEXT_PUBLIC_SITE_URL` la domeniul
public. Nu expune niciodată cheia de serviciu în client.

---

## 13. Comenzi utile

```powershell
npm run dev            # dezvoltare
npm run build          # build producție
npm start              # server producție
npm run typecheck      # TypeScript strict
npm run lint           # ESLint
npm test               # teste unitare
npm run test:db        # PostgreSQL + migrații + teste RLS (Docker)
npm run db:teardown    # oprește containerul de test
npm run check          # typecheck + lint + unitare + build
```

---

## 14. Documentație suplimentară

- [`docs/ARHITECTURA.md`](docs/ARHITECTURA.md) — decizii, fluxuri, funcții RPC.
- [`docs/BAZA-DE-DATE.md`](docs/BAZA-DE-DATE.md) — tabele, relații, constrângeri, indexuri, RLS.
- [`docs/SECURITATE-RLS.md`](docs/SECURITATE-RLS.md) — matricea de acces și testele.
- [`docs/GDPR.md`](docs/GDPR.md) — harta datelor, retenție, furnizori, checklist.
- [`docs/TESTARE.md`](docs/TESTARE.md) — ce s-a rulat, rezultate, limite.
- [`docs/LANSARE.md`](docs/LANSARE.md) — checklist de producție.

---

## 15. Contact și licență

Denumire de lucru: **Platformă Psihologi**. Codul a fost creat pentru acest proiect; înainte de
publicare stabilește titularii drepturilor, licența și datele operatorului.
